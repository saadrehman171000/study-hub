import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, BookOpen, Calendar, BarChart, List, Music, Target, LogOut } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useClerk, useUser } from '@clerk/clerk-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const { openUserProfile, signOut } = useClerk();
  const { user } = useUser();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Resources', href: '/resources', icon: BookOpen },
    { name: 'Calendar', href: '/Calendar', icon: Calendar },
    { name: 'Analytics', href: '/Analytics', icon: BarChart },
    { name: 'Assignments', href: '/Assignments', icon: List },
    { name: 'Study Music', href: '/study-music', icon: Music },
    { name: 'Academic Goals', href: '/academic-goals', icon: Target },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-200">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-dark-100 border-r border-gray-200 dark:border-gray-800">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">StudyHub</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-200'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer with user profile */}
          <div className="mt-auto border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => openUserProfile()}
              className="flex items-center w-full px-8 py-4 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors"
            >
              <div className="mr-3">
                <img 
                  src={user?.imageUrl} 
                  alt="Profile" 
                  className="h-8 w-8 rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                  }}
                />
              </div>
              <span className="text-base font-medium text-gray-800 dark:text-gray-200">Profile Settings</span>
            </button>
            
            <div className="p-4 flex items-center justify-between">
              <ThemeToggle />
              <button
                onClick={() => signOut()}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}