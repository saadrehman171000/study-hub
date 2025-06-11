import { DashboardLayout } from '../components/DashboardLayout';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart,
  Calendar,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { useApi } from '../lib/api/ApiContext';
import { Assignment } from '../lib/api/assignmentService';
import { StudyTimeBySubject } from '../components/StudyTimeBySubject';
import { StudyTimer } from '../components/StudyTimer';
import { useStudyTimer } from '../contexts/StudyTimerContext';

// Define analytics data interface
interface AnalyticsData {
  totalStudyTime: number;
  totalSessions: number;
  completedAssignments: number;
  studyTimeBySubject: Record<string, number>;
}

export function Analytics() {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [upcomingAssignments, setUpcomingAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const { studySessionService, assignmentService } = useApi();
  const { isRunning } = useStudyTimer();

  // Refresh data more frequently when a session is active
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch analytics data
        const analytics = await studySessionService.getAnalytics(timeframe);
        setAnalyticsData(analytics);
        
        // Fetch upcoming assignments
        const assignments = await assignmentService.getAssignments();
        // Sort by due date and take first 3
        const sortedAssignments = assignments
          .filter(a => a.status !== 'completed')
          .sort((a, b) => 
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          )
          .slice(0, 3);
        
        setUpcomingAssignments(sortedAssignments);
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up auto-refresh if a study session is running
    let intervalId: number | null = null;
    if (isRunning) {
      intervalId = setInterval(fetchData, 60000); // Refresh every minute when studying
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [studySessionService, assignmentService, timeframe, isRunning]);

  // Update the timer every second if it's running
  useEffect(() => {
    let intervalId: ReturnType<typeof setTimeout> | null = null;
    
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

  // Format minutes into hours and minutes
  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Calculate study efficiency (completed tasks per hour)
  const calculateEfficiency = () => {
    if (!analyticsData) return '0';
    
    if (analyticsData.totalStudyTime === 0) {
      return '0';
    }
    
    // Tasks completed per hour of study
    const tasksPerHour = (analyticsData.completedAssignments / analyticsData.totalStudyTime) * 60;
    return tasksPerHour.toFixed(2);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Study Analytics
          </h1>
          <div className="mt-2 flex space-x-4">
            <button 
              onClick={() => setTimeframe('daily')}
              className={`px-4 py-2 rounded-lg ${
                timeframe === 'daily' 
                  ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' 
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-200'
              }`}
            >
              Daily
            </button>
            <button 
              onClick={() => setTimeframe('weekly')}
              className={`px-4 py-2 rounded-lg ${
                timeframe === 'weekly' 
                  ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' 
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-200'
              }`}
            >
              Weekly
            </button>
            <button 
              onClick={() => setTimeframe('monthly')}
              className={`px-4 py-2 rounded-lg ${
                timeframe === 'monthly' 
                  ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' 
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-200'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 p-4 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-dark-100 p-6 rounded-xl shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Study Time</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                      {analyticsData ? formatStudyTime(analyticsData.totalStudyTime) : '0m'}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-dark-100 p-6 rounded-xl shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Study Sessions</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                      {analyticsData?.totalSessions || 0}
                    </p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-dark-100 p-6 rounded-xl shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed Tasks</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                      {analyticsData?.completedAssignments || 0}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-dark-100 p-6 rounded-xl shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Study Efficiency</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                      {calculateEfficiency()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">tasks/hour</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
              </motion.div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Tasks Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-dark-100 p-6 rounded-xl shadow-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Tasks</h2>
                  <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-500">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {upcomingAssignments.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                      No upcoming assignments
                    </p>
                  ) : (
                    upcomingAssignments.map((assignment, index) => (
                      <motion.div
                        key={assignment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-200 rounded-lg"
                      >
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{assignment.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Due: {format(new Date(assignment.dueDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          assignment.priority === 'high' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-600/70 dark:text-white'
                            : assignment.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/70 dark:text-white'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-500/70 dark:text-white'
                          }`}>
                          {assignment.priority}
                        </span>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>

              {/* Study Time By Subject */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <StudyTimeBySubject 
                  data={analyticsData?.studyTimeBySubject || {}} 
                />
              </motion.div>
            </div>

            {/* Study Timer Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <StudyTimer />
            </motion.div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
