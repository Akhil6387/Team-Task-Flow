import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Palette } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Card } from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';
import { cn } from '../utils/cn';

const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
];

export const ProjectForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthStore();
  const { createProject, updateProject, getProjectById, isUserProjectAdmin } = useProjectStore();

  const isEditing = !!id;
  const project = isEditing ? getProjectById(id) : null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditing && project) {
      setName(project.name);
      setDescription(project.description);
      setColor(project.color);
    }
  }, [isEditing, project]);

  // Check access
  useEffect(() => {
    if (isEditing && project && user) {
      if (!isUserProjectAdmin(project.id, user.id)) {
        navigate('/projects');
      }
    }
  }, [isEditing, project, user, isUserProjectAdmin, navigate]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (name.length < 3) {
      newErrors.name = 'Project name must be at least 3 characters';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate() || !user) return;

    setIsLoading(true);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (isEditing && project) {
      updateProject(project.id, { name, description, color });
      navigate(`/projects/${project.id}`);
    } else {
      const newProject = createProject(name, description, color, user.id);
      navigate(`/projects/${newProject.id}`);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/projects"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Project' : 'Create New Project'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isEditing ? 'Update your project details' : 'Set up a new project for your team'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter project name"
            error={errors.name}
          />

          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your project goals and objectives"
            error={errors.description}
          />

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project Color
            </label>
            <div className="flex flex-wrap gap-3">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-10 h-10 rounded-lg transition-all duration-200',
                    color === c && 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white dark:ring-offset-gray-800'
                  )}
                  style={{ backgroundColor: c }}
                >
                  {color === c && (
                    <span className="flex items-center justify-center text-white">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preview
            </label>
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: color }}
                >
                  {name ? name.charAt(0).toUpperCase() : 'P'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {name || 'Project Name'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {description || 'Project description'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/projects')}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {isEditing ? 'Update Project' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
