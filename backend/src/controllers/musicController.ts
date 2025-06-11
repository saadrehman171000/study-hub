import { Request, Response } from 'express';
import { prisma } from '../index';
import { sendSuccess, sendError } from '../utils/responseHandler';

// Interface for MusicTrack based on Prisma schema
interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  category: string;
  coverImage?: string | null;
  audioSrc: string;
}

// Get all music tracks
export const getMusicTracks = async (req: Request, res: Response) => {
  try {
    // Optional category filter
    const { category } = req.query;
    
    const whereClause = category && category !== 'all' 
      ? { category: String(category) } 
      : {};

    const tracks = await prisma.musicTrack.findMany({
      where: whereClause,
      orderBy: { title: 'asc' },
    });

    return sendSuccess(
      res,
      tracks,
      'Music tracks retrieved successfully'
    );
  } catch (error) {
    console.error('Error getting music tracks:', error);
    return sendError(res, 'Error getting music tracks');
  }
};

// Get a specific music track
export const getMusicTrack = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const track = await prisma.musicTrack.findUnique({
      where: { id },
    });

    if (!track) {
      return sendError(res, 'Music track not found', 404);
    }

    return sendSuccess(
      res,
      track,
      'Music track retrieved successfully'
    );
  } catch (error) {
    console.error('Error getting music track:', error);
    return sendError(res, 'Error getting music track');
  }
};

// Create a new music track (admin only)
export const createMusicTrack = async (req: Request, res: Response) => {
  try {
    const { title, artist, duration, category, coverImage, audioSrc } = req.body;

    // Validate required fields
    if (!title || !artist || !duration || !category || !audioSrc) {
      return sendError(res, 'Missing required fields', 400);
    }

    const track = await prisma.musicTrack.create({
      data: {
        title,
        artist,
        duration,
        category,
        coverImage,
        audioSrc,
      },
    });

    return sendSuccess(
      res,
      track,
      'Music track created successfully',
      201
    );
  } catch (error) {
    console.error('Error creating music track:', error);
    return sendError(res, 'Error creating music track');
  }
};

// Update a music track (admin only)
export const updateMusicTrack = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, artist, duration, category, coverImage, audioSrc } = req.body;

    // Check if track exists
    const existingTrack = await prisma.musicTrack.findUnique({
      where: { id },
    });

    if (!existingTrack) {
      return sendError(res, 'Music track not found', 404);
    }

    // Update the track
    const updatedTrack = await prisma.musicTrack.update({
      where: { id },
      data: {
        title: title || existingTrack.title,
        artist: artist || existingTrack.artist,
        duration: duration || existingTrack.duration,
        category: category || existingTrack.category,
        coverImage: coverImage !== undefined ? coverImage : existingTrack.coverImage,
        audioSrc: audioSrc || existingTrack.audioSrc,
      },
    });

    return sendSuccess(
      res,
      updatedTrack,
      'Music track updated successfully'
    );
  } catch (error) {
    console.error('Error updating music track:', error);
    return sendError(res, 'Error updating music track');
  }
};

// Delete a music track (admin only)
export const deleteMusicTrack = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if track exists
    const existingTrack = await prisma.musicTrack.findUnique({
      where: { id },
    });

    if (!existingTrack) {
      return sendError(res, 'Music track not found', 404);
    }

    // Delete the track
    await prisma.musicTrack.delete({
      where: { id },
    });

    return sendSuccess(res, null, 'Music track deleted successfully');
  } catch (error) {
    console.error('Error deleting music track:', error);
    return sendError(res, 'Error deleting music track');
  }
};

