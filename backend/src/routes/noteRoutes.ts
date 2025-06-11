import express from 'express';
import {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
} from '../controllers/noteController';

export const noteRouter = express.Router();

// Get all notes
noteRouter.get('/', getNotes);

// Get a specific note
noteRouter.get('/:id', getNote);

// Create a new note
noteRouter.post('/', createNote);

// Update a note
noteRouter.put('/:id', updateNote);

// Delete a note
noteRouter.delete('/:id', deleteNote); 