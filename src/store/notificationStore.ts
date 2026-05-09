import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Notification, NotificationType } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface NotificationState {
  notifications: Notification[];
  addNotification: (
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: (userId: string) => void;
  deleteNotification: (id: string) => void;
  getUnreadCount: (userId: string) => number;
  getNotificationsByUser: (userId: string) => Notification[];
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [
        {
          id: 'notif-1',
          userId: 'member-1',
          type: 'task_assigned',
          title: 'New Task Assigned',
          message: 'You have been assigned to "Design homepage mockup"',
          read: false,
          link: '/tasks/task-1',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'notif-2',
          userId: 'member-1',
          type: 'task_due',
          title: 'Task Due Soon',
          message: '"Implement responsive navigation" is due tomorrow',
          read: false,
          link: '/tasks/task-2',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'notif-3',
          userId: 'admin-1',
          type: 'task_completed',
          title: 'Task Completed',
          message: 'Team Member completed "Design homepage mockup"',
          read: true,
          link: '/tasks/task-1',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ],

      addNotification: (userId, type, title, message, link) => {
        const notification: Notification = {
          id: uuidv4(),
          userId,
          type,
          title,
          message,
          read: false,
          link,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          notifications: [notification, ...state.notifications],
        }));
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      markAllAsRead: (userId) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.userId === userId ? { ...n, read: true } : n
          ),
        }));
      },

      deleteNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      getUnreadCount: (userId) => {
        return get().notifications.filter(
          (n) => n.userId === userId && !n.read
        ).length;
      },

      getNotificationsByUser: (userId) => {
        return get().notifications.filter((n) => n.userId === userId);
      },
    }),
    {
      name: 'notification-storage',
    }
  )
);
