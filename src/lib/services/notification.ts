import { 
  getToken, 
  onMessage, 
  Messaging,
  NextFn,
  MessagePayload
} from 'firebase/messaging';
import { getFirebaseMessaging, vapidKey, isFirebaseConfigured, isVapidKeyConfigured } from '@/lib/firebase/config';

// Notification types
export type NotificationType = 
  | 'new_appointment' 
  | 'check_in' 
  | 'reminder' 
  | 'status_change';

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, unknown>;
}

export interface NotificationPreferences {
  enabled: boolean;
  newAppointments: boolean;
  checkInAlerts: boolean;
  reminders: boolean;
  statusChanges: boolean;
  soundEnabled: boolean;
  browserNotifications: boolean;
  reminderMinutes: number; // 15, 30, or 60
}

// Default preferences
export const defaultPreferences: NotificationPreferences = {
  enabled: true,
  newAppointments: true,
  checkInAlerts: true,
  reminders: true,
  statusChanges: true,
  soundEnabled: true,
  browserNotifications: true,
  reminderMinutes: 30,
};

// Storage key for preferences
const PREFERENCES_KEY = 'dental_clinic_notification_preferences';
const TOKEN_KEY = 'dental_clinic_fcm_token';
const NOTIFICATION_HISTORY_KEY = 'dental_clinic_notification_history';

export interface NotificationHistoryItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  data?: Record<string, unknown>;
}

// Get notification preferences from localStorage
export function getNotificationPreferences(): NotificationPreferences {
  if (typeof window === 'undefined') {
    return defaultPreferences;
  }
  
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (stored) {
      return { ...defaultPreferences, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error reading notification preferences:', error);
  }
  
  return defaultPreferences;
}

// Save notification preferences to localStorage
export function saveNotificationPreferences(preferences: NotificationPreferences): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving notification preferences:', error);
  }
}

// Get notification history from localStorage
export function getNotificationHistory(): NotificationHistoryItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(NOTIFICATION_HISTORY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading notification history:', error);
  }
  
  return [];
}

// Add notification to history
export function addToNotificationHistory(item: Omit<NotificationHistoryItem, 'id' | 'timestamp' | 'read'>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const history = getNotificationHistory();
    const newItem: NotificationHistoryItem = {
      ...item,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    // Keep only last 50 notifications
    const updatedHistory = [newItem, ...history].slice(0, 50);
    localStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error adding to notification history:', error);
  }
}

// Mark notification as read
export function markNotificationAsRead(id: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const history = getNotificationHistory();
    const updatedHistory = history.map(item => 
      item.id === id ? { ...item, read: true } : item
    );
    localStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

// Mark all notifications as read
export function markAllNotificationsAsRead(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const history = getNotificationHistory();
    const updatedHistory = history.map(item => ({ ...item, read: true }));
    localStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
}

// Clear notification history
export function clearNotificationHistory(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(NOTIFICATION_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing notification history:', error);
  }
}

// Get unread notification count
export function getUnreadCount(): number {
  const history = getNotificationHistory();
  return history.filter(item => !item.read).length;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission | null> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  // Check if already granted
  if (Notification.permission === 'granted') {
    return 'granted';
  }

  // Request permission
  const permission = await Notification.requestPermission();
  return permission;
}

// Get FCM token
export async function getFCMToken(): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!isFirebaseConfigured() || !isVapidKeyConfigured()) {
    console.warn('Firebase or VAPID key not configured');
    return null;
  }

  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      console.warn('Firebase messaging not supported');
      return null;
    }

    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    // Check for existing token
    const existingToken = localStorage.getItem(TOKEN_KEY);
    if (existingToken) {
      return existingToken;
    }

    // Get new token
    const token = await getToken(messaging, { vapidKey });
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      return token;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
  }

  return null;
}

// Check if notifications are available
export function areNotificationsAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window;
}

// Get current permission status
export function getPermissionStatus(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

// Listen for foreground messages
export async function onForegroundMessage(callback: NextFn<MessagePayload>): Promise<() => void> {
  const messaging = await getFirebaseMessaging();
  
  if (!messaging) {
    console.warn('Firebase messaging not available');
    return () => {};
  }

  return onMessage(messaging, callback);
}

// Check if a notification type is enabled
export function isNotificationTypeEnabled(type: NotificationType): boolean {
  const preferences = getNotificationPreferences();
  
  if (!preferences.enabled) {
    return false;
  }

  switch (type) {
    case 'new_appointment':
      return preferences.newAppointments;
    case 'check_in':
      return preferences.checkInAlerts;
    case 'reminder':
      return preferences.reminders;
    case 'status_change':
      return preferences.statusChanges;
    default:
      return true;
  }
}

// Show browser notification
export function showBrowserNotification(payload: NotificationPayload): void {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  const preferences = getNotificationPreferences();

  if (!preferences.enabled || !preferences.browserNotifications) {
    return;
  }

  if (Notification.permission === 'granted') {
    const notification = new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/2.png',
      badge: '/2.png',
      tag: payload.type,
      requireInteraction: false,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
}

// Get notification title by type
export function getNotificationTitleByType(type: NotificationType, patientName: string): string {
  switch (type) {
    case 'new_appointment':
      return 'New Appointment';
    case 'check_in':
      return 'Patient Arrived';
    case 'reminder':
      return 'Upcoming Appointment';
    case 'status_change':
      return 'Appointment Updated';
    default:
      return 'Notification';
  }
}

// Get notification body by type
export function getNotificationBodyByType(
  type: NotificationType, 
  patientName: string, 
  time?: string,
  status?: string
): string {
  switch (type) {
    case 'new_appointment':
      return `${patientName} - ${time || 'scheduled'}`;
    case 'check_in':
      return `${patientName} has checked in`;
    case 'reminder':
      return `${patientName} in ${time || '30'} minutes`;
    case 'status_change':
      return `${patientName} - ${status || 'updated'}`;
    default:
      return 'You have a new notification';
  }
}
