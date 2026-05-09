import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthUser, UserRole } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface AuthState {
  user: User | null;
  users: AuthUser[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  signup: (name: string, email: string, password: string, role?: UserRole) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  getUserById: (id: string) => User | undefined;
  getAllUsers: () => User[];
}

// Hash password (simple simulation - in production use bcrypt)
const hashPassword = (password: string): string => {
  return btoa(password + 'salt_key_123');
};

const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      users: [
        {
          id: 'admin-1',
          email: 'admin@taskmanager.com',
          name: 'Admin User',
          password: hashPassword('admin123'),
          role: 'admin',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'member-1',
          email: 'member@taskmanager.com',
          name: 'Team Member',
          password: hashPassword('member123'),
          role: 'member',
          createdAt: new Date().toISOString(),
        },
      ],
      isAuthenticated: false,

      login: (email: string, password: string) => {
        const { users } = get();
        const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        
        if (!user) {
          return { success: false, error: 'User not found' };
        }
        
        if (!verifyPassword(password, user.password)) {
          return { success: false, error: 'Invalid password' };
        }

        const { password: _, ...userWithoutPassword } = user;
        set({ user: userWithoutPassword, isAuthenticated: true });
        return { success: true };
      },

      signup: (name: string, email: string, password: string, role: UserRole = 'member') => {
        const { users } = get();
        
        if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
          return { success: false, error: 'Email already exists' };
        }

        const newUser: AuthUser = {
          id: uuidv4(),
          email,
          name,
          password: hashPassword(password),
          role,
          createdAt: new Date().toISOString(),
        };

        const { password: _, ...userWithoutPassword } = newUser;
        
        set((state) => ({
          users: [...state.users, newUser],
          user: userWithoutPassword,
          isAuthenticated: true,
        }));

        return { success: true };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: (updates: Partial<User>) => {
        const { user, users } = get();
        if (!user) return;

        const updatedUser = { ...user, ...updates };
        const updatedUsers = users.map((u) =>
          u.id === user.id ? { ...u, ...updates } : u
        );

        set({ user: updatedUser, users: updatedUsers });
      },

      getUserById: (id: string) => {
        const { users } = get();
        const user = users.find((u) => u.id === id);
        if (user) {
          const { password: _, ...userWithoutPassword } = user;
          return userWithoutPassword;
        }
        return undefined;
      },

      getAllUsers: () => {
        const { users } = get();
        return users.map(({ password: _, ...user }) => user);
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
