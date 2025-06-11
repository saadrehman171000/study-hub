import express from 'express';
import {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from '../controllers/assignmentController';

export const assignmentRouter = express.Router();

// Get all assignments
assignmentRouter.get('/', getAssignments);

// Get a specific assignment
assignmentRouter.get('/:id', getAssignment);

// Create a new assignment
assignmentRouter.post('/', createAssignment);

// Update an assignment
assignmentRouter.put('/:id', updateAssignment);

// Delete an assignment
assignmentRouter.delete('/:id', deleteAssignment); 