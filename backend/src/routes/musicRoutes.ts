import express from 'express';
import { 
  getMusicTracks, 
  getMusicTrack, 
  createMusicTrack, 
  updateMusicTrack, 
  deleteMusicTrack, 
  seedMusicTracks 
} from '../controllers/musicController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Development route for seeding data
router.post('/seed', seedMusicTracks);

// Public routes (no authentication required)
router.get('/', getMusicTracks);
router.get('/:id', getMusicTrack);

// Admin routes (protected - only admin would be able to manage music)
router.post('/', authMiddleware, createMusicTrack);
router.put('/:id', authMiddleware, updateMusicTrack);
router.delete('/:id', authMiddleware, deleteMusicTrack);

export default router; 