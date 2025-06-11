import express from 'express';
import { syncUser, getCurrentUser, updateUserProfile } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';

export const userRouter = express.Router();

// Public route for clerk auth sync
userRouter.post('/sync', syncUser);

// Protected routes
userRouter.get('/me', authMiddleware, getCurrentUser);
userRouter.put('/profile', authMiddleware, updateUserProfile); 