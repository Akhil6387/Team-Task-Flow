# TaskFlow Deployment Guide

This guide covers various deployment options for the TaskFlow application.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Build Process](#build-process)
- [Deployment Options](#deployment-options)
  - [Vercel](#vercel-recommended)
  - [Netlify](#netlify)
  - [GitHub Pages](#github-pages)
  - [AWS S3 + CloudFront](#aws-s3--cloudfront)
  - [Docker](#docker)
  - [Traditional Server (Nginx)](#traditional-server-nginx)
- [Environment Configuration](#environment-configuration)
- [Backend Integration](#backend-integration)
- [Performance Optimization](#performance-optimization)
- [Monitoring & Analytics](#monitoring--analytics)

## 🔧 Prerequisites

- Node.js 18 or higher
- npm, yarn, or pnpm
- Git (for version control)

## 🏗️ Build Process

### Development Build
```bash
npm run dev
```
Starts development server at `http://localhost:5173`

### Production Build
```bash
npm run build
```
Generates optimized production files in `dist/` directory

### Preview Production Build
```bash
npm run preview
```
Preview the production build locally

### Build Output
The build process creates:
- Single `index.html` file with inlined assets
- Optimized and minified JavaScript
- Optimized CSS with Tailwind purging
- Gzipped output (~235 KB)

## 🚀 Deployment Options

### Vercel (Recommended)

**Why Vercel?**
- Zero-config deployment
- Automatic HTTPS
- Global CDN
- Instant rollbacks
- Preview deployments

**Steps:**

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Configure Build Settings** (vercel.json)
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite",
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

4. **Environment Variables**
   Set in Vercel dashboard:
   - `VITE_API_URL` (if using backend)
   - `VITE_APP_ENV=production`

**Production URL:** `https://taskflow.vercel.app`

---

### Netlify

**Steps:**

1. **Create netlify.toml**
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200

   [build.environment]
     NODE_VERSION = "18"
   ```

2. **Deploy via CLI**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

3. **Or Connect GitHub**
   - Connect repository in Netlify dashboard
   - Configure build settings
   - Enable automatic deployments

---

### GitHub Pages

**Steps:**

1. **Update vite.config.ts**
   ```typescript
   export default defineConfig({
     base: '/taskflow/', // your repo name
     // ... rest of config
   })
   ```

2. **Add Deployment Script** (package.json)
   ```json
   {
     "scripts": {
       "deploy": "npm run build && gh-pages -d dist"
     }
   }
   ```

3. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

5. **Configure GitHub Settings**
   - Repository → Settings → Pages
   - Source: gh-pages branch
   - Enable HTTPS

**Production URL:** `https://username.github.io/taskflow`

---

### AWS S3 + CloudFront

**Steps:**

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://taskflow-app
   ```

3. **Configure Bucket for Static Hosting**
   ```bash
   aws s3 website s3://taskflow-app \
     --index-document index.html \
     --error-document index.html
   ```

4. **Upload Files**
   ```bash
   aws s3 sync dist/ s3://taskflow-app \
     --acl public-read \
     --cache-control max-age=31536000
   ```

5. **Create CloudFront Distribution**
   - Origin: S3 bucket
   - Viewer Protocol: Redirect HTTP to HTTPS
   - Error Pages: Redirect 403/404 to /index.html

6. **Update DNS**
   Point your domain to CloudFront distribution

---

### Docker

**Dockerfile:**
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  taskflow:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

**Build & Run:**
```bash
docker build -t taskflow .
docker run -p 80:80 taskflow
```

---

### Traditional Server (Nginx)

**Steps:**

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Transfer Files to Server**
   ```bash
   scp -r dist/* user@server:/var/www/taskflow
   ```

3. **Nginx Configuration** (/etc/nginx/sites-available/taskflow)
   ```nginx
   server {
       listen 80;
       server_name taskflow.example.com;
       root /var/www/taskflow;
       index index.html;

       # Gzip
       gzip on;
       gzip_vary on;
       gzip_min_length 1024;
       gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;

       # Security headers
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header X-XSS-Protection "1; mode=block" always;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

4. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/taskflow /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

5. **SSL with Let's Encrypt**
   ```bash
   sudo certbot --nginx -d taskflow.example.com
   ```

---

## ⚙️ Environment Configuration

### Environment Variables

Create `.env` file for local development:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000

# App Configuration
VITE_APP_NAME=TaskFlow
VITE_APP_ENV=development

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_SENTRY=false

# External Services
VITE_GOOGLE_ANALYTICS_ID=
VITE_SENTRY_DSN=
```

### Production Environment

```env
VITE_API_URL=https://api.taskflow.com
VITE_APP_ENV=production
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SENTRY=true
VITE_GOOGLE_ANALYTICS_ID=UA-XXXXXXXXX-X
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Accessing Environment Variables

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;
```

---

## 🔌 Backend Integration

### API Configuration

**Create API client** (src/services/api.ts):

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Replace Zustand with API Calls

**Example authStore.ts update:**

```typescript
import api from '../services/api';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      
      localStorage.setItem('auth-token', token);
      set({ user, isAuthenticated: true });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  },
  
  // ... other methods
}));
```

---

## ⚡ Performance Optimization

### 1. Code Splitting

```typescript
// Use React.lazy for route-based splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Projects = lazy(() => import('./pages/Projects'));

<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/projects" element={<Projects />} />
  </Routes>
</Suspense>
```

### 2. Image Optimization

- Use WebP format with PNG/JPG fallbacks
- Lazy load images
- Implement responsive images

### 3. Bundle Analysis

```bash
npm run build -- --mode analyze
```

### 4. Caching Strategy

**Service Worker** (using Workbox):

```javascript
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';

// Cache static assets
registerRoute(
  ({ request }) => request.destination === 'style' || 
                   request.destination === 'script',
  new CacheFirst()
);

// Network first for API
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst()
);
```

### 5. Performance Metrics

Monitor with Lighthouse:
- Performance Score > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s
- Cumulative Layout Shift < 0.1

---

## 📊 Monitoring & Analytics

### Google Analytics

```typescript
// src/utils/analytics.ts
export const trackPageView = (path: string) => {
  if (window.gtag) {
    window.gtag('config', import.meta.env.VITE_GOOGLE_ANALYTICS_ID, {
      page_path: path,
    });
  }
};

export const trackEvent = (category: string, action: string, label?: string) => {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
    });
  }
};
```

### Error Tracking with Sentry

```typescript
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_APP_ENV,
    tracesSampleRate: 1.0,
  });
}
```

### Health Checks

Create a health endpoint:
```typescript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

---

## 🔒 Security Checklist

- [ ] Enable HTTPS
- [ ] Set security headers (CSP, HSTS, X-Frame-Options)
- [ ] Implement rate limiting
- [ ] Sanitize user inputs
- [ ] Use environment variables for secrets
- [ ] Enable CORS properly
- [ ] Regular dependency updates
- [ ] Implement CSP (Content Security Policy)
- [ ] Use SRI (Subresource Integrity) for CDN assets

---

## 📝 Deployment Checklist

- [ ] Run production build locally
- [ ] Test all features in production mode
- [ ] Update environment variables
- [ ] Configure CDN/caching
- [ ] Set up SSL certificate
- [ ] Configure domain DNS
- [ ] Test on multiple devices
- [ ] Set up monitoring/analytics
- [ ] Create backup strategy
- [ ] Document deployment process
- [ ] Test rollback procedure

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist .vite
npm install
npm run build
```

### Blank Page After Deployment
- Check browser console for errors
- Verify base URL in vite.config.ts
- Check routing configuration
- Verify all assets are uploaded

### 404 on Refresh
- Configure server/CDN for SPA routing
- Add rewrite rules to serve index.html

### Slow Load Times
- Enable gzip/brotli compression
- Implement code splitting
- Optimize images
- Use CDN for static assets

---

## 📞 Support

For deployment issues:
1. Check build logs
2. Review documentation
3. Test locally with production build
4. Check server/CDN configuration
5. Open issue on GitHub

---

**Happy Deploying! 🚀**
