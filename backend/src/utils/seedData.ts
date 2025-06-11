import { PrismaClient } from '@prisma/client';

export async function seedData(prisma: PrismaClient): Promise<void> {
  
  try {
    // Check if music tracks already exist
    const musicTracksCount = await prisma.musicTrack.count();
    
    // Only seed if no tracks exist
    if (musicTracksCount === 0) {
      
      // Seed music tracks
      await prisma.musicTrack.createMany({
        data: [
          {
            title: 'Lo-Fi Study Beats',
            artist: 'ChillHop',
            duration: '3:45',
            category: 'focus',
            coverImage: '/placeholder.svg?height=80&width=80',
            audioSrc: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3'
          },
          {
            title: 'Deep Focus',
            artist: 'Ambient Sounds',
            duration: '4:20',
            category: 'focus',
            coverImage: '/placeholder.svg?height=80&width=80',
            audioSrc: 'https://samplelib.com/lib/preview/mp3/sample-6s.mp3'
          },
          {
            title: 'Nature Sounds',
            artist: 'Relaxation',
            duration: '5:10',
            category: 'nature',
            coverImage: '/placeholder.svg?height=80&width=80',
            audioSrc: 'https://samplelib.com/lib/preview/mp3/sample-9s.mp3'
          },
          {
            title: 'Rain Sounds',
            artist: 'Nature Ambience',
            duration: '6:30',
            category: 'nature',
            coverImage: '/placeholder.svg?height=80&width=80',
            audioSrc: 'https://samplelib.com/lib/preview/mp3/sample-12s.mp3'
          },
          {
            title: 'Classical Piano',
            artist: 'Classical Mix',
            duration: '4:15',
            category: 'classical',
            coverImage: '/placeholder.svg?height=80&width=80',
            audioSrc: 'https://samplelib.com/lib/preview/mp3/sample-15s.mp3'
          }
        ]
      });
    } else {
      
    }
  } catch (error) {
    
  }
  
  // Add more seed data for other models if needed
} 