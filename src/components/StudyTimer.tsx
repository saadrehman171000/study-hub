import { useState } from 'react';
import { Clock, Play, Square, BookOpen } from 'lucide-react';
import { useStudyTimer } from '../contexts/StudyTimerContext';

export function StudyTimer() {
  const { isRunning, elapsedTime, subject, startTimer, stopTimer, formatTime } = useStudyTimer();
  const [inputSubject, setInputSubject] = useState('');

  const handleStartTimer = async () => {
    try {
      await startTimer(inputSubject || undefined);
    } catch (error) {
      alert('Failed to start study session. Please try again.');
    }
  };

  const handleStopTimer = async () => {
    try {
      await stopTimer();
      setInputSubject('');
    } catch (error) {
      alert('Failed to end study session. Please try again.');
    }
  };

  return (
    <div className="bg-white dark:bg-dark-100 p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <Clock className="mr-2 h-5 w-5 text-primary-600 dark:text-primary-400" />
        Study Timer
      </h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Subject (optional)
        </label>
        <div className="flex">
          <div className="relative flex-grow">
            <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={isRunning ? subject : inputSubject}
              onChange={(e) => setInputSubject(e.target.value)}
              placeholder="What are you studying?"
              disabled={isRunning}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-dark-800 dark:text-white"
            />
          </div>
        </div>
      </div>
      
      <div className="text-center py-4">
        <div className="text-4xl font-mono font-bold text-gray-900 dark:text-white mb-4">
          {formatTime(elapsedTime)}
        </div>
        
        <div className="flex justify-center space-x-4">
          {!isRunning ? (
            <button 
              onClick={handleStartTimer}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center"
              disabled={isRunning}
            >
              <Play className="mr-2 h-5 w-5" />
              Start Session
            </button>
          ) : (
            <button 
              onClick={handleStopTimer}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center"
            >
              <Square className="mr-2 h-5 w-5" />
              End Session
            </button>
          )}
        </div>
      </div>
      
      {isRunning && (
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
          Currently tracking {subject ? `"${subject}"` : 'study time'}...
        </p>
      )}
    </div>
  );
} 