import { ApiClient } from './apiClient';

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  status: 'not-started' | 'in-progress' | 'completed';
  subject?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentCreate {
  title: string;
  description?: string;
  dueDate: string;
  status?: 'not-started' | 'in-progress' | 'completed';
  subject?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface AssignmentUpdate {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: 'not-started' | 'in-progress' | 'completed';
  subject?: string;
  priority?: 'low' | 'medium' | 'high';
}

export const createAssignmentService = (apiClient: ApiClient) => {
  return {
    /**
     * Get all assignments
     */
    getAssignments: async (): Promise<Assignment[]> => {
      const { data } = await apiClient.get('/assignments');
      return data;
    },

    /**
     * Get a specific assignment by ID
     */
    getAssignment: async (id: string): Promise<Assignment> => {
      const { data } = await apiClient.get(`/assignments/${id}`);
      return data;
    },

    /**
     * Create a new assignment
     */
    createAssignment: async (assignment: AssignmentCreate): Promise<Assignment> => {
      const { data } = await apiClient.post('/assignments', assignment);
      return data;
    },

    /**
     * Update an existing assignment
     */
    updateAssignment: async (id: string, assignment: AssignmentUpdate): Promise<Assignment> => {
      const { data } = await apiClient.put(`/assignments/${id}`, assignment);
      return data;
    },

    /**
     * Delete an assignment
     */
    deleteAssignment: async (id: string): Promise<void> => {
      await apiClient.delete(`/assignments/${id}`);
    }
  };
};

export type AssignmentService = ReturnType<typeof createAssignmentService>; 