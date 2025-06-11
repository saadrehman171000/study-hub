import { ApiClient } from './apiClient';

export interface Resource {
  id: string;
  name: string;
  description?: string;
  type: 'folder' | 'file';
  fileUrl?: string;
  fileSize?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceCreate {
  name: string;
  description?: string;
  type: 'folder' | 'file';
  fileUrl?: string;
  fileSize?: string;
  parentId?: string;
}

export interface ResourceUpdate {
  name?: string;
  description?: string;
}

export const createResourceService = (apiClient: ApiClient) => {
  return {
    /**
     * Get all resources, optionally filtered by parent folder
     */
    getResources: async (parentId?: string): Promise<Resource[]> => {
      const endpoint = parentId ? `/resources?parentId=${parentId}` : '/resources';
      const response = await apiClient.get(endpoint);
      return response.data || [];
    },

    /**
     * Get a specific resource by ID
     */
    getResource: async (id: string): Promise<Resource> => {
      const response = await apiClient.get(`/resources/${id}`);
      return response.data;
    },

    /**
     * Create a new resource (folder or file)
     */
    createResource: async (resource: ResourceCreate): Promise<Resource> => {
      const response = await apiClient.post('/resources', resource);
      return response.data;
    },

    /**
     * Update an existing resource (name/description only)
     */
    updateResource: async (id: string, resource: ResourceUpdate): Promise<Resource> => {
      const response = await apiClient.put(`/resources/${id}`, resource);
      return response.data;
    },

    /**
     * Delete a resource
     */
    deleteResource: async (id: string): Promise<void> => {
      await apiClient.delete(`/resources/${id}`);
    },

    /**
     * Upload a file resource
     */
    uploadResource: async (formData: FormData): Promise<Resource> => {
      try {
        const response = await apiClient.postFormData('/resources/upload', formData);
        
        // Handle different response structures that might come from the backend
        if (response.data) {
          return response.data;
        } else if (response.resource) {
          return response.resource;
        } else {
          // If no recognizable structure, return the raw response as a fallback
          return response as unknown as Resource;
        }
      } catch (error) {
        console.error('Error uploading resource:', error);
        throw new Error('Failed to upload resource file');
      }
    }
  };
};

export type ResourceService = ReturnType<typeof createResourceService>;