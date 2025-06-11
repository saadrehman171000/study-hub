import { DashboardLayout } from '../components/DashboardLayout';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Moon, Sun, User, Shield, Clock } from 'lucide-react';
import { useState } from 'react';

export function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <SettingsIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>

        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-100 p-6 rounded-xl shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <User className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            <h2 className="text-xl font-semibold">Profile Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-200 bg-white dark:bg-dark-200"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-200 bg-white dark:bg-dark-200"
                  placeholder="john@example.com"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-dark-100 p-6 rounded-xl shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <Bell className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Notifications</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates about your study schedule</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications ? 'bg-primary-600' : 'bg-gray-300 dark:bg-dark-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </motion.div>

        {/* Appearance Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-dark-100 p-6 rounded-xl shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            {darkMode ? (
              <Moon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            ) : (
              <Sun className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            )}
            <h2 className="text-xl font-semibold">Appearance</h2>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Switch between light and dark themes</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                darkMode ? 'bg-primary-600' : 'bg-gray-300 dark:bg-dark-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </motion.div>

        {/* Study Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-dark-100 p-6 rounded-xl shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <Clock className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            <h2 className="text-xl font-semibold">Study Preferences</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Focus Mode</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Block distracting notifications during study sessions</p>
              </div>
              <button
                onClick={() => setFocusMode(!focusMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  focusMode ? 'bg-primary-600' : 'bg-gray-300 dark:bg-dark-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    focusMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Default Study Session Duration
              </label>
              <select className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-200 bg-white dark:bg-dark-200">
                <option value="25">25 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-dark-100 p-6 rounded-xl shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            <h2 className="text-xl font-semibold">Security</h2>
          </div>
          
          <div className="space-y-4">
            <button className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-200             rounded-lg border border-gray-300 dark:border-dark-200">
              Change Password
            </button>

            <button className="w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-dark-200 rounded-lg border border-red-300 dark:border-red-600">
              Delete Account
            </button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
