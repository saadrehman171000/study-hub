import { ApiClient } from './apiClient';

// Define interfaces for academic goals
export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  goalId?: string;
}

export interface AcademicGoal {
  id: string;
  title: string;
  description?: string;
  targetDate: string;
  category: string;
  progress: number;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export interface AcademicGoalCreate {
  title: string;
  description?: string;
  targetDate: string;
  category: string;
  progress: number;
  milestones: Omit<Milestone, 'id' | 'goalId'>[];
}

export interface AcademicGoalUpdate {
  title?: string;
  description?: string;
  targetDate?: string;
  category?: string;
  progress?: number;
  milestones?: Omit<Milestone, 'goalId'>[];
}

export interface AcademicGoalService {
  getAcademicGoals: (category?: string) => Promise<AcademicGoal[]>;
  getAcademicGoal: (id: string) => Promise<AcademicGoal>;
  createAcademicGoal: (goal: AcademicGoalCreate) => Promise<AcademicGoal>;
  updateAcademicGoal: (id: string, goal: AcademicGoalUpdate) => Promise<AcademicGoal>;
  deleteAcademicGoal: (id: string) => Promise<void>;
  updateMilestoneStatus: (goalId: string, milestoneId: string, completed: boolean) => Promise<Milestone>;
}

export function createAcademicGoalService(apiClient: ApiClient): AcademicGoalService {
  return {
    getAcademicGoals: async (category?: string) => {
      const queryParams = category && category !== 'all' ? `?category=${category}` : '';
      const response = await apiClient.get<{data: AcademicGoal[]}>(`/goals${queryParams}`);
      return response.data || [];
    },
    
    getAcademicGoal: async (id: string) => {
      const response = await apiClient.get<{data: AcademicGoal}>(`/goals/${id}`);
      return response.data;
    },
    
    createAcademicGoal: async (goal: AcademicGoalCreate) => {
      const response = await apiClient.post<{data: AcademicGoal}>('/goals', goal);
      return response.data;
    },
    
    updateAcademicGoal: async (id: string, goal: AcademicGoalUpdate) => {
      const response = await apiClient.put<{data: AcademicGoal}>(`/goals/${id}`, goal);
      return response.data;
    },
    
    deleteAcademicGoal: async (id: string) => {
      await apiClient.delete(`/goals/${id}`);
    },
    
    updateMilestoneStatus: async (goalId: string, milestoneId: string, completed: boolean) => {
      try {
        const response = await apiClient.patch<{data: Milestone}>(
          `/goals/${goalId}/milestones/${milestoneId}`,
          { completed }
        );
        
        // Handle different response structures
        if (response.data) {
          return response.data;
        } else if (response.milestone) {
          return response.milestone;
        } else {
          // If we can't find a recognized structure, return what we have
          return response as unknown as Milestone;
        }
      } catch (error) {
        console.error('Error updating milestone status:', error);
        throw new Error(`Failed to update milestone status: ${error}`);
      }
    }
  };
} 