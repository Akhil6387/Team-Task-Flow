import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Users,
  Settings,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MoreVertical,
  UserPlus,
  UserMinus,
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { Avatar } from '../components/ui/Avatar';
import { useAuthStore } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { TaskStatus, TaskPriority, ProjectMember } from '../types';
import { cn } from '../utils/cn';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getUserById, getAllUsers } = useAuthStore();
  const {
    getProjectById,
    deleteProject,
    isUserProjectAdmin,
    addMember,
    removeMember,
    updateMemberRole,
  } = useProjectStore();
  const { getTasksByProject, deleteTask } = useTaskStore();

  const project = id ? getProjectById(id) : null;
  const projectTasks = id ? getTasksByProject(id) : [];
  const isAdmin = user && project && isUserProjectAdmin(project.id, user.id);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'all' | TaskStatus>('all');
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [memberRole, setMemberRole] = useState<ProjectMember['role']>('member');

  const filteredTasks = useMemo(() => {
    return projectTasks.filter((task) => {
      return taskFilter === 'all' || task.status === taskFilter;
    });
  }, [projectTasks, taskFilter]);

  const stats = useMemo(() => {
    return {
      total: projectTasks.length,
      completed: projectTasks.filter((t) => t.status === 'completed').length,
      inProgress: projectTasks.filter((t) => t.status === 'in-progress').length,
      pending: projectTasks.filter((t) => t.status === 'pending').length,
      overdue: projectTasks.filter((t) => t.status === 'overdue').length,
    };
  }, [projectTasks]);

  const progress = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  const allUsers = getAllUsers();
  const availableUsers = allUsers.filter(
    (u) => !project?.members.some((m) => m.userId === u.id)
  );

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Project not found
        </h2>
        <Link to="/projects">
          <Button variant="outline">Back to Projects</Button>
        </Link>
      </div>
    );
  }

  const handleDeleteProject = () => {
    deleteProject(project.id);
    navigate('/projects');
  };

  const handleAddMember = () => {
    if (selectedUserId && project) {
      addMember(project.id, selectedUserId, memberRole);
      setSelectedUserId('');
      setMemberRole('member');
    }
  };

  const handleRemoveMember = (userId: string) => {
    if (project) {
      removeMember(project.id, userId);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            to="/projects"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 mt-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: project.color }}
            >
              {project.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {project.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {project.description}
              </p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-3 ml-12 lg:ml-0">
            <Button
              variant="outline"
              leftIcon={<Users className="w-4 h-4" />}
              onClick={() => setTeamModalOpen(true)}
            >
              Manage Team
            </Button>
            <Link to={`/projects/${project.id}/edit`}>
              <Button variant="outline" leftIcon={<Edit2 className="w-4 h-4" />}>
                Edit
              </Button>
            </Link>
            <Button
              variant="danger"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={() => setDeleteModalOpen(true)}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.total}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.completed}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.inProgress}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {stats.pending}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.overdue}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Overall Progress
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {progress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="h-3 rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              backgroundColor: project.color,
            }}
          />
        </div>
      </Card>

      {/* Team Members */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Team Members ({project.members.length})
          </h3>
        </div>
        <div className="flex flex-wrap gap-4">
          {project.members.map((member) => {
            const memberUser = getUserById(member.userId);
            if (!memberUser) return null;
            return (
              <div
                key={member.userId}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
              >
                <Avatar name={memberUser.name} size="md" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {memberUser.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {member.role}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Tasks */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tasks
          </h3>
          <div className="flex items-center gap-3">
            <Select
              value={taskFilter}
              onChange={(val) => setTaskFilter(val as 'all' | TaskStatus)}
              options={[
                { value: 'all', label: 'All Tasks' },
                { value: 'pending', label: 'Pending' },
                { value: 'in-progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
                { value: 'overdue', label: 'Overdue' },
              ]}
            />
            <Link to={`/tasks/new?projectId=${project.id}`}>
              <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                Add Task
              </Button>
            </Link>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No tasks found
            </p>
            <Link to={`/tasks/new?projectId=${project.id}`}>
              <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                Create First Task
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => {
              const assignee = task.assigneeId
                ? getUserById(task.assigneeId)
                : null;
              return (
                <Link
                  key={task.id}
                  to={`/tasks/${task.id}`}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'w-3 h-3 rounded-full',
                        task.status === 'completed' && 'bg-green-500',
                        task.status === 'in-progress' && 'bg-blue-500',
                        task.status === 'pending' && 'bg-gray-400',
                        task.status === 'overdue' && 'bg-red-500'
                      )}
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
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
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityBadgeVariant(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(task.status)}>
                      {task.status === 'in-progress' ? 'In Progress' : task.status}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Project"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this project? All tasks will be lost.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteProject}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Team Management Modal */}
      <Modal
        isOpen={teamModalOpen}
        onClose={() => setTeamModalOpen(false)}
        title="Manage Team"
        size="lg"
      >
        <div className="space-y-6">
          {/* Add Member */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Add Team Member
            </h4>
            <div className="flex gap-3">
              <div className="flex-1">
                <Select
                  value={selectedUserId}
                  onChange={setSelectedUserId}
                  options={[
                    { value: '', label: 'Select a user...' },
                    ...availableUsers.map((u) => ({
                      value: u.id,
                      label: u.name,
                    })),
                  ]}
                />
              </div>
              <Select
                value={memberRole}
                onChange={(val) => setMemberRole(val as ProjectMember['role'])}
                options={[
                  { value: 'member', label: 'Member' },
                  { value: 'admin', label: 'Admin' },
                ]}
              />
              <Button onClick={handleAddMember} disabled={!selectedUserId}>
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Current Members */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Current Members
            </h4>
            <div className="space-y-2">
              {project.members.map((member) => {
                const memberUser = getUserById(member.userId);
                if (!memberUser) return null;
                const isOwner = member.role === 'owner';
                return (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={memberUser.name} size="sm" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {memberUser.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {memberUser.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isOwner && (
                        <>
                          <Select
                            value={member.role}
                            onChange={(val) =>
                              updateMemberRole(
                                project.id,
                                member.userId,
                                val as ProjectMember['role']
                              )
                            }
                            options={[
                              { value: 'member', label: 'Member' },
                              { value: 'admin', label: 'Admin' },
                            ]}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member.userId)}
                          >
                            <UserMinus className="w-4 h-4 text-red-500" />
                          </Button>
                        </>
                      )}
                      {isOwner && (
                        <Badge variant="purple">Owner</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
