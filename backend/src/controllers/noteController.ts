import { Request, Response } from 'express';
import { prisma } from '../index';
import { sendSuccess, sendError } from '../utils/responseHandler';

// Get all notes for current user
export const getNotes = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { subject } = req.query;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Filter by subject if provided
    const whereClause: any = { userId };
    if (subject) {
      whereClause.subject = String(subject);
    }

    const notes = await prisma.note.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
    });

    return sendSuccess(res, notes, 'Notes retrieved successfully');
  } catch (error) {
    console.error('Error getting notes:', error);
    return sendError(res, 'Error getting notes');
  }
};

// Get a specific note
export const getNote = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const note = await prisma.note.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!note) {
      return sendError(res, 'Note not found', 404);
    }

    return sendSuccess(res, note, 'Note retrieved successfully');
  } catch (error) {
    console.error('Error getting note:', error);
    return sendError(res, 'Error getting note');
  }
};

// Create a new note
export const createNote = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { title, content, subject } = req.body;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Simple validation
    if (!title) {
      return sendError(res, 'Title is required', 400);
    }

    const newNote = await prisma.note.create({
      data: {
        title,
        content,
        subject,
        userId,
      },
    });

    return sendSuccess(res, newNote, 'Note created successfully', 201);
  } catch (error) {
    console.error('Error creating note:', error);
    return sendError(res, 'Error creating note');
  }
};

// Update a note
export const updateNote = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { title, content, subject } = req.body;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Check if note exists and belongs to user
    const existingNote = await prisma.note.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingNote) {
      return sendError(res, 'Note not found', 404);
    }

    // Update note
    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        title,
        content,
        subject,
      },
    });

    return sendSuccess(res, updatedNote, 'Note updated successfully');
  } catch (error) {
    console.error('Error updating note:', error);
    return sendError(res, 'Error updating note');
  }
};

// Delete a note
export const deleteNote = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Check if note exists and belongs to user
    const existingNote = await prisma.note.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingNote) {
      return sendError(res, 'Note not found', 404);
    }

    // Delete note
    await prisma.note.delete({
      where: { id },
    });

    return sendSuccess(res, null, 'Note deleted successfully');
  } catch (error) {
    console.error('Error deleting note:', error);
    return sendError(res, 'Error deleting note');
  }
}; 