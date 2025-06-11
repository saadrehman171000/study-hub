import express from 'express';
import {
  getCalendarEvents,
  getCalendarEvent,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '../controllers/calendarController';

export const calendarRouter = express.Router();

// Get all calendar events
calendarRouter.get('/', getCalendarEvents);

// Get a specific calendar event
calendarRouter.get('/:id', getCalendarEvent);

// Create a new calendar event
calendarRouter.post('/', createCalendarEvent);

// Update a calendar event
calendarRouter.put('/:id', updateCalendarEvent);

// Delete a calendar event
calendarRouter.delete('/:id', deleteCalendarEvent); 