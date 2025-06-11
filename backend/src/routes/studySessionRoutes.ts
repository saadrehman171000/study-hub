import express from 'express';
import {
  getStudySessions,
  getStudySession,
  startStudySession,
  endStudySession,
  deleteStudySession,
  getAnalytics,
} from '../controllers/studySessionController';

export const studySessionRouter = express.Router();

// Get all study sessions
studySessionRouter.get('/', getStudySessions);

// Get analytics data
studySessionRouter.get('/analytics', getAnalytics);

// Get a specific study session
studySessionRouter.get('/:id', getStudySession);

// Start a new study session
studySessionRouter.post('/start', startStudySession);

// End a study session
studySessionRouter.put('/:id/end', endStudySession);

// Delete a study session
studySessionRouter.delete('/:id', deleteStudySession); 