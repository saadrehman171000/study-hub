import { Request, Response } from 'express';
import { prisma } from '../index';
import { sendSuccess, sendError } from '../utils/responseHandler';

// Get all calendar events for current user
export const getCalendarEvents = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { startDate, endDate } = req.query;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Build date range filter if provided
    let whereClause: any = { userId };
    
    if (startDate && endDate) {
      whereClause.startTime = {
        gte: new Date(String(startDate)),
        lte: new Date(String(endDate)),
      };
    } else if (startDate) {
      whereClause.startTime = {
        gte: new Date(String(startDate)),
      };
    }

    const events = await prisma.calendarEvent.findMany({
      where: whereClause,
      orderBy: { startTime: 'asc' },
    });

    return sendSuccess(res, events, 'Calendar events retrieved successfully');
  } catch (error) {
    console.error('Error getting calendar events:', error);
    return sendError(res, 'Error getting calendar events');
  }
};

// Get a specific calendar event
export const getCalendarEvent = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const event = await prisma.calendarEvent.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!event) {
      return sendError(res, 'Calendar event not found', 404);
    }

    return sendSuccess(res, event, 'Calendar event retrieved successfully');
  } catch (error) {
    console.error('Error getting calendar event:', error);
    return sendError(res, 'Error getting calendar event');
  }
};

// Create a new calendar event
export const createCalendarEvent = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { title, description, startTime, endTime, allDay, type, location } = req.body;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Simple validation
    if (!title || !startTime) {
      return sendError(res, 'Title and start time are required', 400);
    }

    const newEvent = await prisma.calendarEvent.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        allDay: allDay || false,
        type,
        userId,
        location,
      },
    });

    return sendSuccess(
      res,
      newEvent,
      'Calendar event created successfully',
      201
    );
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return sendError(res, 'Error creating calendar event');
  }
};

// Update a calendar event
export const updateCalendarEvent = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { title, description, startTime, endTime, allDay, type, location } = req.body;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Check if event exists and belongs to user
    const existingEvent = await prisma.calendarEvent.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingEvent) {
      return sendError(res, 'Calendar event not found', 404);
    }

    // Update event
    const updatedEvent = await prisma.calendarEvent.update({
      where: { id },
      data: {
        title,
        description,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : null,
        allDay,
        type,
        location,
      },
    });

    return sendSuccess(
      res,
      updatedEvent,
      'Calendar event updated successfully'
    );
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return sendError(res, 'Error updating calendar event');
  }
};

// Delete a calendar event
export const deleteCalendarEvent = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Check if event exists and belongs to user
    const existingEvent = await prisma.calendarEvent.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingEvent) {
      return sendError(res, 'Calendar event not found', 404);
    }

    // Delete event
    await prisma.calendarEvent.delete({
      where: { id },
    });

    return sendSuccess(res, null, 'Calendar event deleted successfully');
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return sendError(res, 'Error deleting calendar event');
  }
}; 