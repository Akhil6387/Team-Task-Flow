import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, TaskStatus, TaskPriority, TaskComment, TaskActivity } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { isAfter, isBefore, startOfDay, parseISO } from 'date-fns';

interface TaskState {
  tasks: Task[];
  createTask: (
    projectId: string,
    title: string,
    description: string,
    priority: TaskPriority,
    createdBy: string,
    assigneeId?: string,
    dueDate?: string,
    tags?: string[]
  ) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTaskById: (id: string) => Task | undefined;
  getTasksByProject: (projectId: string) => Task[];
  getTasksByUser: (userId: string) => Task[];
  getTasksByAssignee: (assigneeId: string) => Task[];
  addComment: (taskId: string, userId: string, content: string) => void;
  addActivity: (taskId: string, userId: string, action: string, details?: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus, userId: string) => void;
  checkOverdueTasks: () => void;
}

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [
        {
          id: 'task-1',
          projectId: 'project-1',
          title: 'Design homepage mockup',
          description: 'Create wireframes and high-fidelity mockups for the new homepage',
          status: 'completed',
          priority: 'high',
          assigneeId: 'member-1',
          dueDate: yesterday.toISOString(),
          tags: ['design', 'ui'],
          comments: [
            {
              id: 'comment-1',
              taskId: 'task-1',
              userId: 'admin-1',
              content: 'Great progress on this!',
              createdAt: twoDaysAgo.toISOString(),
            },
          ],
          activities: [
            {
              id: 'activity-1',
              taskId: 'task-1',
              userId: 'member-1',
              action: 'status_changed',
              details: 'Changed status to Completed',
              createdAt: yesterday.toISOString(),
            },
          ],
          createdBy: 'admin-1',
          createdAt: twoDaysAgo.toISOString(),
          updatedAt: yesterday.toISOString(),
        },
        {
          id: 'task-2',
          projectId: 'project-1',
          title: 'Implement responsive navigation',
          description: 'Build mobile-first responsive navigation component',
          status: 'in-progress',
          priority: 'high',
          assigneeId: 'member-1',
          dueDate: tomorrow.toISOString(),
          tags: ['development', 'frontend'],
          comments: [],
          activities: [
            {
              id: 'activity-2',
              taskId: 'task-2',
              userId: 'member-1',
              action: 'status_changed',
              details: 'Started working on task',
              createdAt: today.toISOString(),
            },
          ],
          createdBy: 'admin-1',
          createdAt: yesterday.toISOString(),
          updatedAt: today.toISOString(),
        },
        {
          id: 'task-3',
          projectId: 'project-1',
          title: 'Set up CI/CD pipeline',
          description: 'Configure automated testing and deployment pipeline',
          status: 'pending',
          priority: 'medium',
          assigneeId: 'admin-1',
          dueDate: nextWeek.toISOString(),
          tags: ['devops'],
          comments: [],
          activities: [],
          createdBy: 'admin-1',
          createdAt: today.toISOString(),
          updatedAt: today.toISOString(),
        },
        {
          id: 'task-4',
          projectId: 'project-2',
          title: 'Setup React Native project',
          description: 'Initialize React Native project with TypeScript and necessary dependencies',
          status: 'completed',
          priority: 'urgent',
          assigneeId: 'member-1',
          dueDate: yesterday.toISOString(),
          tags: ['mobile', 'setup'],
          comments: [],
          activities: [],
          createdBy: 'admin-1',
          createdAt: twoDaysAgo.toISOString(),
          updatedAt: yesterday.toISOString(),
        },
        {
          id: 'task-5',
          projectId: 'project-2',
          title: 'Design app architecture',
          description: 'Plan the overall architecture including state management and API structure',
          status: 'in-progress',
          priority: 'high',
          assigneeId: 'admin-1',
          dueDate: tomorrow.toISOString(),
          tags: ['architecture', 'planning'],
          comments: [],
          activities: [],
          createdBy: 'admin-1',
          createdAt: yesterday.toISOString(),
          updatedAt: today.toISOString(),
        },
        {
          id: 'task-6',
          projectId: 'project-2',
          title: 'Implement authentication flow',
          description: 'Build login, signup, and password reset screens with proper validation',
          status: 'pending',
          priority: 'high',
          assigneeId: 'member-1',
          dueDate: nextWeek.toISOString(),
          tags: ['authentication', 'security'],
          comments: [],
          activities: [],
          createdBy: 'admin-1',
          createdAt: today.toISOString(),
          updatedAt: today.toISOString(),
        },
        {
          id: 'task-7',
          projectId: 'project-3',
          title: 'Create social media calendar',
          description: 'Plan content schedule for Q4 across all platforms',
          status: 'overdue',
          priority: 'high',
          assigneeId: 'member-1',
          dueDate: twoDaysAgo.toISOString(),
          tags: ['marketing', 'social'],
          comments: [],
          activities: [],
          createdBy: 'member-1',
          createdAt: twoDaysAgo.toISOString(),
          updatedAt: today.toISOString(),
        },
        {
          id: 'task-8',
          projectId: 'project-3',
          title: 'Design email templates',
          description: 'Create responsive email templates for campaign',
          status: 'pending',
          priority: 'medium',
          assigneeId: 'member-1',
          dueDate: nextWeek.toISOString(),
          tags: ['email', 'design'],
          comments: [],
          activities: [],
          createdBy: 'member-1',
          createdAt: yesterday.toISOString(),
          updatedAt: yesterday.toISOString(),
        },
      ],

      createTask: (projectId, title, description, priority, createdBy, assigneeId, dueDate, tags = []) => {
        const newTask: Task = {
          id: uuidv4(),
          projectId,
          title,
          description,
          status: 'pending',
          priority,
          assigneeId,
          dueDate,
          tags,
          comments: [],
          activities: [
            {
              id: uuidv4(),
              taskId: '',
              userId: createdBy,
              action: 'created',
              details: 'Task created',
              createdAt: new Date().toISOString(),
            },
          ],
          createdBy,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        newTask.activities[0].taskId = newTask.id;

        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));

        return newTask;
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, ...updates, updatedAt: new Date().toISOString() }
              : t
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
      },

      getTaskById: (id) => {
        return get().tasks.find((t) => t.id === id);
      },

      getTasksByProject: (projectId) => {
        return get().tasks.filter((t) => t.projectId === projectId);
      },

      getTasksByUser: (userId) => {
        return get().tasks.filter(
          (t) => t.createdBy === userId || t.assigneeId === userId
        );
      },

      getTasksByAssignee: (assigneeId) => {
        return get().tasks.filter((t) => t.assigneeId === assigneeId);
      },

      addComment: (taskId, userId, content) => {
        const comment: TaskComment = {
          id: uuidv4(),
          taskId,
          userId,
          content,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  comments: [...t.comments, comment],
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));
      },

      addActivity: (taskId, userId, action, details) => {
        const activity: TaskActivity = {
          id: uuidv4(),
          taskId,
          userId,
          action,
          details,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  activities: [...t.activities, activity],
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));
      },

      updateTaskStatus: (taskId, status, userId) => {
        const statusLabels: Record<TaskStatus, string> = {
          'pending': 'Pending',
          'in-progress': 'In Progress',
          'completed': 'Completed',
          'overdue': 'Overdue',
        };

        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id === taskId) {
              const newActivity: TaskActivity = {
                id: uuidv4(),
                taskId,
                userId,
                action: 'status_changed',
                details: `Changed status to ${statusLabels[status]}`,
                createdAt: new Date().toISOString(),
              };

              return {
                ...t,
                status,
                activities: [...t.activities, newActivity],
                updatedAt: new Date().toISOString(),
              };
            }
            return t;
          }),
        }));
      },

      checkOverdueTasks: () => {
        const now = startOfDay(new Date());
        
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (
              t.status !== 'completed' &&
              t.status !== 'overdue' &&
              t.dueDate &&
              isBefore(parseISO(t.dueDate), now)
            ) {
              return { ...t, status: 'overdue' as TaskStatus };
            }
            return t;
          }),
        }));
      },
    }),
    {
      name: 'task-storage',
    }
  )
);
