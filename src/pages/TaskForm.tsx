import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { useNotificationStore } from '../store/notificationStore';
import { TaskPriority } from '../types';
import { cn } from '../utils/cn';

export const TaskForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const preselectedProjectId = searchParams.get('projectId');
  
  const { user, getAllUsers } = useAuthStore();
  const { getProjectsByUser } = useProjectStore();
  const { createTask, updateTask, getTaskById } = useTaskStore();
  const { addNotification } = useNotificationStore();

  const isEditing = !!id;
  const task = isEditing ? getTaskById(id) : null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const userProjects = user ? getProjectsByUser(user.id) : [];
  const allUsers = getAllUsers();

  useEffect(() => {
    if (isEditing && task) {
      setTitle(task.title);
      setDescription(task.description);
      setProjectId(task.projectId);
      setPriority(task.priority);
      setAssigneeId(task.assigneeId || '');
      setDueDate(task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '');
      setTags(task.tags);
    } else if (preselectedProjectId) {
      setProjectId(preselectedProjectId);
    }
  }, [isEditing, task, preselectedProjectId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!projectId) {
      newErrors.projectId = 'Please select a project';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate() || !user) return;

    setIsLoading(true);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const dueDateISO = dueDate ? new Date(dueDate).toISOString() : undefined;

    if (isEditing && task) {
      updateTask(task.id, {
        title,
        description,
        projectId,
        priority,
        assigneeId: assigneeId || undefined,
        dueDate: dueDateISO,
        tags,
      });
      navigate(`/tasks/${task.id}`);
    } else {
      const newTask = createTask(
        projectId,
        title,
        description,
        priority,
        user.id,
        assigneeId || undefined,
        dueDateISO,
        tags
      );

      // Send notification if assigned to someone else
      if (assigneeId && assigneeId !== user.id) {
        addNotification(
          assigneeId,
          'task_assigned',
          'New Task Assigned',
          `You have been assigned to "${title}"`,
          `/tasks/${newTask.id}`
        );
      }

      navigate(`/tasks/${newTask.id}`);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isEditing ? 'Update your task details' : 'Add a new task to your project'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            error={errors.title}
          />

          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what needs to be done"
          />

          <div className="grid md:grid-cols-2 gap-4">
            <Select
              label="Project"
              value={projectId}
              onChange={setProjectId}
              options={[
                { value: '', label: 'Select a project...' },
                ...userProjects.map((p) => ({
                  value: p.id,
                  label: p.name,
                })),
              ]}
              error={errors.projectId}
            />

            <Select
              label="Priority"
              value={priority}
              onChange={(val) => setPriority(val as TaskPriority)}
              options={[
                { value: 'low', label: '🟢 Low' },
                { value: 'medium', label: '🟡 Medium' },
                { value: 'high', label: '🟠 High' },
                { value: 'urgent', label: '🔴 Urgent' },
              ]}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Select
              label="Assignee"
              value={assigneeId}
              onChange={setAssigneeId}
              options={[
                { value: '', label: 'Unassigned' },
                ...allUsers.map((u) => ({
                  value: u.id,
                  label: u.name,
                })),
              ]}
            />

            <Input
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a tag..."
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {isEditing ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
