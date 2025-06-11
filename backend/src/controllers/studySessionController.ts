import { Request, Response } from 'express';
import { prisma } from '../index';
import { sendSuccess, sendError } from '../utils/responseHandler';

// Define interfaces based on Prisma schema
interface StudySession {
  id: string;
  startTime: Date;
  endTime: Date | null;
  duration: number | null;
  subject: string | null;
  userId: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  status: string;
  priority: string | null;
  userId: string;
  updatedAt: Date;
}

// Get all study sessions for current user
export const getStudySessions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const studySessions = await prisma.studySession.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
    });

    return sendSuccess(
      res,
      studySessions,
      'Study sessions retrieved successfully'
    );
  } catch (error) {
    console.error('Error getting study sessions:', error);
    return sendError(res, 'Error getting study sessions');
  }
};

// Get a specific study session
export const getStudySession = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const studySession = await prisma.studySession.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!studySession) {
      return sendError(res, 'Study session not found', 404);
    }

    return sendSuccess(
      res,
      studySession,
      'Study session retrieved successfully'
    );
  } catch (error) {
    console.error('Error getting study session:', error);
    return sendError(res, 'Error getting study session');
  }
};

// Start a new study session
export const startStudySession = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { subject } = req.body;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Create a new study session
    const studySession = await prisma.studySession.create({
      data: {
        startTime: new Date(),
        subject,
        userId,
      },
    });

    return sendSuccess(
      res,
      studySession,
      'Study session started successfully',
      201
    );
  } catch (error) {
    console.error('Error starting study session:', error);
    return sendError(res, 'Error starting study session');
  }
};

// End a study session
export const endStudySession = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Find the study session
    const studySession = await prisma.studySession.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!studySession) {
      return sendError(res, 'Study session not found', 404);
    }

    if (studySession.endTime) {
      return sendError(res, 'Study session already ended', 400);
    }

    // Calculate duration in minutes
    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - studySession.startTime.getTime()) / (1000 * 60)
    );

    // Update the study session
    const updatedSession = await prisma.studySession.update({
      where: { id },
      data: {
        endTime,
        duration,
      },
    });

    return sendSuccess(
      res,
      updatedSession,
      'Study session ended successfully'
    );
  } catch (error) {
    console.error('Error ending study session:', error);
    return sendError(res, 'Error ending study session');
  }
};

// Delete a study session
export const deleteStudySession = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Check if study session exists and belongs to user
    const existingSession = await prisma.studySession.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingSession) {
      return sendError(res, 'Study session not found', 404);
    }

    // Delete the study session
    await prisma.studySession.delete({
      where: { id },
    });

    return sendSuccess(res, null, 'Study session deleted successfully');
  } catch (error) {
    console.error('Error deleting study session:', error);
    return sendError(res, 'Error deleting study session');
  }
};

// Get analytics data
export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { timeframe } = req.query; // 'daily', 'weekly', 'monthly'

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Default to weekly if no timeframe provided
    const timeframeValue = timeframe ? String(timeframe) : 'weekly';
    
    let dateFilter: any = {};
    const now = new Date();
    
    // Set date filter based on timeframe
    switch (timeframeValue) {
      case 'daily':
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        dateFilter = { gte: yesterday };
        break;
      case 'weekly':
        const lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() - 7);
        dateFilter = { gte: lastWeek };
        break;
      case 'monthly':
        const lastMonth = new Date(now);
        lastMonth.setMonth(now.getMonth() - 1);
        dateFilter = { gte: lastMonth };
        break;
      default:
        const defaultPeriod = new Date(now);
        defaultPeriod.setDate(now.getDate() - 7);
        dateFilter = { gte: defaultPeriod };
    }

    // Get completed study sessions
    const studySessions = await prisma.studySession.findMany({
      where: {
        userId,
        startTime: dateFilter,
        endTime: { not: null },
      },
    });

    // Get assignments data
    const assignments = await prisma.assignment.findMany({
      where: {
        userId,
        updatedAt: dateFilter,
      },
    });
    
    // Calculate total study time
    const totalStudyTime = studySessions.reduce((acc: number, session: StudySession) => {
      return acc + (session.duration || 0);
    }, 0);
    
    // Calculate completed assignments
    const completedAssignments = assignments.filter(
      (assignment: Assignment) => assignment.status === 'completed'
    ).length;
    
    // Calculate study time by subject
    const studyTimeBySubject: Record<string, number> = {};
    
    studySessions.forEach((session: StudySession) => {
      const subject = session.subject || 'Unspecified';
      
      if (!studyTimeBySubject[subject]) {
        studyTimeBySubject[subject] = 0;
      }
      
      studyTimeBySubject[subject] += session.duration || 0;
    });
    
    // Create analytics object
    const analytics = {
      totalStudyTime,
      totalSessions: studySessions.length,
      completedAssignments,
      studyTimeBySubject,
    };
    
    return sendSuccess(res, analytics, 'Analytics retrieved successfully');
  } catch (error) {
    console.error('Error getting analytics:', error);
    return sendError(res, 'Error getting analytics');
  }
};