'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  NotificationPreferences,
  NotificationHistoryItem,
  NotificationType,
  defaultPreferences,
  getNotificationPreferences,
  saveNotificationPreferences,
  getNotificationHistory,
  addToNotificationHistory,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotificationHistory,
  getUnreadCount,
  requestNotificationPermission,
  getFCMToken,
  areNotificationsAvailable,
  getPermissionStatus,
  onForegroundMessage,
  isNotificationTypeEnabled,
  showBrowserNotification,
  getNotificationTitleByType,
  getNotificationBodyByType,
  NotificationPayload,
} from '@/lib/services/notification';

interface UseNotificationsReturn {
  // Permission state
  permissionStatus: NotificationPermission | 'unsupported';
  isSupported: boolean;
  fcmToken: string | null;
  
  // Preferences
  preferences: NotificationPreferences;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => void;
  
  // History
  history: NotificationHistoryItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearHistory: () => void;
  
  // Permission actions
  requestPermission: () => Promise<NotificationPermission | null>;
  
  // Trigger notification (for testing/demo)
  triggerNotification: (type: NotificationType, patientName: string, time?: string, status?: string) => void;
  
  // Current toast notification (for UI display)
  currentNotification: NotificationPayload | null;
  dismissNotification: () => void;
}

export function useNotifications(): UseNotificationsReturn {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('unsupported');
  const [isSupported, setIsSupported] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentNotification, setCurrentNotification] = useState<NotificationPayload | null>(null);

  // Initialize state on mount
  useEffect(() => {
    // Check support
    const supported = areNotificationsAvailable();
    setIsSupported(supported);

    if (supported) {
      // Get permission status
      const status = getPermissionStatus();
      setPermissionStatus(status);

      // Load preferences
      const prefs = getNotificationPreferences();
      setPreferences(prefs);

      // Load history
      const hist = getNotificationHistory();
      setHistory(hist);
      setUnreadCount(getUnreadCount());
    }
  }, []);

  // Listen for foreground messages from Firebase
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupForegroundListener = async () => {
      if (!isSupported || permissionStatus !== 'granted') return;

      try {
        unsubscribe = await onForegroundMessage((payload) => {
          const notification = payload.notification;
          if (notification) {
            const payloadData: NotificationPayload = {
              type: 'new_appointment',
              title: notification.title || 'Notification',
              body: notification.body || '',
              icon: '/2.png',
            };
            
            // Show toast
            setCurrentNotification(payloadData);
            
            // Add to history
            addToNotificationHistory({
              type: 'new_appointment',
              title: notification.title || 'Notification',
              body: notification.body || '',
              data: payload.data,
            });
            
            // Update history state
            setHistory(getNotificationHistory());
            setUnreadCount(getUnreadCount());
          }
        });
      } catch (error) {
        console.error('Error setting up foreground listener:', error);
      }
    };

    setupForegroundListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isSupported, permissionStatus]);

  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    if (currentNotification) {
      const timer = setTimeout(() => {
        setCurrentNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentNotification]);

  // Update preferences
  const updatePreferences = useCallback((prefs: Partial<NotificationPreferences>) => {
    const updated = { ...preferences, ...prefs };
    saveNotificationPreferences(updated);
    setPreferences(updated);
  }, [preferences]);

  // Mark as read
  const markAsRead = useCallback((id: string) => {
    markNotificationAsRead(id);
    setHistory(getNotificationHistory());
    setUnreadCount(getUnreadCount());
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    markAllNotificationsAsRead();
    setHistory(getNotificationHistory());
    setUnreadCount(0);
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    clearNotificationHistory();
    setHistory([]);
    setUnreadCount(0);
  }, []);

  // Request permission
  const requestPermission = useCallback(async (): Promise<NotificationPermission | null> => {
    const permission = await requestNotificationPermission();
    if (permission) {
      setPermissionStatus(permission);
    }

    if (permission === 'granted') {
      // Get FCM token
      const token = await getFCMToken();
      setFcmToken(token);
    }

    return permission;
  }, []);

  // Trigger notification (for demo/testing)
  const triggerNotification = useCallback((
    type: NotificationType, 
    patientName: string, 
    time?: string,
    status?: string
  ) => {
    // Check if this notification type is enabled
    if (!isNotificationTypeEnabled(type)) {
      return;
    }

    const title = getNotificationTitleByType(type, patientName);
    const body = getNotificationBodyByType(type, patientName, time, status);
    
    const payload: NotificationPayload = {
      type,
      title,
      body,
      icon: '/2.png',
    };

    // Show browser notification
    showBrowserNotification(payload);

    // Show toast in-app
    setCurrentNotification(payload);

    // Add to history
    addToNotificationHistory({
      type,
      title,
      body,
    });

    // Update history state
    setHistory(getNotificationHistory());
    setUnreadCount(getUnreadCount());
  }, []);

  // Dismiss current notification
  const dismissNotification = useCallback(() => {
    setCurrentNotification(null);
  }, []);

  return {
    permissionStatus,
    isSupported,
    fcmToken,
    preferences,
    updatePreferences,
    history,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearHistory,
    requestPermission,
    triggerNotification,
    currentNotification,
    dismissNotification,
  };
}

export default useNotifications;