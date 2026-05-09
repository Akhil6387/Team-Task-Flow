# TaskFlow API Documentation

This document outlines the data structure and simulated API endpoints for the TaskFlow application. While the current implementation uses client-side state management (Zustand), this documentation serves as a blueprint for backend API integration.

## 🔐 Authentication

### POST /api/auth/signup
Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "member" // or "admin"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "member",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "token": "jwt-token"
}
```

### POST /api/auth/login
Authenticate a user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "member",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "token": "jwt-token"
}
```

### POST /api/auth/logout
Logout the current user.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /api/auth/me
Get current user information.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "  ",
  "email": "john@example.com",
  "role": "member",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

## 👥 Users

### GET /api/users
Get all users (admin only or team members).

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "member",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### GET /api/users/:id
Get user by ID.

**Response:**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "member",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### PUT /api/users/:id
Update user profile.

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "john.new@example.com"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "John Updated",
  "email": "john.new@example.com",
  "role": "member",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### PUT /api/users/:id/password
Change user password.

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

## 📁 Projects

### GET /api/projects
Get all projects for the current user.

**Query Parameters:**
- `status`: Filter by status (active, completed, archived)
- `search`: Search by name

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Website Redesign",
    "description": "Complete overhaul of the company website",
    "status": "active",
    "color": "#6366f1",
    "members": [
      {
        "userId": "user-uuid",
        "role": "owner",
        "joinedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "createdBy": "user-uuid",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### GET /api/projects/:id
Get project by ID.

**Response:**
```json
{
  "id": "uuid",
  "name": "Website Redesign",
  "description": "Complete overhaul of the company website",
  "status": "active",
  "color": "#6366f1",
  "members": [...],
  "createdBy": "user-uuid",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### POST /api/projects
Create a new project.

**Request Body:**
```json
{
  "name": "New Project",
  "description": "Project description",
  "color": "#6366f1"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "New Project",
  "description": "Project description",
  "status": "active",
  "color": "#6366f1",
  "members": [
    {
      "userId": "creator-uuid",
      "role": "owner",
      "joinedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "createdBy": "creator-uuid",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### PUT /api/projects/:id
Update project.

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "completed"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Updated Project Name",
  ...
}
```

### DELETE /api/projects/:id
Delete project (admin/owner only).

**Response:**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

### POST /api/projects/:id/members
Add member to project.

**Request Body:**
```json
{
  "userId": "user-uuid",
  "role": "member" // or "admin"
}
```

**Response:**
```json
{
  "success": true,
  "project": {
    "id": "uuid",
    "members": [...]
  }
}
```

### DELETE /api/projects/:id/members/:userId
Remove member from project.

**Response:**
```json
{
  "success": true,
  "message": "Member removed successfully"
}
```

### PUT /api/projects/:id/members/:userId
Update member role.

**Request Body:**
```json
{
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "member": {
    "userId": "user-uuid",
    "role": "admin",
    "joinedAt": "2024-01-01T00:00:00Z"
  }
}
```

## ✅ Tasks

### GET /api/tasks
Get all tasks for the current user.

**Query Parameters:**
- `projectId`: Filter by project
- `status`: Filter by status
- `priority`: Filter by priority
- `assigneeId`: Filter by assignee
- `search`: Search in title and description
- `sortBy`: Sort by (newest, oldest, priority, dueDate)

**Response:**
```json
[
  {
    "id": "uuid",
    "projectId": "project-uuid",
    "title": "Design homepage mockup",
    "description": "Create wireframes and high-fidelity mockups",
    "status": "in-progress",
    "priority": "high",
    "assigneeId": "user-uuid",
    "dueDate": "2024-12-31T00:00:00Z",
    "tags": ["design", "ui"],
    "comments": [...],
    "activities": [...],
    "createdBy": "user-uuid",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### GET /api/tasks/:id
Get task by ID.

**Response:**
```json
{
  "id": "uuid",
  "projectId": "project-uuid",
  "title": "Design homepage mockup",
  ...
}
```

### POST /api/tasks
Create a new task.

**Request Body:**
```json
{
  "projectId": "project-uuid",
  "title": "New Task",
  "description": "Task description",
  "priority": "medium",
  "assigneeId": "user-uuid",
  "dueDate": "2024-12-31T00:00:00Z",
  "tags": ["tag1", "tag2"]
}
```

**Response:**
```json
{
  "id": "uuid",
  "projectId": "project-uuid",
  "title": "New Task",
  "status": "pending",
  ...
}
```

### PUT /api/tasks/:id
Update task.

**Request Body:**
```json
{
  "title": "Updated Task",
  "description": "Updated description",
  "priority": "high",
  "status": "in-progress"
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Updated Task",
  ...
}
```

### DELETE /api/tasks/:id
Delete task.

**Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

### PUT /api/tasks/:id/status
Update task status.

**Request Body:**
```json
{
  "status": "completed"
}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "completed",
  ...
}
```

### POST /api/tasks/:id/comments
Add comment to task.

**Request Body:**
```json
{
  "content": "This is a comment"
}
```

**Response:**
```json
{
  "id": "comment-uuid",
  "taskId": "task-uuid",
  "userId": "user-uuid",
  "content": "This is a comment",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### GET /api/tasks/:id/comments
Get all comments for a task.

**Response:**
```json
[
  {
    "id": "comment-uuid",
    "taskId": "task-uuid",
    "userId": "user-uuid",
    "content": "This is a comment",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### GET /api/tasks/:id/activities
Get activity log for a task.

**Response:**
```json
[
  {
    "id": "activity-uuid",
    "taskId": "task-uuid",
    "userId": "user-uuid",
    "action": "status_changed",
    "details": "Changed status to Completed",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

## 🔔 Notifications

### GET /api/notifications
Get notifications for current user.

**Query Parameters:**
- `read`: Filter by read status (true/false)
- `limit`: Number of notifications to return

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "user-uuid",
    "type": "task_assigned",
    "title": "New Task Assigned",
    "message": "You have been assigned to 'Design homepage'",
    "read": false,
    "link": "/tasks/task-uuid",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### PUT /api/notifications/:id/read
Mark notification as read.

**Response:**
```json
{
  "success": true,
  "notification": {
    "id": "uuid",
    "read": true
  }
}
```

### PUT /api/notifications/read-all
Mark all notifications as read.

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

### DELETE /api/notifications/:id
Delete notification.

**Response:**
```json
{
  "success": true,
  "message": "Notification deleted"
}
```

## 📊 Analytics

### GET /api/analytics/dashboard
Get dashboard statistics.

**Response:**
```json
{
  "totalTasks": 45,
  "completedTasks": 23,
  "pendingTasks": 12,
  "inProgressTasks": 8,
  "overdueTasks": 2,
  "totalProjects": 5,
  "activeProjects": 3,
  "completionRate": 51
}
```

### GET /api/analytics/tasks/weekly
Get weekly task statistics.

**Response:**
```json
[
  {
    "date": "2024-01-01",
    "created": 5,
    "completed": 3
  }
]
```

### GET /api/analytics/tasks/by-priority
Get tasks grouped by priority.

**Response:**
```json
[
  {
    "priority": "urgent",
    "count": 5
  },
  {
    "priority": "high",
    "count": 12
  }
]
```

### GET /api/analytics/tasks/by-status
Get tasks grouped by status.

**Response:**
```json
[
  {
    "status": "completed",
    "count": 23
  },
  {
    "status": "in-progress",
    "count": 8
  }
]
```

### GET /api/analytics/projects/:id
Get analytics for a specific project.

**Response:**
```json
{
  "projectId": "uuid",
  "totalTasks": 15,
  "completedTasks": 8,
  "inProgressTasks": 5,
  "pendingTasks": 2,
  "completionRate": 53,
  "teamMembers": 4
}
```

## 🔑 Authorization

All protected endpoints require authentication via JWT token:

**Header:**
```
Authorization: Bearer {jwt-token}
```

### Role-Based Access Control

**Admin Permissions:**
- All CRUD operations on projects
- Add/remove team members
- Assign roles
- View all projects and tasks
- Delete any task

**Member Permissions:**
- Create tasks in joined projects
- Edit own tasks
- View assigned tasks
- Comment on tasks
- Update task status

**Project Owner/Admin:**
- Manage project members
- Update project settings
- Delete project
- Assign tasks

## 📝 Error Responses

All endpoints follow a consistent error response format:

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "field": "email",
    "message": "Invalid email format"
  }
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## 🔄 Rate Limiting

Recommended rate limits for production:
- Authentication endpoints: 5 requests per minute
- Read endpoints: 100 requests per minute
- Write endpoints: 30 requests per minute

## 📡 WebSocket Events (Future Enhancement)

For real-time updates:

**Client -> Server:**
- `subscribe:project` - Subscribe to project updates
- `subscribe:task` - Subscribe to task updates
- `typing:start` - User started typing comment
- `typing:stop` - User stopped typing comment

**Server -> Client:**
- `task:created` - New task created
- `task:updated` - Task updated
- `task:deleted` - Task deleted
- `comment:added` - New comment added
- `member:joined` - New member joined project
- `notification:new` - New notification

## 🛠️ Implementation Notes

### Current Implementation
The current application uses Zustand for state management with local storage persistence. All "API calls" are simulated with:
- Immediate state updates
- Simulated async delays (300-500ms)
- Client-side validation
- Optimistic updates

### Backend Integration Checklist
To integrate with a real backend:

1. **Replace Store Actions** with API calls using fetch/axios
2. **Add JWT Token Management** in auth store
3. **Implement Error Handling** for network errors
4. **Add Loading States** for async operations
5. **Setup API Base URL** from environment variables
6. **Add Request/Response Interceptors** for auth headers
7. **Implement Refresh Token Logic**
8. **Add WebSocket Connection** for real-time features
9. **Setup CORS** on backend
10. **Implement File Upload** for attachments

### Recommended Backend Stack
- **Node.js + Express** or **NestJS**
- **PostgreSQL** or **MongoDB**
- **JWT** for authentication
- **Socket.io** for real-time updates
- **Redis** for caching and sessions
- **AWS S3** or **Cloudinary** for file storage

---

**Note:** This API documentation serves as a contract between frontend and backend. All endpoints should implement proper validation, sanitization, and error handling as per security best practices.
