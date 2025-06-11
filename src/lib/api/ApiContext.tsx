import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { createApiClient, ApiClient } from './apiClient';
import { createUserService, UserService } from './userService';
import { createAssignmentService, AssignmentService } from './assignmentService';
import { createResourceService, ResourceService } from './resourceService';
import { createStudySessionService, StudySessionService } from './studySessionService';
import { createNoteService, NoteService } from './noteService';
import { createCalendarService, CalendarService } from './calendarService';
import { createMusicService, MusicService } from './musicService';
import { createAcademicGoalService, AcademicGoalService } from './academicGoalService';
import { createAIAssistantService, AIAssistantService } from './aiAssistantService';

interface ApiContextValue {
  apiClient: ApiClient;
  userService: UserService;
  assignmentService: AssignmentService;
  resourceService: ResourceService;
  studySessionService: StudySessionService;
  noteService: NoteService;
  calendarService: CalendarService;
  musicService: MusicService;
  academicGoalService: AcademicGoalService;
  aiAssistantService: AIAssistantService;
}

const ApiContext = createContext<ApiContextValue | undefined>(undefined);

export function ApiProvider({ children }: { children: ReactNode }) {
  // Get the Clerk auth functions
  const { getToken } = useAuth();
  
  // Create API client with the getToken function
  const apiClient = createApiClient(async () => await getToken());
  
  // Create services
  const userService = createUserService(apiClient);
  const assignmentService = createAssignmentService(apiClient);
  const resourceService = createResourceService(apiClient);
  const studySessionService = createStudySessionService(apiClient);
  const noteService = createNoteService(apiClient);
  const calendarService = createCalendarService(apiClient);
  const musicService = createMusicService(apiClient);
  const academicGoalService = createAcademicGoalService(apiClient);
  const aiAssistantService = createAIAssistantService(apiClient);

  const value: ApiContextValue = {
    apiClient,
    userService,
    assignmentService,
    resourceService,
    studySessionService,
    noteService,
    calendarService,
    musicService,
    academicGoalService,
    aiAssistantService,
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApi() {
  const context = useContext(ApiContext);
  
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  
  return context;
} 