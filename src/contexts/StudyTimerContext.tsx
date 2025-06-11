import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useApi } from '../lib/api/ApiContext';

interface StudyTimerContextType {
  isRunning: boolean;
  sessionId: string | null;
  elapsedTime: number;
  subject: string;
  startTimer: (subject?: string) => Promise<void>;
  stopTimer: () => Promise<void>;
  formatTime: (seconds: number) => string;
}

const StudyTimerContext = createContext<StudyTimerContextType | undefined>(undefined);

export const useStudyTimer = (): StudyTimerContextType => {
  const context = useContext(StudyTimerContext);
  if (!context) {
    throw new Error('useStudyTimer must be used within a StudyTimerProvider');
  }
  return context;
};

interface StudyTimerProviderProps {
  children: ReactNode;
}

export const StudyTimerProvider = ({ children }: StudyTimerProviderProps) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [subject, setSubject] = useState<string>('');
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  
  const { studySessionService } = useApi();
  
  // Initialize timer state from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('studySession');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      setIsRunning(session.isRunning);
      setSessionId(session.sessionId);
      setSubject(session.subject);
      
      if (session.isRunning && session.startTime) {
        const elapsedSeconds = Math.floor((Date.now() - session.startTime) / 1000);
        setElapsedTime(elapsedSeconds);
        setStartTime(session.startTime);
      }
    }
  }, []);
  
  // Update the timer every second if it's running
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (isRunning && startTime) {
      intervalId = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(elapsedSeconds);
      }, 1000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, startTime]);
  
  // Save session data to localStorage whenever it changes
  useEffect(() => {
    if (isRunning) {
      localStorage.setItem('studySession', JSON.stringify({
        isRunning,
        sessionId,
        subject,
        startTime
      }));
    } else {
      localStorage.removeItem('studySession');
    }
  }, [isRunning, sessionId, subject, startTime]);
  
  const startTimer = async (subjectName?: string) => {
    try {
      const session = await studySessionService.startStudySession(subjectName || undefined);
      setSessionId(session.id);
      setIsRunning(true);
      setSubject(subjectName || '');
      setStartTime(Date.now());
      setElapsedTime(0);
    } catch (error) {
      console.error('Failed to start study session:', error);
      throw new Error('Failed to start study session');
    }
  };
  
  const stopTimer = async () => {
    if (!sessionId) return;
    
    try {
      await studySessionService.endStudySession(sessionId);
      setIsRunning(false);
      setSessionId(null);
      setSubject('');
      setElapsedTime(0);
      setStartTime(null);
    } catch (error) {
      console.error('Failed to end study session:', error);
      throw new Error('Failed to end study session');
    }
  };
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };
  
  return (
    <StudyTimerContext.Provider
      value={{
        isRunning,
        sessionId,
        elapsedTime,
        subject,
        startTimer,
        stopTimer,
        formatTime
      }}
    >
      {children}
    </StudyTimerContext.Provider>
  );
}; 