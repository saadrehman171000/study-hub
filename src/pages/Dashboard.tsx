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
import { Resource } from '../lib/api/resourceService';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

export function Dashboard() {
  const [stats, setStats] = useState({
    studyHours: 0,
    completedTasks: 0,
    pendingTasks: 0,
    resources: 0
  });
  const [upcomingAssignments, setUpcomingAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  
  const { 
    assignmentService, 
    studySessionService, 
    resourceService 
  } = useApi();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch analytics data
        const analytics = await studySessionService.getAnalytics('weekly');
        
        // Fetch assignments
        const assignments = await assignmentService.getAssignments();
        
        // Count completed and pending tasks
        const completedTasks = assignments.filter(a => a.status === 'completed').length;
        const pendingTasks = assignments.filter(a => a.status !== 'completed').length;
        
        // Get upcoming assignments (not completed, sorted by due date)
        const upcoming = assignments
          .filter(a => a.status !== 'completed')
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
          .slice(0, 3);
        
        // Fetch resources count
        const resources = await resourceService.getResources();
        
        // Update state
        setStats({
          studyHours: Math.round((analytics.totalStudyTime / 60) * 10) / 10, // Convert minutes to hours
          completedTasks,
          pendingTasks,
          resources: resources.length
        });
        
        setUpcomingAssignments(upcoming);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [assignmentService, studySessionService, resourceService]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.firstName || 'Student'}!
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Study Hours</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{stats.studyHours}</p>
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed Tasks</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{stats.completedTasks}</p>
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending Tasks</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{stats.pendingTasks}</p>
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Resources</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{stats.resources}</p>
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
                  <Link to="/assignments" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-500">
                    View All
                  </Link>
                </div>
                <div className="space-y-4">
                  {upcomingAssignments.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                      No upcoming assignments. Create one to get started!
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
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            : assignment.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          }`}>
                          {assignment.priority}
                        </span>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>

              {/* Calendar Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-dark-100 p-6 rounded-xl shadow-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Links</h2>
                  <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="space-y-3">
                  <Link 
                    to="/resources"
                    className="block p-3 bg-gray-50 dark:bg-dark-200 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
                  >
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-3 text-primary-600 dark:text-primary-400" />
                      <span className="font-medium text-gray-800 dark:text-gray-200">Study Resources</span>
                    </div>
                  </Link>
                  
                  <Link 
                    to="/assignments"
                    className="block p-3 bg-gray-50 dark:bg-dark-200 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
                  >
                    <div className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-primary-600 dark:text-primary-400" />
                      <span className="font-medium text-gray-800 dark:text-gray-200">Assignments</span>
                    </div>
                  </Link>
                  
                  <Link 
                    to="/analytics"
                    className="block p-3 bg-gray-50 dark:bg-dark-200 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
                  >
                    <div className="flex items-center">
                      <BarChart className="h-5 w-5 mr-3 text-primary-600 dark:text-primary-400" />
                      <span className="font-medium text-gray-800 dark:text-gray-200">Analytics</span>
                    </div>
                  </Link>
                  
                  <Link 
                    to="/calendar"
                    className="block p-3 bg-gray-50 dark:bg-dark-200 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
                  >
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-3 text-primary-600 dark:text-primary-400" />
                      <span className="font-medium text-gray-800 dark:text-gray-200">Calendar</span>
                    </div>
                  </Link>
                </div>
              </motion.div>

              {/* Analytics Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-dark-100 p-6 rounded-xl shadow-sm lg:col-span-2"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Study Analytics</h2>
                  <Link to="/analytics" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-500">
                    View Details
                  </Link>
                </div>
                <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
                  <BarChart className="h-12 w-12 text-primary-600 dark:text-primary-400 mb-2" />
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Track Your Progress</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md">
                    View detailed analytics on your study habits, progress, and more. 
                    Get insights to optimize your learning.
                  </p>
                  <Link 
                    to="/analytics" 
                    className="mt-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  >
                    View Analytics
                  </Link>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}