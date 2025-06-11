import { Request, Response } from 'express';
import { prisma } from '../index';
import { sendSuccess, sendError } from '../utils/responseHandler';

// Interfaces based on Prisma schema
interface AcademicGoal {
  id: string;
  title: string;
  description?: string | null;
  targetDate: Date;
  category: string;
  progress: number;
  userId: string;
  milestones: Milestone[];
}

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date | null;
  goalId: string;
}

// Get all academic goals for current user
export const getAcademicGoals = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { category } = req.query;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const whereClause: any = { userId };
    
    // Add category filter if provided
    if (category && category !== 'all') {
      whereClause.category = String(category);
    }

    const goals = await prisma.academicGoal.findMany({
      where: whereClause,
      include: {
        milestones: true,
      },
      orderBy: { targetDate: 'asc' },
    });

    return sendSuccess(
      res,
      goals,
      'Academic goals retrieved successfully'
    );
  } catch (error) {
    console.error('Error getting academic goals:', error);
    return sendError(res, 'Error getting academic goals');
  }
};

// Get a specific academic goal
export const getAcademicGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const goal = await prisma.academicGoal.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        milestones: true,
      },
    });

    if (!goal) {
      return sendError(res, 'Academic goal not found', 404);
    }

    return sendSuccess(
      res,
      goal,
      'Academic goal retrieved successfully'
    );
  } catch (error) {
    console.error('Error getting academic goal:', error);
    return sendError(res, 'Error getting academic goal');
  }
};

// Create a new academic goal
export const createAcademicGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { title, description, targetDate, category, progress, milestones } = req.body;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Validate required fields
    if (!title || !targetDate) {
      return sendError(res, 'Title and target date are required', 400);
    }

    // Create transaction to handle both goal and milestone creation
    const newGoal = await prisma.$transaction(async (prisma) => {
      // Create the goal
      const goal = await prisma.academicGoal.create({
        data: {
          title,
          description,
          targetDate: new Date(targetDate),
          category: category || 'academic',
          progress: progress || 0,
          userId,
        },
      });

      // Create the milestones if provided
      if (milestones && Array.isArray(milestones) && milestones.length > 0) {
        await prisma.milestone.createMany({
          data: milestones.map((milestone: any) => ({
            title: milestone.title,
            completed: milestone.completed || false,
            dueDate: milestone.dueDate ? new Date(milestone.dueDate) : null,
            goalId: goal.id,
          })),
        });
      }

      // Return the created goal with its milestones
      return prisma.academicGoal.findUnique({
        where: { id: goal.id },
        include: { milestones: true },
      });
    });

    return sendSuccess(
      res,
      newGoal,
      'Academic goal created successfully',
      201
    );
  } catch (error) {
    console.error('Error creating academic goal:', error);
    return sendError(res, 'Error creating academic goal');
  }
};

// Update an academic goal
export const updateAcademicGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { title, description, targetDate, category, progress, milestones } = req.body;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Check if goal exists and belongs to user
    const existingGoal = await prisma.academicGoal.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        milestones: true,
      },
    });

    if (!existingGoal) {
      return sendError(res, 'Academic goal not found', 404);
    }

    // Update transaction to handle both goal and milestone updates
    const updatedGoal = await prisma.$transaction(async (prisma) => {
      // Update the goal
      const goal = await prisma.academicGoal.update({
        where: { id },
        data: {
          title: title || existingGoal.title,
          description: description !== undefined ? description : existingGoal.description,
          targetDate: targetDate ? new Date(targetDate) : existingGoal.targetDate,
          category: category || existingGoal.category,
          progress: progress !== undefined ? progress : existingGoal.progress,
        },
      });

      // Handle milestones if provided
      if (milestones && Array.isArray(milestones)) {
        // Delete existing milestones
        await prisma.milestone.deleteMany({
          where: { goalId: id },
        });

        // Create new milestones
        if (milestones.length > 0) {
          await prisma.milestone.createMany({
            data: milestones.map((milestone: any) => ({
              title: milestone.title,
              completed: milestone.completed || false,
              dueDate: milestone.dueDate ? new Date(milestone.dueDate) : null,
              goalId: goal.id,
            })),
          });
        }
      }

      // Return the updated goal with its milestones
      return prisma.academicGoal.findUnique({
        where: { id: goal.id },
        include: { milestones: true },
      });
    });

    return sendSuccess(
      res,
      updatedGoal,
      'Academic goal updated successfully'
    );
  } catch (error) {
    console.error('Error updating academic goal:', error);
    return sendError(res, 'Error updating academic goal');
  }
};

// Delete an academic goal
export const deleteAcademicGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Check if goal exists and belongs to user
    const existingGoal = await prisma.academicGoal.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingGoal) {
      return sendError(res, 'Academic goal not found', 404);
    }

    // Delete goal (milestones will be deleted via cascade)
    await prisma.academicGoal.delete({
      where: { id },
    });

    return sendSuccess(res, null, 'Academic goal deleted successfully');
  } catch (error) {
    console.error('Error deleting academic goal:', error);
    return sendError(res, 'Error deleting academic goal');
  }
};

// Update a milestone's completion status
export const updateMilestoneStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id, milestoneId } = req.params;
    const { completed } = req.body;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Check if goal exists and belongs to user
    const existingGoal = await prisma.academicGoal.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        milestones: true,
      },
    });

    if (!existingGoal) {
      return sendError(res, 'Academic goal not found', 404);
    }

    // Check if milestone exists and belongs to goal
    const milestone = existingGoal.milestones.find(m => m.id === milestoneId);
    
    if (!milestone) {
      return sendError(res, 'Milestone not found', 404);
    }

    // Update milestone status
    const updatedMilestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        completed: completed !== undefined ? completed : !milestone.completed,
      },
    });

    // Calculate new progress based on completed milestones
    const allMilestones = await prisma.milestone.findMany({
      where: { goalId: id },
    });
    
    const totalMilestones = allMilestones.length;
    const completedMilestones = allMilestones.filter(m => m.completed).length;
    const newProgress = totalMilestones > 0 
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : existingGoal.progress;

    // Update goal progress
    await prisma.academicGoal.update({
      where: { id },
      data: {
        progress: newProgress,
      },
    });

    return sendSuccess(
      res,
      updatedMilestone,
      'Milestone updated successfully'
    );
  } catch (error) {
    console.error('Error updating milestone:', error);
    return sendError(res, 'Error updating milestone');
  }
}; 