'use client';

import { useState } from 'react';
import { Bell, Check, X, AlertCircle, Info, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { CardGlass } from '@/components/ui/card-glass';
import { Button } from '@/components/ui/button-v2';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDismiss: (id: string) => void;
  className?: string;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
}

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  info: <Info className="w-5 h-5" />,
  success: <CheckCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  error: <AlertCircle className="w-5 h-5" />
};

const notificationColors: Record<NotificationType, string> = {
  info: 'from-blue-500 to-cyan-500',
  success: 'from-green-500 to-emerald-500',
  warning: 'from-yellow-500 to-orange-500',
  error: 'from-red-500 to-rose-500'
};

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  className,
  isLoading = false,
  error,
  onRetry
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className={cn("relative", className)}>
      {/* Bell Button */}
      <Button
        variant="ghost-glass"
        size="icon"
        className={cn(
          "relative h-10 w-10 transition-all duration-300",
          isOpen && "bg-white/10 border-white/20"
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
      >
        <Bell className={cn(
          "w-5 h-5 transition-all duration-300",
          unreadCount > 0 && "animate-wiggle"
        )} />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <Badge className={cn(
            "absolute -top-1 -right-1 h-5 min-w-[20px] px-1",
            "bg-gradient-to-r from-red-500 to-rose-500",
            "text-white text-xs font-bold",
            "border-2 border-slate-900",
            "animate-pulse"
          )}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <CardGlass
            variant="elevated"
            className={cn(
              "absolute top-full right-0 mt-2 w-96 max-h-[600px]",
              "animate-in fade-in slide-in-from-top-4 duration-300",
              "z-50"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {unreadCount} unread
                  </p>
                )}
              </div>
              {notifications.length > 0 && !isLoading && (
                <Button
                  variant="ghost-glass"
                  size="sm"
                  onClick={onMarkAllAsRead}
                  className="text-xs"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Loader2 className="w-8 h-8 text-teal-400 animate-spin mb-3" />
                <p className="text-sm text-slate-400">Loading notifications...</p>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-sm text-red-400 mb-3">{error}</p>
                {onRetry && (
                  <Button
                    variant="ghost-glass"
                    size="sm"
                    onClick={onRetry}
                    className="text-teal-400"
                  >
                    Try again
                  </Button>
                )}
              </div>
            )}

            {/* Notifications List */}
            {!isLoading && !error && (
              <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-3">
                      <Bell className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-sm text-slate-400">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-4 transition-all duration-200",
                          !notification.read && "bg-white/5",
                          "hover:bg-white/10 cursor-pointer group"
                        )}
                        onClick={() => !notification.read && onMarkAsRead(notification.id)}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className={cn(
                            "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
                            "bg-gradient-to-br shadow-lg",
                            notificationColors[notification.type]
                          )}>
                            {notificationIcons[notification.type]}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className={cn(
                                "text-sm font-medium",
                                notification.read ? "text-slate-400" : "text-white"
                              )}>
                                {notification.title}
                              </h4>
                              <Button
                                variant="ghost-glass"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDismiss(notification.id);
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              {notification.actionLabel && notification.onAction && (
                                <Button
                                  variant="ghost-glass"
                                  size="xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    notification.onAction?.();
                                  }}
                                  className="text-xs text-teal-400 hover:text-teal-300"
                                >
                                  {notification.actionLabel}
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Unread indicator */}
                          {!notification.read && (
                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-teal-500 shadow-lg shadow-teal-500/50" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardGlass>

          {/* Backdrop */}
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
    </div>
  );
}
