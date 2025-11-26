'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { Notification, NotificationType } from '@/components/widgets/NotificationCenter';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Create axios instance with credentials
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface UseNotificationsReturn {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismiss: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  refetch: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to fetch from API
      const response = await api.get('/notifications');

      if (response.data?.notifications) {
        setNotifications(
          response.data.notifications.map((n: any) => ({
            id: n.id,
            type: n.type as NotificationType,
            title: n.title,
            message: n.message,
            timestamp: new Date(n.createdAt),
            read: n.read,
            actionLabel: n.actionLabel,
            onAction: n.actionUrl ? () => window.location.href = n.actionUrl : undefined,
          }))
        );
      }
    } catch (err: any) {
      // If API fails, use mock data for demo purposes
      console.warn('Failed to fetch notifications from API, using mock data');
      setNotifications(getMockNotifications());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );

    // Update on server (fire and forget)
    api.patch(`/notifications/${id}/read`).catch(console.error);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    // Update on server (fire and forget)
    api.patch('/notifications/read-all').catch(console.error);
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));

    // Delete on server (fire and forget)
    api.delete(`/notifications/${id}`).catch(console.error);
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `temp-${Date.now()}`,
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  return {
    notifications,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    dismiss,
    addNotification,
    refetch: fetchNotifications,
  };
}

// Mock notifications for demo when API is not available
function getMockNotifications(): Notification[] {
  const now = new Date();
  return [
    {
      id: '1',
      type: 'success',
      title: 'Meeting Transcribed',
      message: 'Your meeting "Q4 Planning Session" has been transcribed successfully.',
      timestamp: new Date(now.getTime() - 5 * 60000), // 5 mins ago
      read: false,
      actionLabel: 'View',
    },
    {
      id: '2',
      type: 'info',
      title: 'New Integration Available',
      message: 'Connect your Salesforce account to sync meeting notes automatically.',
      timestamp: new Date(now.getTime() - 30 * 60000), // 30 mins ago
      read: false,
      actionLabel: 'Connect',
    },
    {
      id: '3',
      type: 'warning',
      title: 'Storage Almost Full',
      message: 'You have used 85% of your storage quota. Consider upgrading your plan.',
      timestamp: new Date(now.getTime() - 2 * 3600000), // 2 hours ago
      read: true,
      actionLabel: 'Upgrade',
    },
    {
      id: '4',
      type: 'success',
      title: 'AI Summary Ready',
      message: 'AI has generated action items for "Weekly Standup".',
      timestamp: new Date(now.getTime() - 24 * 3600000), // 1 day ago
      read: true,
    },
  ];
}

export default useNotifications;
