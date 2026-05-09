# TaskFlow - Team Task Manager

A modern, feature-rich team task management and collaboration platform built with React, TypeScript, and Tailwind CSS. TaskFlow provides comprehensive project management, task tracking, team collaboration, and analytics features with a beautiful, responsive UI and dark mode support.

![TaskFlow](https://img.shields.io/badge/React-19.2.6-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.17-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Features

### 🔐 User Authentication
- **Signup/Login System**: Secure user registration and authentication
- **Password Security**: Client-side password hashing simulation
- **Role-Based Access**: Two user roles (Admin & Member)
- **Session Persistence**: Automatic login state preservation
- **Protected Routes**: Route guards for authenticated users

### 📊 Dashboard
- **Personal Task Overview**: View all assigned tasks at a glance
- **Project Statistics**: Track progress across all projects
- **Analytics & Charts**: Visual representation of task completion
- **Weekly Activity Graph**: Monitor task creation and completion trends
- **Overdue Task Alerts**: Automatic detection and highlighting
- **Quick Stats Cards**: Total, completed, in-progress, and overdue tasks
- **Upcoming Deadlines**: Stay on top of due dates

### 📁 Project Management
- **Create/Edit/Delete Projects**: Full CRUD operations
- **Project Color Coding**: Visual project identification
- **Team Member Management**: Add/remove members with role assignment
- **Project Roles**: Owner, Admin, and Member roles
- **Progress Tracking**: Real-time completion percentage
- **Project Statistics**: Task counts and status distribution
- **Search & Filtering**: Find projects quickly
- **Status Management**: Active, Completed, and Archived states

### ✅ Task Management
- **Complete Task CRUD**: Create, read, update, and delete tasks
- **Task Assignment**: Assign to team members
- **Priority Levels**: Low, Medium, High, Urgent
- **Task Status**: Pending, In Progress, Completed, Overdue
- **Due Dates**: Set and track deadlines
- **Tags System**: Organize tasks with custom tags
- **Rich Descriptions**: Detailed task information
- **Comments System**: Team collaboration on tasks
- **Activity Timeline**: Track all task changes
- **Multiple Views**: Grid and list view options
- **Advanced Filtering**: By status, priority, project
- **Sorting Options**: Newest, oldest, priority, due date
- **Auto Overdue Detection**: Automatic status updates

### 👥 Team Management
- **Team Directory**: View all team members
- **Member Statistics**: Tasks, projects, and completion rates
- **Role Indicators**: Visual role badges
- **Performance Metrics**: Individual team member analytics

### 🔔 Notifications
- **Real-time Notifications**: Task assignments, comments, completions
- **Unread Count Badge**: Visual notification indicator
- **Notification Types**: Task assigned, due soon, completed, comments
- **Mark as Read**: Individual and bulk actions
- **Persistent Notifications**: Saved across sessions

### ⚙️ Settings
- **Profile Management**: Update name and email
- **Password Change**: Secure password updates
- **Theme Switcher**: Light, Dark, and System modes
- **Notification Preferences**: Granular notification control
- **User Avatar**: Automatic avatar generation from initials

### 🎨 UI/UX Features
- **Responsive Design**: Mobile-first approach, works on all devices
- **Dark Mode**: Full dark mode support with system detection
- **Modern Interface**: Clean, intuitive design
- **Smooth Animations**: Polished transitions and interactions
- **Loading States**: User feedback for async operations
- **Error Handling**: Comprehensive form validation
- **Modal Dialogs**: Confirmation dialogs for destructive actions
- **Toast Notifications**: Success/error messages
- **Custom Scrollbars**: Styled scrollbars in light and dark modes
- **Accessibility**: Semantic HTML and ARIA labels

## 🏗️ Architecture

### Frontend Architecture
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Input, Modal, etc.)
│   └── layout/         # Layout components (Sidebar, Header, Layout)
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Projects.tsx    # Project listing
│   ├── ProjectForm.tsx # Project create/edit
│   ├── ProjectDetail.tsx # Project detail view
│   ├── Tasks.tsx       # Task listing
│   ├── TaskForm.tsx    # Task create/edit
│   ├── TaskDetail.tsx  # Task detail view
│   ├── Team.tsx        # Team management
│   └── Settings.tsx    # User settings
├── store/              # State management (Zustand)
│   ├── authStore.ts    # Authentication state
│   ├── projectStore.ts # Project management state
│   ├── taskStore.ts    # Task management state
│   ├── notificationStore.ts # Notifications
│   └── themeStore.ts   # Theme preferences
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── App.tsx            # Main app component with routing
```

### State Management
- **Zustand**: Lightweight state management
- **Persistence**: Local storage integration
- **Type Safety**: Full TypeScript support
- **Modular Stores**: Separated by domain

### Data Model

#### User
```typescript
{
  id: string
  email: string
  name: string
  avatar?: string
  role: 'admin' | 'member'
  createdAt: string
}
```

#### Project
```typescript
{
  id: string
  name: string
  description: string
  status: 'active' | 'completed' | 'archived'
  color: string
  members: ProjectMember[]
  createdBy: string
  createdAt: string
  updatedAt: string
}
```

#### Task
```typescript
{
  id: string
  projectId: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigneeId?: string
  dueDate?: string
  tags: string[]
  comments: TaskComment[]
  activities: TaskActivity[]
  createdBy: string
  createdAt: string
  updatedAt: string
}
```

## 🛠️ Tech Stack

### Core Technologies
- **React 19.2.6**: Latest React with concurrent features
- **TypeScript 5.9.3**: Type-safe development
- **Vite 7.3.2**: Fast build tool and dev server
- **Tailwind CSS 4.1.17**: Utility-first CSS framework

### State & Routing
- **React Router DOM 7.1.3**: Client-side routing
- **Zustand 5.0.2**: State management with persistence

### UI & Visualization
- **Recharts 2.15.1**: Chart and graph components
- **Lucide React 0.468.0**: Beautiful icon set
- **Date-fns 4.1.0**: Date manipulation and formatting

### Utilities
- **clsx & tailwind-merge**: Conditional className utilities
- **UUID**: Unique identifier generation

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taskflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## 🎯 Usage

### Demo Accounts

#### Admin Account
- **Email**: `admin@taskmanager.com`
- **Password**: `admin123`
- **Capabilities**: Full access, can create projects, manage teams, assign roles

#### Member Account
- **Email**: `member@taskmanager.com`
- **Password**: `member123`
- **Capabilities**: Can view assigned tasks, create tasks in joined projects

### Getting Started

1. **Login**: Use one of the demo accounts or create a new account
2. **Explore Dashboard**: View your tasks, projects, and analytics
3. **Create a Project**: Click "New Project" and fill in the details
4. **Add Team Members**: Manage team members from project details
5. **Create Tasks**: Add tasks to your projects with priorities and due dates
6. **Collaborate**: Comment on tasks and track activity
7. **Monitor Progress**: Check dashboard analytics and project progress

## 🔒 Security Features

- **Password Hashing**: Simulated client-side password hashing (bcrypt-style)
- **Role-Based Access Control**: Granular permissions system
- **Protected Routes**: Automatic redirection for unauthenticated users
- **Input Validation**: Comprehensive form validation
- **XSS Prevention**: React's built-in XSS protection
- **Secure State Management**: Encrypted local storage option

## 🎨 Customization

### Theme Customization
The app supports three theme modes:
- **Light Mode**: Clean, bright interface
- **Dark Mode**: Easy on the eyes for night work
- **System Mode**: Automatically matches OS preference

### Color Scheme
Project colors can be customized from a predefined palette:
```typescript
const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
];
```

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

Features:
- Collapsible sidebar on mobile
- Responsive grid layouts
- Touch-friendly interactions
- Optimized navigation

## 🚀 Performance

- **Code Splitting**: Route-based lazy loading ready
- **Optimized Re-renders**: Memoization with useMemo and useCallback
- **Efficient State Updates**: Zustand's optimized subscriptions
- **Fast Build Times**: Vite's lightning-fast HMR
- **Lazy Loading**: Components load on demand

## 📊 Analytics & Reporting

The dashboard provides:
- **Weekly Activity Charts**: Bar charts for task creation/completion
- **Completion Rate Pie Charts**: Visual progress indicators
- **Task Distribution**: By status and priority
- **Project Progress**: Individual project tracking
- **Team Performance**: Member statistics and completion rates

## 🔄 Future Enhancements

### Backend Integration Ready
The app is structured to easily integrate with a real backend:
- Replace Zustand stores with API calls
- Add JWT token management
- Implement WebSocket for real-time updates
- File upload/attachment support

### Potential Features
- [ ] Kanban board view
- [ ] Calendar view
- [ ] Time tracking
- [ ] File attachments
- [ ] Email notifications
- [ ] Export reports (PDF, Excel)
- [ ] Advanced search with filters
- [ ] Task dependencies
- [ ] Recurring tasks
- [ ] Mobile app (React Native)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Development

### Project Structure Best Practices
- **Component Separation**: UI components separated from business logic
- **Type Safety**: Full TypeScript coverage
- **Clean Code**: ESLint and Prettier configured
- **Modular Design**: Easy to extend and maintain
- **Documentation**: Comprehensive inline comments

### Code Style
- **Functional Components**: Using React hooks
- **TypeScript**: Strict mode enabled
- **Naming Conventions**: Clear, descriptive names
- **File Organization**: Logical grouping by feature

## 🙏 Acknowledgments

- **React Team**: For the amazing framework
- **Tailwind CSS**: For the utility-first CSS framework
- **Recharts**: For beautiful chart components
- **Lucide**: For the comprehensive icon set
- **Zustand**: For simple state management

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**

**Version**: 1.0.0  
**Last Updated**: 2024
