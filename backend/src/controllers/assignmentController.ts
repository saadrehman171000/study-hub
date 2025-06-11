import { Request, Response } from 'express';
import { prisma } from '../index';
import { sendSuccess, sendError } from '../utils/responseHandler';

// Get all assignments for current user
export const getAssignments = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const assignments = await prisma.assignment.findMany({
      where: { userId },
      orderBy: { dueDate: 'asc' },
    });

    return sendSuccess(res, assignments, 'Assignments retrieved successfully');
  } catch (error) {
    console.error('Error getting assignments:', error);
    return sendError(res, 'Error getting assignments');
  }
};

// Get specific assignment
export const getAssignment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const assignment = await prisma.assignment.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!assignment) {
      return sendError(res, 'Assignment not found', 404);
    }

    return sendSuccess(res, assignment, 'Assignment retrieved successfully');
  } catch (error) {
    console.error('Error getting assignment:', error);
    return sendError(res, 'Error getting assignment');
  }
};

// Create new assignment
export const createAssignment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const { title, description, dueDate, status, subject, priority } = req.body;

    // Simple validation
    if (!title || !dueDate) {
      return sendError(res, 'Title and due date are required', 400);
    }

    const newAssignment = await prisma.assignment.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        status: status || 'not-started',
        subject,
        priority: priority || 'medium',
        userId,
      },
    });

    return sendSuccess(
      res,
      newAssignment,
      'Assignment created successfully',
      201
    );
  } catch (error) {
    console.error('Error creating assignment:', error);
    return sendError(res, 'Error creating assignment');
  }
};

// Update assignment
export const updateAssignment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { title, description, dueDate, status, subject, priority } = req.body;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Check if assignment exists and belongs to user
    const existingAssignment = await prisma.assignment.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingAssignment) {
      return sendError(res, 'Assignment not found', 404);
    }

    // Update assignment
    const updatedAssignment = await prisma.assignment.update({
      where: { id },
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status,
        subject,
        priority,
      },
    });

    return sendSuccess(
      res,
      updatedAssignment,
      'Assignment updated successfully'
    );
  } catch (error) {
    console.error('Error updating assignment:', error);
    return sendError(res, 'Error updating assignment');
  }
};

// Delete assignment
export const deleteAssignment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Check if assignment exists and belongs to user
    const existingAssignment = await prisma.assignment.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingAssignment) {
      return sendError(res, 'Assignment not found', 404);
    }

    // Delete assignment
    await prisma.assignment.delete({
      where: { id },
    });

    return sendSuccess(res, null, 'Assignment deleted successfully');
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return sendError(res, 'Error deleting assignment');
  }
}; 