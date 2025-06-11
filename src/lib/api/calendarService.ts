import { ApiClient } from './apiClient';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  startTime: Date;
  endTime?: Date | null;
  allDay: boolean;
  type?: string | null;
  location?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarEventCreate {
  title: string;
  description?: string | null;
  startTime: Date | string;
  endTime?: Date | string | null;
  allDay?: boolean;
  type?: string | null;
  location?: string | null;
}

export interface CalendarEventUpdate {
  title?: string;
  description?: string | null;
  startTime?: Date | string;
  endTime?: Date | string | null;
  allDay?: boolean;
  type?: string | null;
  location?: string | null;
}

export const createCalendarService = (apiClient: ApiClient) => {
  return {
    /**
     * Get all calendar events, optionally filtered by date range
     */
    getCalendarEvents: async (startDate?: string, endDate?: string): Promise<CalendarEvent[]> => {
      let endpoint = '/calendar';
      
      if (startDate && endDate) {
        endpoint += `?startDate=${startDate}&endDate=${endDate}`;
      } else if (startDate) {
        endpoint += `?startDate=${startDate}`;
      }
      
      const { data } = await apiClient.get(endpoint);
      return data;
    },

    /**
     * Get a specific calendar event
     */
    getCalendarEvent: async (id: string): Promise<CalendarEvent> => {
      const { data } = await apiClient.get(`/calendar/${id}`);
      return data;
    },

    /**
     * Create a new calendar event
     */
    createCalendarEvent: async (event: CalendarEventCreate): Promise<CalendarEvent> => {
      const { data } = await apiClient.post('/calendar', event);
      return data;
    },

    /**
     * Update a calendar event
     */
    updateCalendarEvent: async (id: string, event: CalendarEventUpdate): Promise<CalendarEvent> => {
      const { data } = await apiClient.put(`/calendar/${id}`, event);
      return data;
    },

    /**
     * Delete a calendar event
     */
    deleteCalendarEvent: async (id: string): Promise<void> => {
      await apiClient.delete(`/calendar/${id}`);
    }
  };
};

export type CalendarService = ReturnType<typeof createCalendarService>; 