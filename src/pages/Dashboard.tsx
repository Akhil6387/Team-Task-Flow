import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  FolderKanban,
  ListTodo,
  ArrowRight,
  Plus,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { format, subDays, startOfDay, isAfter, isBefore } from 'date-fns';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { useAuthStore } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { Task, TaskStatus, TaskPriority } from '../types';
import { cn } from '../utils/cn';

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  urgent: '#ef4444',
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  pending: '#6b7280',
  'in-progress': '#3b82f6',
  completed: '#22c55e',
  overdue: '#ef4444',
};

export const Dashboard: React.FC = () => {
  const { user, getUserById } = useAuthStore();
  const { projects, getProjectsByUser } = useProjectStore();
  const { tasks, checkOverdueTasks, getTasksByAssignee } = useTaskStore();

  useEffect(() => {
    checkOverdueTasks();
  }, [checkOverdueTasks]);

  const userProjects = user ? getProjectsByUser(user.id) : [];
  const userTasks = user ? getTasksByAssignee(user.id) : [];

  // Calculate stats
  const stats = useMemo(() => {
    const allUserTasks = userTasks;
    return {
      total: allUserTasks.length,
      completed: allUserTasks.filter((t) => t.status === 'completed').length,
      pending: allUserTasks.filter((t) => t.status === 'pending').length,
      inProgress: allUserTasks.filter((t) => t.status === 'in-progress').length,
      overdue: allUserTasks.filter((t) => t.status === 'overdue').length,
      projects: userProjects.length,
    };
  }, [userTasks, userProjects]);

  // Task completion rate
  const completionRate = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  // Tasks by priority for pie chart
  const tasksByPriority = useMemo(() => {
    const counts: Record<TaskPriority, number> = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    };
    
    userTasks.forEach((task) => {
      if (task.status !== 'completed') {
        counts[task.priority]++;
      }
    });

    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([priority, count]) => ({
        name: priority.charAt(0).toUpperCase() + priority.slice(1),
        value: count,
        color: PRIORITY_COLORS[priority as TaskPriority],
      }));
  }, [userTasks]);

  // Tasks by status for pie chart
  const tasksByStatus = useMemo(() => {
    const counts: Record<TaskStatus, number> = {
      pending: 0,
      'in-progress': 0,
      completed: 0,
      overdue: 0,
    };
    
    userTasks.forEach((task) => {
      counts[task.status]++;
    });

    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        name: status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        color: STATUS_COLORS[status as TaskStatus],
      }));
  }, [userTasks]);

  // Weekly task data
  const weeklyData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      const dayTasks = tasks.filter((t) => {
        const taskDate = startOfDay(new Date(t.createdAt));
        return taskDate.getTime() === date.getTime();
      });
      
      data.push({
        day: format(date, 'EEE'),
        created: dayTasks.length,
        completed: dayTasks.filter((t) => t.status === 'completed').length,
      });
    }
    return data;
  }, [tasks]);

  // Recent tasks
  const recentTasks = useMemo(() => {
    return [...userTasks]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [userTasks]);

  // Upcoming deadlines
  const upcomingTasks = useMemo(() => {
    const now = new Date();
    return userTasks
      .filter((t) => t.dueDate && t.status !== 'completed' && isAfter(new Date(t.dueDate), now))
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);
  }, [userTasks]);

  const getStatusBadgeVariant = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'info';
      case 'overdue':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getPriorityBadgeVariant = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's what's happening with your projects today.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/projects/new">
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              New Project
            </Button>
          </Link>
          <Link to="/tasks/new">
            <Button variant="outline" leftIcon={<Plus className="w-4 h-4" />}>
              New Task
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ListTodo className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full opacity-50" />
        </Card>

        <Card className="relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.completed}
              </p>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full opacity-50" />
        </Card>

        <Card className="relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.inProgress}
              </p>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-yellow-100 dark:bg-yellow-900/20 rounded-full opacity-50" />
        </Card>

        <Card className="relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.overdue}
              </p>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full opacity-50" />
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly Activity */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Weekly Activity
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-gray-600 dark:text-gray-400">Created</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-600 dark:text-gray-400">Completed</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="created" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Completion Rate */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Completion Rate
          </h3>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tasksByStatus}
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {tasksByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {tasksByStatus.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Tasks and Projects Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Tasks
            </h3>
            <Link
              to="/tasks"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentTasks.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No tasks yet
              </p>
            ) : (
              recentTasks.map((task) => (
                <Link
                  key={task.id}
                  to={`/tasks/${task.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        task.status === 'completed' && 'bg-green-500',
                        task.status === 'in-progress' && 'bg-blue-500',
                        task.status === 'pending' && 'bg-gray-400',
                        task.status === 'overdue' && 'bg-red-500'
                      )}
                    />
                    <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityBadgeVariant(task.priority)} size="sm">
                      {task.priority}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(task.status)} size="sm">
                      {task.status}
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upcoming Deadlines
            </h3>
            <Link
              to="/tasks"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingTasks.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No upcoming deadlines
              </p>
            ) : (
              upcomingTasks.map((task) => (
                <Link
                  key={task.id}
                  to={`/tasks/${task.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 dark:text-white font-medium truncate">
                      {task.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Due {format(new Date(task.dueDate!), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <Badge variant={getPriorityBadgeVariant(task.priority)} size="sm">
                    {task.priority}
                  </Badge>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Projects Overview */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Your Projects
          </h3>
          <Link
            to="/projects"
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {userProjects.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 col-span-full text-center py-4">
              No projects yet
            </p>
          ) : (
            userProjects.slice(0, 6).map((project) => {
              const projectTasks = tasks.filter((t) => t.projectId === project.id);
              const completedTasks = projectTasks.filter(
                (t) => t.status === 'completed'
              ).length;
              const progress =
                projectTasks.length > 0
                  ? Math.round((completedTasks / projectTasks.length) * 100)
                  : 0;

              return (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {project.name}
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Progress
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: project.color,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        {completedTasks}/{projectTasks.length} tasks
                      </span>
                      <div className="flex -space-x-2">
                        {project.members.slice(0, 3).map((member) => {
                          const memberUser = getUserById(member.userId);
                          return memberUser ? (
                            <Avatar
                              key={member.userId}
                              name={memberUser.name}
                              size="xs"
                              className="ring-2 ring-white dark:ring-gray-800"
                            />
                          ) : null;
                        })}
                        {project.members.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400 ring-2 ring-white dark:ring-gray-800">
                            +{project.members.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
};
