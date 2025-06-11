import { ApiClient } from './apiClient';

export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
}

export interface UserProfileUpdate {
  firstName?: string;
  lastName?: string;
}

export interface SyncUserResponse {
  user: User;
  token: string;
}

export const createUserService = (apiClient: ApiClient) => {
  return {
    /**
     * Sync user data with Clerk - doesn't require auth token
     */
    syncUser: async (userData: {
      clerkId: string;
      email: string;
      firstName?: string;
      lastName?: string;
      profilePicture?: string;
    }): Promise<SyncUserResponse> => {
      try {
        console.log('Syncing user data:', userData);
        
        const response = await fetch('http://localhost:8000/api/users/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Sync response:', data);
        
        // Store the token in localStorage directly
        if (data.data && data.data.token) {
          localStorage.setItem('study_hub_jwt', data.data.token);
          console.log('Token stored in localStorage');
          
          // Set the token in the apiClient if available
          if (apiClient.setAuthToken) {
            apiClient.setAuthToken(data.data.token);
          }
        }
        
        return data.data;
      } catch (error) {
        console.error('Error syncing user:', error);
        throw error;
      }
    },

    /**
     * Get the current user's profile
     */
    getCurrentUser: async (): Promise<User> => {
      const { data } = await apiClient.get('/users/me');
      return data;
    },

    /**
     * Update the current user's profile
     */
    updateProfile: async (profileData: UserProfileUpdate): Promise<User> => {
      const { data } = await apiClient.put('/users/profile', profileData);
      return data;
    }
  };
};

export type UserService = ReturnType<typeof createUserService>; 