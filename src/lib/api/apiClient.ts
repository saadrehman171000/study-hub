// import { useAuth } from '@clerk/clerk-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005/api';

/**
 * Helper to get stored JWT token
 */
const getStoredToken = () => {
  return localStorage.getItem('study_hub_jwt');
};

/**
 * Helper to store JWT token
 */
const storeToken = (token: string) => {
  localStorage.setItem('study_hub_jwt', token);
  console.log('Token stored:', token.substring(0, 15) + '...');
};

/**
 * Helper function to add retry functionality
 */
const fetchWithRetry = async (url: string, options: RequestInit, retries = 2, delay = 1000): Promise<Response> => {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Failed to fetch') && retries > 0) {
      console.log(`Connection error. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 1.5);
    }
    throw error;
  }
};

/**
 * Base API client for making requests to the backend
 */
export const createApiClient = (getClerkToken?: () => Promise<string | null>) => {
  // No longer using useAuth directly here
  
  const getAuthHeaders = async (isFormData = false) => {
    // First try to get the token from localStorage
    const storedToken = getStoredToken();
    
    // If no stored token, try to get from Clerk if a function was provided
    let token = storedToken;
    
    if (!token && getClerkToken) {
      try {
        token = await getClerkToken();
        console.log('Using Clerk token as fallback');
      } catch (error) {
        console.error('Error getting Clerk token:', error);
      }
    }
    
    if (!token) {
      console.warn('No authentication token available');
    } else {
      console.log('Using token:', token.substring(0, 15) + '...');
    }
    
    // Don't set Content-Type for FormData (browser sets it with boundary)
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    };
  };

  const handleResponse = async (response: Response) => {
    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || `API Error: ${response.status}`;
      } catch (e) {
        errorMessage = `API Error: ${response.status}`;
      }
      console.error('API Error:', errorMessage);
      throw new Error(errorMessage);
    }
    
    return response.json();
  };

  const handleConnectionError = (error: any, endpoint: string) => {
    const isConnectionRefused = 
      error.message.includes('Failed to fetch') || 
      error.message.includes('NetworkError') ||
      error.message.includes('ERR_CONNECTION_REFUSED');
    
    if (isConnectionRefused) {
      console.error(`Connection refused when accessing ${endpoint}. Is the backend server running?`);
      return { 
        success: false, 
        error: 'Cannot connect to server. Please ensure the backend is running.', 
        data: [] 
      };
    }
    throw error;
  };

  const client = {
    // Store JWT token from user sync response
    setAuthToken: (token: string) => {
      storeToken(token);
    },
    
    get: async <T = any>(endpoint: string) => {
      try {
        const headers = await getAuthHeaders();
        console.log(`GET ${API_BASE_URL}${endpoint}`);
        
        const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
          method: 'GET',
          headers,
        });
        
        return handleResponse(response) as Promise<T>;
      } catch (error) {
        return handleConnectionError(error, endpoint);
      }
    },
    
    post: async <T = any>(endpoint: string, data: any) => {
      try {
        const headers = await getAuthHeaders();
        console.log(`POST ${API_BASE_URL}${endpoint}`, data);
        
        const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
        });
        
        return handleResponse(response) as Promise<T>;
      } catch (error) {
        return handleConnectionError(error, endpoint);
      }
    },
    
    put: async <T = any>(endpoint: string, data: any) => {
      try {
        const headers = await getAuthHeaders();
        console.log(`PUT ${API_BASE_URL}${endpoint}`, data);
        
        const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(data),
        });
        
        return handleResponse(response) as Promise<T>;
      } catch (error) {
        return handleConnectionError(error, endpoint);
      }
    },
    
    patch: async <T = any>(endpoint: string, data: any) => {
      try {
        const headers = await getAuthHeaders();
        console.log(`PATCH ${API_BASE_URL}${endpoint}`, data);
        
        const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(data),
        });
        
        return handleResponse(response) as Promise<T>;
      } catch (error) {
        return handleConnectionError(error, endpoint);
      }
    },
    
    delete: async <T = any>(endpoint: string) => {
      try {
        const headers = await getAuthHeaders();
        console.log(`DELETE ${API_BASE_URL}${endpoint}`);
        
        const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
          method: 'DELETE',
          headers,
        });
        
        return handleResponse(response) as Promise<T>;
      } catch (error) {
        return handleConnectionError(error, endpoint);
      }
    },
    
    // File upload method that handles FormData
    postFormData: async <T = any>(endpoint: string, formData: FormData) => {
      try {
        // Get headers without Content-Type (browser will set it with boundary)
        const headers = await getAuthHeaders(true);
        console.log(`UPLOAD ${API_BASE_URL}${endpoint}`, 'FormData payload');
        
        const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers,
          body: formData,
          // Don't set Content-Type header manually for FormData
        });
        
        return handleResponse(response) as Promise<T>;
      } catch (error) {
        return handleConnectionError(error, endpoint);
      }
    },
  };

  return client;
};

export type ApiClient = ReturnType<typeof createApiClient>; 