// Seed initial music tracks (development only)
export const seedMusicTracks = async (req: Request, res: Response) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(__dirname, '../../uploads');

    // Delete existing tracks first
    await prisma.musicTrack.deleteMany({});

    // Read all .mp3 files in uploads directory
    const files = fs.readdirSync(uploadsDir).filter((f: string) => f.endsWith('.mp3'));

    // Mapping for known files: filename (without extension) => { title, artist, category }
    const trackMeta: Record<string, { title: string, artist: string, category: string }> = {
      'ASHUTOSH-Jaipur(chosic.com)': { title: 'Jaipur', artist: 'ASHUTOSH', category: 'focus' },
      'barradeen-bedtime-after-a-coffee(chosic.com)': { title: 'Bedtime After A Coffee', artist: 'Barradeen', category: 'chill' },
      'Beloved(chosic.com)': { title: 'Beloved', artist: 'Keys of Moon', category: 'ambient' },
      'Crescent-Moon(chosic.com)': { title: 'Crescent Moon', artist: 'Keys of Moon', category: 'ambient' },
      'Deal-chosic.com_': { title: 'Deal', artist: 'Keys of Moon', category: 'focus' },
      'Evening-Improvisation-with-Ethera(chosic.com)': { title: 'Evening Improvisation', artist: 'Ethera', category: 'chill' },
      'Heart-Of-The-Ocean(chosic.com)': { title: 'Heart Of The Ocean', artist: 'Keys of Moon', category: 'ambient' },
      'Inspire-ashutosh(chosic.com)': { title: 'Inspire', artist: 'ASHUTOSH', category: 'focus' },
      'keys-of-moon-white-petals(chosic.com)': { title: 'White Petals', artist: 'Keys of Moon', category: 'classical' },
      'Lost-and-Found(chosic.com)': { title: 'Lost and Found', artist: 'Keys of Moon', category: 'chill' },
      'Lovely-Long-Version-chosic.com_': { title: 'Lovely (Long Version)', artist: 'Keys of Moon', category: 'focus' },
      'Midnight-Stroll-Lofi-Study-Music(chosic.com)': { title: 'Midnight Stroll (Lofi)', artist: 'Chosic', category: 'lo-fi' },
      'Missing-You(chosic.com)': { title: 'Missing You', artist: 'Keys of Moon', category: 'ambient' },
      'Powerful-Trap-(chosic.com)': { title: 'Powerful Trap', artist: 'Chosic', category: 'focus' },
      'storm-clouds-purpple-cat(chosic.com)': { title: 'Storm Clouds', artist: 'Purple Cat', category: 'ambient' },
      'Tokyo-Music-Walker-Brunch-For-Two-chosic.com_': { title: 'Brunch For Two', artist: 'Tokyo Music Walker', category: 'lo-fi' },
      'tokyo-music-walker-sunset-drive-chosic.com_': { title: 'Sunset Drive', artist: 'Tokyo Music Walker', category: 'lo-fi' },
      'When-I-Was-A-Boy(chosic.com)': { title: 'When I Was A Boy', artist: 'Chosic', category: 'ambient' },
    };

    const sampleTracks = files.map((file: string) => {
      const name = path.parse(file).name;
      const meta = trackMeta[name];
      if (meta) {
        return {
          title: meta.title,
          artist: meta.artist,
          duration: '0:00',
          category: meta.category,
          coverImage: '/placeholder.svg?height=80&width=80',
          audioSrc: `http://localhost:3005/uploads/${file}`
        };
      }
      // Fallback: parse from filename
      const dashIndex = name.indexOf('-');
      let artist = 'Unknown';
      let title = name;
      if (dashIndex > 0) {
        artist = name.substring(0, dashIndex);
        title = name.substring(dashIndex + 1);
      }
      return {
        title,
        artist,
        duration: '0:00',
        category: 'uncategorized',
        coverImage: '/placeholder.svg?height=80&width=80',
        audioSrc: `http://localhost:3005/uploads/${file}`
      };
    });

    // Insert sample tracks
    if (sampleTracks.length > 0) {
      await prisma.musicTrack.createMany({
        data: sampleTracks
      });
    }

    return sendSuccess(
      res,
      null,
      `Music tracks seeded successfully (${sampleTracks.length} tracks)`
    );
  } catch (error) {
    console.error('Error seeding music tracks:', error);
    return sendError(res, 'Error seeding music tracks');
  }
};