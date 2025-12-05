import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { removeNotification } from '../../app/appSlice';
import { cn } from '../lib/utils';
import type { Notification } from '../types';

const NotificationItem = ({ notification }: { notification: Notification }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (notification.duration !== 0) {
      const timer = setTimeout(() => {
        dispatch(removeNotification(notification.id));
      }, notification.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [notification.id, notification.duration, dispatch]);

  const getNotificationStyles = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200';
      default:
        return 'bg-background border-border text-foreground';
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-sm animate-in slide-in-from-top-5',
        getNotificationStyles()
      )}
      role="alert"
    >
      {getIcon() && (
        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-sm font-bold">
          {getIcon()}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <p className="font-medium">{notification.title}</p>
        {notification.message && (
          <p className="mt-1 text-sm opacity-90">{notification.message}</p>
        )}
      </div>
      
      <button
        onClick={() => dispatch(removeNotification(notification.id))}
        className="flex-shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const NotificationProvider = () => {
  const notifications = useAppSelector((state) => state.app.notifications);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
};