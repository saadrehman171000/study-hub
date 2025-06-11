import { ApiClient } from './apiClient';

// Define types for AI assistant
export interface AIMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export interface AIConversationHistory {
  messages: AIMessage[];
}

export interface AIServiceResponse {
  response: string;
  timestamp: Date;
}

export interface AIAssistantService {
  generateResponse: (assignmentId: string, query: string, files?: File[]) => Promise<AIServiceResponse>;
  getConversationHistory: (assignmentId: string) => Promise<AIMessage[]>;
}

export function createAIAssistantService(apiClient: ApiClient): AIAssistantService {
  return {
    generateResponse: async (assignmentId: string, query: string, files?: File[]) => {
      try {
        let response;
        
        // If we have files, use FormData to upload them
        if (files && files.length > 0) {
          const formData = new FormData();
          formData.append('assignmentId', assignmentId);
          formData.append('query', query);
          
          files.forEach(file => {
            formData.append('files', file);
          });
          
          response = await apiClient.postFormData('/ai/generate', formData);
        } else {
          // Regular JSON request without files
          response = await apiClient.post('/ai/generate', {
            assignmentId,
            query
          });
        }
        
        console.log("Raw API response:", response);
        
        // Handle different possible response structures from the backend
        let responseData;
        if (response.data) {
          responseData = response.data;
        } else if (response.response) {
          responseData = {
            response: response.response,
            timestamp: response.timestamp || new Date()
          };
        } else {
          // Direct structure
          responseData = {
            response: response.response || "No response available",
            timestamp: response.timestamp || new Date()
          };
        }
        
        return {
          response: responseData.response || "No response available",
          timestamp: new Date(responseData.timestamp || new Date())
        };
      } catch (error) {
        console.error('Error generating AI response:', error);
        throw new Error('Failed to generate AI response');
      }
    },
    
    getConversationHistory: async (assignmentId: string) => {
      try {
        const response = await apiClient.get(`/ai/history/${assignmentId}`);
        
        // Handle different possible response structures
        let messages = [];
        
        if (response.data && Array.isArray(response.data)) {
          // Direct array of messages
          messages = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          // Nested data array
          messages = response.data.data;
        } else if (response.data && response.data.messages) {
          // Messages property in data
          messages = response.data.messages;
        } else {
          // Empty array as fallback
          messages = [];
        }
        
        // Convert timestamps to Date objects
        return messages.map((msg: any) => ({
          role: msg.role,
          text: msg.text,
          timestamp: new Date(msg.timestamp)
        }));
      } catch (error) {
        console.error('Error fetching conversation history:', error);
        throw new Error('Failed to fetch conversation history');
      }
    }
  };
} 