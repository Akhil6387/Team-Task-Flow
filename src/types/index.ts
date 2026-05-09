// User Types
export type UserRole = 'admin' | 'member';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthUser extends User {
  password: string;
}

// Project Types
export type ProjectStatus = 'active' | 'completed' | 'archived';

export interface ProjectMember {
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  color: string;
  members: ProjectMember[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Task Types
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface TaskActivity {
  id: string;
  taskId: string;
  userId: string;
  action: string;
  details?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
  tags: string[];
  comments: TaskComment[];
  activities: TaskActivity[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export type NotificationType = 'task_assigned' | 'task_due' | 'comment_added' | 'project_invite' | 'task_completed';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  inProgressTasks: number;
  totalProjects: number;
  activeProjects: number;
}

export interface TasksByDate {
  date: string;
  completed: number;
  created: number;
}

export interface TasksByPriority {
  priority: TaskPriority;
  count: number;
}

export interface TasksByProject {
  projectId: string;
  projectName: string;
  total: number;
  completed: number;
}
