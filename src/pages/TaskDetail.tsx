import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Clock,
  User,
  MessageSquare,
  Activity,
  Send,
  Calendar,
  Tag,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Avatar } from '../components/ui/Avatar';
import { useAuthStore } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { useNotificationStore } from '../store/notificationStore';
import { TaskStatus, TaskPriority } from '../types';
import { cn } from '../utils/cn';

export const TaskDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getUserById } = useAuthStore();
  const { getProjectById, isUserProjectAdmin } = useProjectStore();
  const { getTaskById, deleteTask, updateTaskStatus, addComment, updateTask } = useTaskStore();
  const { addNotification } = useNotificationStore();

  const task = id ? getTaskById(id) : null;
  const project = task ? getProjectById(task.projectId) : null;
  const assignee = task?.assigneeId ? getUserById(task.assigneeId) : null;
  const creator = task ? getUserById(task.createdBy) : null;

  const canEdit = user && task && (
    task.createdBy === user.id ||
    task.assigneeId === user.id ||
    (project && isUserProjectAdmin(project.id, user.id))
  );

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!task) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Task not found
        </h2>
        <Link to="/tasks">
          <Button variant="outline">Back to Tasks</Button>
        </Link>
      </div>
    );
  }

  const handleDeleteTask = () => {
    deleteTask(task.id);
    navigate('/tasks');
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (user) {
      updateTaskStatus(task.id, newStatus, user.id);

      // Notify assignee if task is completed by someone else
      if (newStatus === 'completed' && task.assigneeId && task.assigneeId !== user.id) {
        addNotification(
          task.assigneeId,
          'task_completed',
          'Task Completed',
          `"${task.title}" has been marked as completed`,
          `/tasks/${task.id}`
        );
      }
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    addComment(task.id, user.id, newComment.trim());
    setNewComment('');
    setIsSubmitting(false);

    // Notify task creator or assignee
    const notifyUserId = task.createdBy !== user.id ? task.createdBy :
      task.assigneeId !== user.id ? task.assigneeId : null;
    
    if (notifyUserId) {
      addNotification(
        notifyUserId,
        'comment_added',
        'New Comment',
        `${user.name} commented on "${task.title}"`,
        `/tasks/${task.id}`
      );
    }
  };

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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 mt-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-2">
              {project && (
                <Link
                  to={`/projects/${project.id}`}
                  className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  {project.name}
                </Link>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {task.title}
            </h1>
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center gap-3 ml-12 lg:ml-0">
            <Link to={`/tasks/${task.id}/edit`}>
              <Button variant="outline" size="sm" leftIcon={<Edit2 className="w-4 h-4" />}>
                Edit
              </Button>
            </Link>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={() => setDeleteModalOpen(true)}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Description
            </h3>
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {task.description || 'No description provided.'}
            </p>
          </Card>

          {/* Tags */}
          {task.tags.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Comments & Activity */}
          <Card padding="none">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('comments')}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors',
                    activeTab === 'comments'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                  )}
                >
                  <MessageSquare className="w-4 h-4" />
                  Comments ({task.comments.length})
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors',
                    activeTab === 'activity'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                  )}
                >
                  <Activity className="w-4 h-4" />
                  Activity ({task.activities.length})
                </button>
              </div>
            </div>

            <div className="p-4">
              {activeTab === 'comments' ? (
                <div className="space-y-4">
                  {/* Add Comment */}
                  <div className="flex gap-3">
                    {user && <Avatar name={user.name} size="sm" />}
                    <div className="flex-1">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="min-h-[80px]"
                      />
                      <div className="flex justify-end mt-2">
                        <Button
                          size="sm"
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                          isLoading={isSubmitting}
                          leftIcon={<Send className="w-4 h-4" />}
                        >
                          Comment
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Comments List */}
                  {task.comments.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                      No comments yet
                    </p>
                  ) : (
                    <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {[...task.comments].reverse().map((comment) => {
                        const commentUser = getUserById(comment.userId);
                        return (
                          <div key={comment.id} className="flex gap-3">
                            {commentUser && (
                              <Avatar name={commentUser.name} size="sm" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {commentUser?.name || 'Unknown'}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatDistanceToNow(new Date(comment.createdAt), {
                                    addSuffix: true,
                                  })}
                                </span>
                              </div>
                              <p className="mt-1 text-gray-600 dark:text-gray-400">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {task.activities.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                      No activity yet
                    </p>
                  ) : (
                    [...task.activities].reverse().map((activity) => {
                      const activityUser = getUserById(activity.userId);
                      return (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 py-2"
                        >
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <Activity className="w-4 h-4 text-gray-500" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {activityUser?.name || 'Unknown'}
                              </span>{' '}
                              {activity.details || activity.action}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {formatDistanceToNow(new Date(activity.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <Card>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Status
            </h3>
            <Select
              value={task.status}
              onChange={(val) => handleStatusChange(val as TaskStatus)}
              options={[
                { value: 'pending', label: '⏳ Pending' },
                { value: 'in-progress', label: '🔄 In Progress' },
                { value: 'completed', label: '✅ Completed' },
                { value: 'overdue', label: '⚠️ Overdue' },
              ]}
            />
          </Card>

          {/* Priority */}
          <Card>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Priority
            </h3>
            <Badge variant={getPriorityBadgeVariant(task.priority)} size="md">
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>
          </Card>

          {/* Assignee */}
          <Card>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Assignee
            </h3>
            {assignee ? (
              <div className="flex items-center gap-3">
                <Avatar name={assignee.name} size="sm" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {assignee.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {assignee.email}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Unassigned</p>
            )}
          </Card>

          {/* Due Date */}
          <Card>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Due Date
            </h3>
            {task.dueDate ? (
              <p
                className={cn(
                  'font-medium',
                  task.status === 'overdue'
                    ? 'text-red-500'
                    : 'text-gray-900 dark:text-white'
                )}
              >
                {format(new Date(task.dueDate), 'MMMM d, yyyy')}
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No due date</p>
            )}
          </Card>

          {/* Created By */}
          <Card>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Created By
            </h3>
            {creator && (
              <div className="flex items-center gap-3">
                <Avatar name={creator.name} size="sm" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {creator.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(task.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Task"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this task? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteTask}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
