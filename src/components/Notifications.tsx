import React from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export function Notifications() {
  const { notifications, removeNotification } = useNotificationStore();

  const getIcon = (type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-400" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getColors = (type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-800';
      case 'error':
        return 'bg-red-50 text-red-800';
      case 'info':
        return 'bg-blue-50 text-blue-800';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getColors(
            notification.type
          )} p-4 rounded-lg shadow-lg max-w-sm flex items-start space-x-3`}
        >
          {getIcon(notification.type)}
          <p className="flex-1 text-sm">{notification.message}</p>
          <button
            onClick={() => removeNotification(notification.id)}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ))}
    </div>
  );
}