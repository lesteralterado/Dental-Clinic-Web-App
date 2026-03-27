'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Bell, Moon, Sun, Lock, HelpCircle, FileText, 
  LogOut, ChevronRight, Save, Check, Loader2, RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mock user data - in real app this would come from auth context
const mockUser = {
  id: 'u1',
  name: 'Dr. Debra Wilson',
  email: 'debra.wilson@dentalclinic.com',
  role: 'DOCTOR',
};

export default function SettingsPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(mockUser.name);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSaveName = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaved(true);
    setIsEditingName(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSyncing(false);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      router.push('/login');
    }
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
    // In real app, this would toggle dark mode via context/CSS
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500">Manage your account and preferences</p>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6"
      >
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {mockUser.name.charAt(0)}
            </div>
            <div className="flex-1">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={isSaving}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-800">{mockUser.name}</h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
                  >
                    <User className="w-4 h-4" />
                  </button>
                </div>
              )}
              <p className="text-slate-600">{mockUser.role === 'DOCTOR' ? 'Dentist' : mockUser.role}</p>
              <p className="text-sm text-slate-500">{mockUser.email}</p>
            </div>
          </div>
          {saved && (
            <div className="mt-4 flex items-center gap-2 text-emerald-600">
              <Check className="w-4 h-4" />
              <span>Name updated successfully</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* App Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6"
      >
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">App Settings</h3>
        </div>
        
        <div className="divide-y divide-slate-100">
          {/* Dark Mode */}
          <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                {darkMode ? <Moon className="w-5 h-5 text-blue-600" /> : <Sun className="w-5 h-5 text-blue-600" />}
              </div>
              <div>
                <p className="font-medium text-slate-800">Dark Mode</p>
                <p className="text-sm text-slate-500">{darkMode ? 'Dark theme enabled' : 'Light theme enabled'}</p>
              </div>
            </div>
            <button
              onClick={handleDarkModeToggle}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                darkMode ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  darkMode ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Notifications */}
          <button
            onClick={() => router.push('/dashboard/settings/notifications')}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-800">Notifications</p>
                <p className="text-sm text-slate-500">Manage notification preferences</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>

          {/* Sync Data */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                {isSyncing ? <Loader2 className="w-5 h-5 text-blue-600 animate-spin" /> : <RefreshCw className="w-5 h-5 text-blue-600" />}
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-800">Sync Data</p>
                <p className="text-sm text-slate-500">{isSyncing ? 'Syncing...' : 'Sync data with cloud'}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6"
      >
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Security</h3>
        </div>
        
        <div className="divide-y divide-slate-100">
          {/* Change Password */}
          <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Lock className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-800">Change Password</p>
                <p className="text-sm text-slate-500">Update your account password</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </motion.div>

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6"
      >
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">About</h3>
        </div>
        
        <div className="divide-y divide-slate-100">
          {/* App Version */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <HelpCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-slate-800">App Version</p>
                <p className="text-sm text-slate-500">1.0.0</p>
              </div>
            </div>
          </div>

          {/* Help & Support */}
          <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <HelpCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-800">Help & Support</p>
                <p className="text-sm text-slate-500">Get help with the app</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>

          {/* Terms & Privacy */}
          <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-800">Terms & Privacy</p>
                <p className="text-sm text-slate-500">Legal information</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </motion.div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-medium hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </motion.div>
    </div>
  );
}
