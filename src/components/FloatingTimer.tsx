import { Clock, X } from 'lucide-react';
import { useState } from 'react';
import { useStudyTimer } from '../contexts/StudyTimerContext';
import { useNavigate } from 'react-router-dom';

export function FloatingTimer() {
  const { isRunning, elapsedTime, subject, formatTime, stopTimer } = useStudyTimer();
  const [minimized, setMinimized] = useState(false);
  const navigate = useNavigate();

  if (!isRunning) return null;

  const handleStopTimer = async () => {
    try {
      await stopTimer();
    } catch (error) {
      alert('Failed to end study session. Please try again.');
    }
  };

  const handleTimerClick = () => {
    navigate('/analytics');
  };

  if (minimized) {
    return (
      <div 
        className="fixed bottom-4 right-4 bg-primary-600 text-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-primary-700 transition-all z-50"
        onClick={() => setMinimized(false)}
        title={`Studying ${subject || 'unnamed session'}: ${formatTime(elapsedTime)}`}
      >
        <Clock className="h-5 w-5" />
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-dark-100 p-3 rounded-lg shadow-lg z-50 flex items-center">
      <div 
        className="flex items-center cursor-pointer mr-4"
        onClick={handleTimerClick}
      >
        <Clock className="text-primary-600 dark:text-primary-400 mr-2 h-5 w-5" />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {formatTime(elapsedTime)}
          </span>
          {subject && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {subject}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center">
        <button
          onClick={() => setMinimized(true)}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mr-1"
          title="Minimize"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button
          onClick={handleStopTimer}
          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
          title="Stop Timer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
} 