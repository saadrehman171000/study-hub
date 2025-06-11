import express from 'express';
import { 
  getAcademicGoals, 
  getAcademicGoal, 
  createAcademicGoal, 
  updateAcademicGoal, 
  deleteAcademicGoal,
  updateMilestoneStatus
} from '../controllers/academicGoalController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Goal routes
router.get('/', getAcademicGoals);
router.get('/:id', getAcademicGoal);
router.post('/', createAcademicGoal);
router.put('/:id', updateAcademicGoal);
router.delete('/:id', deleteAcademicGoal);

// Milestone routes
router.patch('/:id/milestones/:milestoneId', updateMilestoneStatus);

export default router; 