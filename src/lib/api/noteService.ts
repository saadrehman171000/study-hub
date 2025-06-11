import { ApiClient } from './apiClient';

export interface Note {
  id: string;
  title: string;
  content?: string;
  subject?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteCreate {
  title: string;
  content?: string;
  subject?: string;
}

export interface NoteUpdate {
  title?: string;
  content?: string;
  subject?: string;
}

export const createNoteService = (apiClient: ApiClient) => {
  return {
    /**
     * Get all notes, optionally filtered by subject
     */
    getNotes: async (subject?: string): Promise<Note[]> => {
      const endpoint = subject ? `/notes?subject=${subject}` : '/notes';
      const { data } = await apiClient.get(endpoint);
      return data;
    },

    /**
     * Get a specific note
     */
    getNote: async (id: string): Promise<Note> => {
      const { data } = await apiClient.get(`/notes/${id}`);
      return data;
    },

    /**
     * Create a new note
     */
    createNote: async (note: NoteCreate): Promise<Note> => {
      const { data } = await apiClient.post('/notes', note);
      return data;
    },

    /**
     * Update a note
     */
    updateNote: async (id: string, note: NoteUpdate): Promise<Note> => {
      const { data } = await apiClient.put(`/notes/${id}`, note);
      return data;
    },

    /**
     * Delete a note
     */
    deleteNote: async (id: string): Promise<void> => {
      await apiClient.delete(`/notes/${id}`);
    }
  };
};

export type NoteService = ReturnType<typeof createNoteService>; 