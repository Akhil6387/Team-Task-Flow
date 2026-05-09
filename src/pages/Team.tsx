import React, { useMemo } from 'react';
import {
  Users,
  Mail,
  Shield,
  CheckCircle2,
  Clock,
  FolderKanban,
} from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { useAuthStore } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';

export const Team: React.FC = () => {
  const { user, getAllUsers } = useAuthStore();
  const { projects } = useProjectStore();
  const { tasks } = useTaskStore();

  const users = getAllUsers();

  const getUserStats = (userId: string) => {
    const userProjects = projects.filter((p) =>
      p.members.some((m) => m.userId === userId)
    );
    const userTasks = tasks.filter((t) => t.assigneeId === userId);
    const completedTasks = userTasks.filter((t) => t.status === 'completed').length;
    const pendingTasks = userTasks.filter(
      (t) => t.status === 'pending' || t.status === 'in-progress'
    ).length;

    return {
      projects: userProjects.length,
      totalTasks: userTasks.length,
      completedTasks,
      pendingTasks,
      completionRate:
        userTasks.length > 0
          ? Math.round((completedTasks / userTasks.length) * 100)
          : 0,
    };
  };

  const teamStats = useMemo(() => {
    return {
      totalMembers: users.length,
      admins: users.filter((u) => u.role === 'admin').length,
      members: users.filter((u) => u.role === 'member').length,
    };
  }, [users]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Team
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View and manage your team members
        </p>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="p-2 w-12 h-12 mx-auto bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-3">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {teamStats.totalMembers}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Members</p>
        </Card>
        <Card className="text-center">
          <div className="p-2 w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-3">
            <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {teamStats.admins}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Admins</p>
        </Card>
        <Card className="text-center">
          <div className="p-2 w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-3">
            <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {teamStats.members}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Members</p>
        </Card>
      </div>

      {/* Team Members */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          All Team Members
        </h3>
        <div className="space-y-4">
          {users.map((member) => {
            const stats = getUserStats(member.id);
            const isCurrentUser = user?.id === member.id;

            return (
              <div
                key={member.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                  <Avatar name={member.name} size="lg" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {member.name}
                      </h4>
                      {isCurrentUser && (
                        <Badge variant="info" size="sm">You</Badge>
                      )}
                      <Badge
                        variant={member.role === 'admin' ? 'purple' : 'default'}
                        size="sm"
                      >
                        {member.role === 'admin' ? 'Admin' : 'Member'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <Mail className="w-4 h-4" />
                      {member.email}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Joined {format(new Date(member.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 ml-0 md:ml-4">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <FolderKanban className="w-4 h-4" />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {stats.projects}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Projects
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {stats.completedTasks}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Completed
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {stats.pendingTasks}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Pending
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: `${stats.completionRate}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {stats.completionRate}% Rate
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
