import React from 'react'; // Added explicit React import for ErrorBoundary
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/clerk-react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { StudyResources } from './pages/StudyResources';
import { Calendar } from './pages/Calendar';
import { Analytics } from './pages/Analytics';
import { Assignments } from './pages/Assignments';
import { StudyMusic } from './pages/StudyMusic';
import { AcademicGoals } from './pages/AcademicGoals';
import { ThemeProvider } from './context/ThemeContext';
import { ApiProvider } from './lib/api/ApiContext';
import { StudyTimerProvider } from './contexts/StudyTimerContext';
import { FloatingTimer } from './components/FloatingTimer';
import { useEffect, useState, Suspense, lazy } from 'react';
import { createUserService } from './lib/api/userService';
import { createApiClient } from './lib/api/apiClient';
import { AnimatePresence, motion } from 'framer-motion';
import { Sun, Moon, Loader } from 'lucide-react';

// Hard-coded key as environment variables don't seem to be working
const clerkPubKey = 'pk_test_Y2xvc2luZy1oeWVuYS02Mi5jbGVyay5hY2NvdW50cy5kZXYk';

// Splash Screen Component
function SplashScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-dark-100 dark:to-dark-200 z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <div className="w-24 h-24 mb-6 rounded-full bg-primary-600 dark:bg-primary-500 flex items-center justify-center">
          <svg 
            className="w-16 h-16 text-white" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">StudyHub</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Your academic success companion</p>
        <div className="flex items-center space-x-2">
          <Loader className="h-5 w-5 animate-spin text-primary-600 dark:text-primary-400" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Loading your experience...</span>
        </div>
      </motion.div>
    </div>
  );
}

// Theme Toggle Component
function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="fixed bottom-6 right-6 p-3 rounded-full bg-white dark:bg-dark-200 shadow-lg z-40 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </button>
  );
}

// Navigation Progress Indicator
function NavigationProgress() {
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  
  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 500);
    return () => clearTimeout(timer);
  }, [location]);

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-primary-600 dark:bg-primary-500 z-50">
      <motion.div
        className="h-full bg-white"
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
}

// User Sync component to handle syncing Clerk user with our backend
function UserSync() {
  const { user, isLoaded } = useUser();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  
  useEffect(() => {
    if (isLoaded && user) {
      const syncUser = async () => {
        try {
          setSyncStatus('syncing');
          console.log("Attempting to sync user with backend");
          
          // Create userData from Clerk user
          const userData = {
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress || '',
            firstName: user.firstName || undefined,
            lastName: user.lastName || undefined,
            profilePicture: user.imageUrl || undefined,
          };
          
          console.log("User data for sync:", userData);
          
          // Create API client for user sync
          const apiClient = createApiClient();
          
          try {
            const { data } = await apiClient.post('/users/sync', userData);
            console.log("Sync response:", data);
            
            if (data && data.token) {
              // Store token via API client
              apiClient.setAuthToken(data.token);
              console.log("JWT token stored in localStorage");
              setSyncStatus('success');
            } else {
              console.warn("No token received from backend");
              setSyncStatus('error');
            }
          } catch (apiError) {
            console.error(`Error syncing user with API client:`, apiError);
            
            // Fallback to direct fetch if API client fails
            console.log("Falling back to direct fetch for user sync");
            const response = await fetch('http://localhost:3001/api/users/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(userData),
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error(`Error syncing user: ${response.status}`, errorText);
              setSyncStatus('error');
              return;
            }
            
            const data = await response.json();
            console.log("Sync response (fallback):", data);
            
            if (data.data && data.data.token) {
              localStorage.setItem('study_hub_jwt', data.data.token);
              console.log("JWT token stored in localStorage (fallback)");
              setSyncStatus('success');
            } else {
              console.warn("No token received from backend (fallback)");
              setSyncStatus('error');
            }
          }
        } catch (error) {
          console.error('Error syncing user with backend:', error);
          setSyncStatus('error');
        }
      };
      
      syncUser();
    }
  }, [isLoaded, user]);
  
  return null;
}

