import { ApiClient } from './apiClient';

// Define interfaces for music tracks
export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  category: string;
  coverImage?: string;
  audioSrc: string;
}

export interface MusicService {
  getMusicTracks: (category?: string) => Promise<MusicTrack[]>;
  getMusicTrack: (id: string) => Promise<MusicTrack>;
}

export function createMusicService(apiClient: ApiClient): MusicService {
  return {
    getMusicTracks: async (category?: string) => {
      const queryParams = category && category !== 'all' ? `?category=${category}` : '';
      const { data } = await apiClient.get<MusicTrack[]>(`/music${queryParams}`);
      return data;
    },
    
    getMusicTrack: async (id: string) => {
      const { data } = await apiClient.get<MusicTrack>(`/music/${id}`);
      return data;
    }
  };
} 