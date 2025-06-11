import express from 'express';
import { aiAssistantController, upload } from '../controllers/aiAssistantController';
import { authMiddleware } from '../middleware/authMiddleware';
import { body, param } from 'express-validator';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Generate AI response
router.post(
  '/generate',
  upload.array('files', 5), // Allow up to 5 files
  [
    body('assignmentId').notEmpty().withMessage('Assignment ID is required'),
    body('query').notEmpty().withMessage('Query is required')
  ],
  aiAssistantController.generateResponse
);

// Get conversation history
router.get(
  '/history/:assignmentId',
  [
    param('assignmentId').notEmpty().withMessage('Assignment ID is required')
  ],
  aiAssistantController.getConversationHistory
);

export const aiAssistantRouter = router;