// Enhanced Protected Route component with better transitions
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </SignedIn>
      <SignedOut>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-dark-100 z-50">
            <div className="text-center p-6 max-w-md">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg 
                  className="w-8 h-8 text-primary-600 dark:text-primary-400" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M12 15V17M12 7V13M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Authentication Required</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                You need to be signed in to access this page. Redirecting you to the sign-in page...
              </p>
              <div className="flex justify-center">
                <RedirectToSignIn />
              </div>
            </div>
          </div>
        </motion.div>
      </SignedOut>
    </>
  );
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Application error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-100 p-4">
          <div className="bg-white dark:bg-dark-200 rounded-lg shadow-lg p-8 max-w-md w-full">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg 
                className="w-8 h-8 text-red-600 dark:text-red-400" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">Something went wrong</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
              We're sorry, but an error occurred while loading the application.
            </p>
            <div className="bg-gray-50 dark:bg-dark-300 p-3 rounded-md mb-6 overflow-auto max-h-32">
              <p className="text-sm font-mono text-red-600 dark:text-red-400">
                {this.state.error?.message || "Unknown error"}
              </p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm dark:bg-primary-500 dark:hover:bg-primary-600"
              >
                Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple notification component to replace react-hot-toast
function NotificationContainer() {
  return (
    <div id="notification-container" className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {/* Notifications will be inserted here dynamically */}
    </div>
  );
}

// Notification utility functions
const notifications = {
  show: (message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) => {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `
      p-4 rounded-lg shadow-md min-w-[200px] max-w-[300px] animate-in fade-in slide-in-from-right-5
      ${type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : ''}
      ${type === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : ''}
      ${type === 'info' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' : ''}
    `;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('animate-out', 'fade-out', 'slide-out-to-right-5');
      setTimeout(() => {
        container.removeChild(notification);
      }, 300);
    }, duration);
  },
  success: (message: string, duration?: number) => {
    notifications.show(message, 'success', duration);
  },
  error: (message: string, duration?: number) => {
    notifications.show(message, 'error', duration);
  },
  info: (message: string, duration?: number) => {
    notifications.show(message, 'info', duration);
  }
};

// Add this component to display backend connection status
function BackendConnectionStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('http://localhost:3005/api/health');
        setIsConnected(response.ok);
      } catch (error) {
        setIsConnected(false);
      }
    };

    checkConnection();
    
    // Check connection every 10 seconds
    const interval = setInterval(() => {
      checkConnection();
      setRetryCount(prev => prev + 1);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (isConnected === null) {
    return null; // Still loading
  }

  if (isConnected === true) {
    return null; // Connected, don't show anything
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      padding: '10px',
      backgroundColor: '#f8d7da',
      color: '#721c24',
      textAlign: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      ⚠️ Cannot connect to the backend server. Please ensure it's running. 
      {retryCount > 0 && <span> Retrying... ({retryCount})</span>}
    </div>
  );
}

// Main App Component
function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <BackendConnectionStatus />
      <ErrorBoundary>
        <ClerkProvider publishableKey={clerkPubKey}>
          <ThemeProvider>
            <ApiProvider>
              <StudyTimerProvider>
                <Router>
                  {isLoading && <SplashScreen />}
                  <UserSync />
                  <NavigationProgress />
                  <ThemeToggle />
                  
                  <AnimatePresence mode="wait">
                    {!isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="min-h-screen bg-gray-50 dark:bg-dark-100"
                      >
                        <Routes>
                          <Route path="/" element={<LandingPage />} />
                          <Route
                            path="/dashboard"
                            element={
                              <ProtectedRoute>
                                <Dashboard />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/resources"
                            element={
                              <ProtectedRoute>
                                <StudyResources />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/Calendar"
                            element={
                              <ProtectedRoute>
                                <Calendar />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/Analytics"
                            element={
                              <ProtectedRoute>
                                <Analytics />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/Assignments"
                            element={
                              <ProtectedRoute>
                                <Assignments />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/study-music"
                            element={
                              <ProtectedRoute>
                                <StudyMusic />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/academic-goals"
                            element={
                              <ProtectedRoute>
                                <AcademicGoals />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Floating timer that appears on all pages when a study session is active */}
                  <FloatingTimer />
                  
                  {/* Custom notification container instead of react-hot-toast */}
                  <NotificationContainer />
                </Router>
              </StudyTimerProvider>
            </ApiProvider>
          </ThemeProvider>
        </ClerkProvider>
      </ErrorBoundary>
    </>
  );
}

// Make notifications available globally
(window as any).notifications = notifications;

export default App;