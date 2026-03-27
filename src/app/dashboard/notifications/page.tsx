'use client';

import { useState } from 'react';
import { 
  Bell, 
  Calendar, 
  User, 
  Clock, 
  AlertCircle,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Search
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationType, NotificationHistoryItem } from '@/lib/services/notification';
import { format } from 'date-fns';

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
      return 'bg-blue-100 text-blue-600';
    case 'check_in':
      return 'bg-green-100 text-green-600';
    case 'reminder':
      return 'bg-amber-100 text-amber-600';
    case 'status_change':
      return 'bg-purple-100 text-purple-600';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};

const getLabelByType = (type: NotificationType): string => {
  switch (type) {
    case 'new_appointment':
      return 'New Appointment';
    case 'check_in':
      return 'Check-in';
    case 'reminder':
      return 'Reminder';
    case 'status_change':
      return 'Status Change';
    default:
      return 'Notification';
  }
};

type FilterType = 'all' | NotificationType;

export default function NotificationsPage() {
  const { history, unreadCount, markAsRead, markAllAsRead, clearHistory } = useNotifications();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = history.filter(item => {
    // Apply type filter
    if (filter !== 'all' && item.type !== filter) {
      return false;
    }
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.body.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
          <p className="text-slate-600 mt-1">View your notification history</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
          <button
            onClick={clearHistory}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear all
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{history.length}</p>
              <p className="text-xs text-slate-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{unreadCount}</p>
              <p className="text-xs text-slate-500">Unread</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {history.filter(h => h.type === 'check_in').length}
              </p>
              <p className="text-xs text-slate-500">Check-ins</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {history.filter(h => h.type === 'new_appointment').length}
              </p>
              <p className="text-xs text-slate-500">Appointments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="new_appointment">New Appointments</option>
              <option value="check_in">Check-ins</option>
              <option value="reminder">Reminders</option>
              <option value="status_change">Status Changes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification List */}
      {filteredHistory.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No notifications</h3>
          <p className="text-slate-500">
            {searchQuery || filter !== 'all' 
              ? 'No notifications match your filters' 
              : 'You don\'t have any notifications yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => {
            const Icon = getIconByType(item.type);
            const colorClass = getColorByType(item.type);
            
            return (
              <div
                key={item.id}
                onClick={() => !item.read && markAsRead(item.id)}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                  item.read 
                    ? 'border-slate-200' 
                    : 'border-blue-200 bg-blue-50/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className={`font-semibold ${item.read ? 'text-slate-700' : 'text-slate-900'}`}>
                          {item.title}
                        </h4>
                        <p className="text-sm text-slate-600 mt-1">{item.body}</p>
                      </div>
                      {!item.read && (
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 mt-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${colorClass}`}>
                        {getLabelByType(item.type)}
                      </span>
                      <span className="text-xs text-slate-400">
                        {format(new Date(item.timestamp), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredHistory.length > 0 && filteredHistory.length < history.length && (
        <p className="text-center text-sm text-slate-500 mt-4">
          Showing {filteredHistory.length} of {history.length} notifications
        </p>
      )}
    </div>
  );
}