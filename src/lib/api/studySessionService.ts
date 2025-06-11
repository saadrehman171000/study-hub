import { ApiClient } from './apiClient';

export interface StudySession {
  id: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  subject?: string;
  createdAt: string;
}

export interface AnalyticsData {
  totalStudyTime: number;
  totalSessions: number;
  completedAssignments: number;
  studyTimeBySubject: Record<string, number>;
}

export const createStudySessionService = (apiClient: ApiClient) => {
  return {
    /**
     * Get all study sessions
     */
    getStudySessions: async (): Promise<StudySession[]> => {
      const { data } = await apiClient.get('/study-sessions');
      return data;
    },

    /**
     * Get analytics data
     */
    getAnalytics: async (timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<AnalyticsData> => {
      try {
        const { data } = await apiClient.get(`/study-sessions/analytics?timeframe=${timeframe}`);
        return data;
      } catch (error) {
        console.error('Error fetching analytics:', error);
        // Return default data if API fails
        return {
          totalStudyTime: 0,
          totalSessions: 0,
          completedAssignments: 0,
          studyTimeBySubject: {}
        };
      }
    },

    /**
     * Get a specific study session
     */
    getStudySession: async (id: string): Promise<StudySession> => {
      const { data } = await apiClient.get(`/study-sessions/${id}`);
      return data;
    },

    /**
     * Start a new study session
     */
    startStudySession: async (subject?: string): Promise<StudySession> => {
      const { data } = await apiClient.post('/study-sessions/start', { subject });
      return data;
    },

    /**
     * End a study session
     */
    endStudySession: async (id: string): Promise<StudySession> => {
      const { data } = await apiClient.put(`/study-sessions/${id}/end`, {});
      return data;
    },

    /**
     * Delete a study session
     */
    deleteStudySession: async (id: string): Promise<void> => {
      await apiClient.delete(`/study-sessions/${id}`);
    }
  };
};

export type StudySessionService = ReturnType<typeof createStudySessionService>; 