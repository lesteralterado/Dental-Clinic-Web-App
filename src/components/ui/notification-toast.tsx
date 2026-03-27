'use client';

import { Bell, Calendar, User, Clock, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationPayload, NotificationType } from '@/lib/services/notification';

interface NotificationToastProps {
  notification: NotificationPayload | null;
  onDismiss: () => void;
}

const getIconByType = (type: NotificationType) => {
  switch (type) {
    case 'new_appointment':
      return Calendar;
    case 'check_in':
      return User;
    case 'reminder':
      return Clock;
    case 'status_change':
      return AlertCircle;
    default:
      return Bell;
  }
};

const getColorByType = (type: NotificationType): string => {
  switch (type) {
    case 'new_appointment':
      return 'bg-blue-500';
    case 'check_in':
      return 'bg-green-500';
    case 'reminder':
      return 'bg-amber-500';
    case 'status_change':
      return 'bg-purple-500';
    default:
      return 'bg-slate-500';
  }
};

export function NotificationToast({ notification, onDismiss }: NotificationToastProps) {
  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            {/* Header with color bar */}
            <div className={`h-1 ${getColorByType(notification.type)}`} />
            
            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getColorByType(notification.type)} bg-opacity-10`}>
                  {(() => {
                    const Icon = getIconByType(notification.type);
                    return <Icon className={`w-5 h-5 ${getColorByType(notification.type).replace('bg-', 'text-')}`} />;
                  })()}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-800 text-sm">
                    {notification.title}
                  </h4>
                  <p className="text-slate-600 text-sm mt-1">
                    {notification.body}
                  </p>
                </div>
                
                {/* Close button */}
                <button
                  onClick={onDismiss}
                  className="flex-shrink-0 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Badge component for showing unread count
export function NotificationBadge({ count }: { count: number }) {
  if (count === 0) return null;
  
  return (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs font-medium rounded-full px-1">
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default NotificationToast;