import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, ProjectMember, ProjectStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ProjectState {
  projects: Project[];
  createProject: (
    name: string,
    description: string,
    color: string,
    createdBy: string
  ) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
  getProjectsByUser: (userId: string) => Project[];
  addMember: (projectId: string, userId: string, role: ProjectMember['role']) => void;
  removeMember: (projectId: string, userId: string) => void;
  updateMemberRole: (projectId: string, userId: string, role: ProjectMember['role']) => void;
  isUserProjectAdmin: (projectId: string, userId: string) => boolean;
  isUserProjectMember: (projectId: string, userId: string) => boolean;
}

const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
];

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [
        {
          id: 'project-1',
          name: 'Website Redesign',
          description: 'Complete overhaul of the company website with modern design principles',
          status: 'active',
          color: '#6366f1',
          members: [
            { userId: 'admin-1', role: 'owner', joinedAt: new Date().toISOString() },
            { userId: 'member-1', role: 'member', joinedAt: new Date().toISOString() },
          ],
          createdBy: 'admin-1',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'project-2',
          name: 'Mobile App Development',
          description: 'Build cross-platform mobile application for iOS and Android',
          status: 'active',
          color: '#22c55e',
          members: [
            { userId: 'admin-1', role: 'owner', joinedAt: new Date().toISOString() },
            { userId: 'member-1', role: 'admin', joinedAt: new Date().toISOString() },
          ],
          createdBy: 'admin-1',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'project-3',
          name: 'Marketing Campaign',
          description: 'Q4 marketing campaign planning and execution',
          status: 'active',
          color: '#ec4899',
          members: [
            { userId: 'member-1', role: 'owner', joinedAt: new Date().toISOString() },
          ],
          createdBy: 'member-1',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],

      createProject: (name, description, color, createdBy) => {
        const newProject: Project = {
          id: uuidv4(),
          name,
          description,
          status: 'active',
          color: color || PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)],
          members: [
            { userId: createdBy, role: 'owner', joinedAt: new Date().toISOString() },
          ],
          createdBy,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          projects: [...state.projects, newProject],
        }));

        return newProject;
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, ...updates, updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        }));
      },

      getProjectById: (id) => {
        return get().projects.find((p) => p.id === id);
      },

      getProjectsByUser: (userId) => {
        return get().projects.filter((p) =>
          p.members.some((m) => m.userId === userId)
        );
      },

      addMember: (projectId, userId, role) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id === projectId && !p.members.some((m) => m.userId === userId)) {
              return {
                ...p,
                members: [
                  ...p.members,
                  { userId, role, joinedAt: new Date().toISOString() },
                ],
                updatedAt: new Date().toISOString(),
              };
            }
            return p;
          }),
        }));
      },

      removeMember: (projectId, userId) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id === projectId) {
              return {
                ...p,
                members: p.members.filter((m) => m.userId !== userId),
                updatedAt: new Date().toISOString(),
              };
            }
            return p;
          }),
        }));
      },

      updateMemberRole: (projectId, userId, role) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id === projectId) {
              return {
                ...p,
                members: p.members.map((m) =>
                  m.userId === userId ? { ...m, role } : m
                ),
                updatedAt: new Date().toISOString(),
              };
            }
            return p;
          }),
        }));
      },

      isUserProjectAdmin: (projectId, userId) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (!project) return false;
        const member = project.members.find((m) => m.userId === userId);
        return member?.role === 'owner' || member?.role === 'admin';
      },

      isUserProjectMember: (projectId, userId) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (!project) return false;
        return project.members.some((m) => m.userId === userId);
      },
    }),
    {
      name: 'project-storage',
    }
  )
);
