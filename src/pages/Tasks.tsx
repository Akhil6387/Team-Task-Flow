import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  LayoutGrid,
  List,
  SortAsc,
} from 'lucide-react';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { useAuthStore } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { Task, TaskStatus, TaskPriority } from '../types';
import { cn } from '../utils/cn';

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'priority' | 'dueDate';

export const Tasks: React.FC = () => {
  const { user, getUserById } = useAuthStore();
  const { getProjectById } = useProjectStore();
  const { tasks, checkOverdueTasks, getTasksByAssignee } = useTaskStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  useEffect(() => {
    checkOverdueTasks();
  }, [checkOverdueTasks]);

  const userTasks = user ? getTasksByAssignee(user.id) : [];

  const filteredTasks = useMemo(() => {
    let result = [...userTasks];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((task) => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      result = result.filter((task) => task.priority === priorityFilter);
    }

    // Sorting
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    result.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'priority':
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [userTasks, searchQuery, statusFilter, priorityFilter, sortBy]);

  const stats = useMemo(() => {
    return {
      total: userTasks.length,
      pending: userTasks.filter((t) => t.status === 'pending').length,
      inProgress: userTasks.filter((t) => t.status === 'in-progress').length,
      completed: userTasks.filter((t) => t.status === 'completed').length,
      overdue: userTasks.filter((t) => t.status === 'overdue').length,
    };
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

  const TaskCard = ({ task }: { task: Task }) => {
    const project = getProjectById(task.projectId);
    const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;

    return (
      <Link to={`/tasks/${task.id}`}>
        <Card hover className="h-full">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {project && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
              )}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {project?.name || 'No Project'}
              </span>
            </div>
            <Badge variant={getPriorityBadgeVariant(task.priority)} size="sm">
              {task.priority}
            </Badge>
          </div>

          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {task.title}
          </h3>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
            {task.description}
          </p>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {task.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                >
                  {tag}
                </span>
              ))}
              {task.tags.length > 3 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  +{task.tags.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(task.status)} size="sm">
                {task.status === 'in-progress' ? 'In Progress' : task.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {task.dueDate && (
                <span
                  className={cn(
                    'text-xs flex items-center gap-1',
                    task.status === 'overdue'
                      ? 'text-red-500'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {format(new Date(task.dueDate), 'MMM d')}
                </span>
              )}
              {assignee && <Avatar name={assignee.name} size="xs" />}
            </div>
          </div>
        </Card>
      </Link>
    );
  };

  const TaskListItem = ({ task }: { task: Task }) => {
    const project = getProjectById(task.projectId);
    const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;

    return (
      <Link to={`/tasks/${task.id}`}>
        <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div
              className={cn(
                'w-3 h-3 rounded-full flex-shrink-0',
                task.status === 'completed' && 'bg-green-500',
                task.status === 'in-progress' && 'bg-blue-500',
                task.status === 'pending' && 'bg-gray-400',
                task.status === 'overdue' && 'bg-red-500'
              )}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {task.title}
                </p>
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                {project && (
                  <span className="flex items-center gap-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    {project.name}
                  </span>
                )}
                {task.dueDate && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {format(new Date(task.dueDate), 'MMM d')}
                  </span>
                )}
                {assignee && (
                  <span className="flex items-center gap-1">
                    <Avatar name={assignee.name} size="xs" />
                    {assignee.name}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Badge variant={getPriorityBadgeVariant(task.priority)} size="sm">
              {task.priority}
            </Badge>
            <Badge variant={getStatusBadgeVariant(task.status)} size="sm">
              {task.status === 'in-progress' ? 'In Progress' : task.status}
            </Badge>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and track your assigned tasks
          </p>
        </div>
        <Link to="/tasks/new">
          <Button leftIcon={<Plus className="w-4 h-4" />}>
            New Task
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <button
          onClick={() => setStatusFilter('all')}
          className={cn(
            'p-3 rounded-lg border transition-colors text-left',
            statusFilter === 'all'
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
          )}
        >
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.total}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">All Tasks</p>
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={cn(
            'p-3 rounded-lg border transition-colors text-left',
            statusFilter === 'pending'
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
          )}
        >
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {stats.pending}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
        </button>
        <button
          onClick={() => setStatusFilter('in-progress')}
          className={cn(
            'p-3 rounded-lg border transition-colors text-left',
            statusFilter === 'in-progress'
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
          )}
        >
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.inProgress}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
        </button>
        <button
          onClick={() => setStatusFilter('completed')}
          className={cn(
            'p-3 rounded-lg border transition-colors text-left',
            statusFilter === 'completed'
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
          )}
        >
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.completed}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
        </button>
        <button
          onClick={() => setStatusFilter('overdue')}
          className={cn(
            'p-3 rounded-lg border transition-colors text-left',
            statusFilter === 'overdue'
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
          )}
        >
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.overdue}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
        </button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
            />
          </div>
          <div className="flex gap-3">
            <Select
              value={priorityFilter}
              onChange={(val) => setPriorityFilter(val as TaskPriority | 'all')}
              options={[
                { value: 'all', label: 'All Priorities' },
                { value: 'urgent', label: 'Urgent' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
            />
            <Select
              value={sortBy}
              onChange={(val) => setSortBy(val as SortOption)}
              options={[
                { value: 'newest', label: 'Newest' },
                { value: 'oldest', label: 'Oldest' },
                { value: 'priority', label: 'Priority' },
                { value: 'dueDate', label: 'Due Date' },
              ]}
            />
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2.5',
                  viewMode === 'grid'
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2.5',
                  viewMode === 'list'
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Tasks Display */}
      {filteredTasks.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No tasks found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first task to get started'}
          </p>
          <Link to="/tasks/new">
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              Create Task
            </Button>
          </Link>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <TaskListItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};
