'use client';

import { useState } from 'react';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Monitor, 
  Clock,
  Calendar,
  User,
  AlertCircle,
  Save,
  Check
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationPreferences } from '@/lib/services/notification';

export default function NotificationSettingsPage() {
  const { preferences, updatePreferences, permissionStatus, requestPermission, isSupported } = useNotifications();
  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof NotificationPreferences) => {
    updatePreferences({ [key]: !preferences[key] });
    setSaved(false);
  };

  const handleReminderChange = (minutes: number) => {
    updatePreferences({ reminderMinutes: minutes });
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Notification Settings</h1>
        <p className="text-slate-600 mt-1">Manage your push notification preferences</p>
      </div>

      {/* Permission Status */}
      {isSupported && permissionStatus !== 'granted' && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Enable Notifications</h3>
              <p className="text-sm text-amber-700 mt-1">
                Allow browser notifications to receive appointment alerts.
              </p>
              <button
                onClick={requestPermission}
                className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
              >
                Enable Notifications
              </button>
            </div>
          </div>
        </div>
      )}

      {isSupported && permissionStatus === 'granted' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">Notifications are enabled</span>
          </div>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Master Toggle */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Enable Notifications</h3>
                <p className="text-sm text-slate-500">Turn all notifications on or off</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('enabled')}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                preferences.enabled ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  preferences.enabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Notification Types */}
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4">Notification Types</h3>
          
          <div className="space-y-4">
            {/* New Appointments */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">New Appointments</p>
                  <p className="text-xs text-slate-500">When a new appointment is scheduled</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('newAppointments')}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  preferences.newAppointments ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    preferences.newAppointments ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Check-in Alerts */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Check-in Alerts</p>
                  <p className="text-xs text-slate-500">When a patient checks in</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('checkInAlerts')}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  preferences.checkInAlerts ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    preferences.checkInAlerts ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Reminders */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Appointment Reminders</p>
                  <p className="text-xs text-slate-500">Reminders before appointments</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('reminders')}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  preferences.reminders ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    preferences.reminders ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Status Changes */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Status Changes</p>
                  <p className="text-xs text-slate-500">When appointment status is updated</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('statusChanges')}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  preferences.statusChanges ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    preferences.statusChanges ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Sound & Display */}
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4">Sound & Display</h3>
          
          <div className="space-y-4">
            {/* Sound */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  {preferences.soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-slate-600" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-800">Sound</p>
                  <p className="text-xs text-slate-500">Play sound for notifications</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('soundEnabled')}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  preferences.soundEnabled ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    preferences.soundEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Browser Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Monitor className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Browser Notifications</p>
                  <p className="text-xs text-slate-500">Show system notifications when app is in background</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('browserNotifications')}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  preferences.browserNotifications ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    preferences.browserNotifications ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Reminder Timing */}
        <div className="p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Reminder Timing</h3>
          <p className="text-sm text-slate-500 mb-4">How long before an appointment should we send a reminder?</p>
          
          <div className="flex gap-3">
            {[15, 30, 60].map((minutes) => (
              <button
                key={minutes}
                onClick={() => handleReminderChange(minutes)}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  preferences.reminderMinutes === minutes
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {minutes} min
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}