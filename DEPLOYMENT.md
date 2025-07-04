# TypeAmp Deployment Guide

## Overview

This guide covers deploying TypeAmp to production environments. The application consists of two main components:
- **Frontend**: Next.js application (Vercel recommended)
- **Backend API**: Fastify server (Railway/Render recommended)

## Prerequisites

- Node.js 18+ installed locally
- Git repository access
- Accounts on deployment platforms
- PostgreSQL database (for backend)

## Frontend Deployment (Vercel)

### 1. Prepare the Frontend

```bash
cd packages/web
cp .env.example .env.local
# Edit .env.local with production values
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI
```bash
npm i -g vercel
vercel --prod
```

#### Option B: GitHub Integration
1. Push code to GitHub
2. Import project in Vercel Dashboard
3. Configure build settings:
   - Framework Preset: Next.js
   - Root Directory: `packages/web`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 3. Environment Variables (Vercel)

Set in Vercel Dashboard:
```
NEXT_PUBLIC_API_URL=https://api.typeamp.com
NEXT_PUBLIC_APP_URL=https://typeamp.com
```

## Backend API Deployment (Railway)

### 1. Prepare the Backend

```bash
cd packages/api
cp .env.example .env
# Edit with production values
```

### 2. Database Setup

#### PostgreSQL on Railway:
1. Add PostgreSQL service in Railway
2. Copy connection string
3. Run migrations:
```bash
DATABASE_URL="postgresql://..." npm run db:migrate
npm run db:seed # Optional
```

### 3. Deploy to Railway

#### Option A: Railway CLI
```bash
npm i -g @railway/cli
railway login
railway link
railway up
```

#### Option B: GitHub Integration
1. Connect GitHub repo to Railway
2. Configure:
   - Root Directory: `packages/api`
   - Build Command: `npm run build`
   - Start Command: `npm start`

### 4. Environment Variables (Railway)

```
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
ANTHROPIC_API_KEY=your-api-key
PORT=3003
```

## Alternative Deployment Options

### Frontend Alternatives

#### Netlify
```bash
# netlify.toml
[build]
  base = "packages/web"
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

#### AWS Amplify
1. Connect GitHub repository
2. Configure build settings
3. Set environment variables

### Backend Alternatives

#### Render
```yaml
# render.yaml
services:
  - type: web
    name: typeamp-api
    env: node
    region: oregon
    plan: starter
    buildCommand: "npm install && npm run build"
    startCommand: "npm start"
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: typeamp-db
          property: connectionString
```

#### Heroku
```json
// package.json
"engines": {
  "node": "18.x"
}
```

```bash
heroku create typeamp-api
heroku addons:create heroku-postgresql:mini
git push heroku main
```

## Production Configuration

### 1. Security Headers (Frontend)

```javascript
// next.config.ts
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  }
];
```

### 2. CORS Configuration (Backend)

```typescript
// src/index.ts
await fastify.register(import('@fastify/cors'), {
  origin: [
    'https://typeamp.com',
    'https://www.typeamp.com'
  ],
  credentials: true
});
```

### 3. Rate Limiting (Backend)

```typescript
await fastify.register(import('@fastify/rate-limit'), {
  max: 100,
  timeWindow: '1 minute'
});
```

## Domain Configuration

### 1. Frontend Domain

In Vercel:
1. Go to Project Settings → Domains
2. Add custom domain: `typeamp.com`
3. Configure DNS:
   ```
   A     @     76.76.21.21
   CNAME www   cname.vercel-dns.com
   ```

### 2. API Subdomain

In Railway/Render:
1. Add custom domain: `api.typeamp.com`
2. Configure DNS:
   ```
   CNAME api   your-app.railway.app
   ```

## SSL/TLS Configuration

- **Vercel**: Automatic SSL with Let's Encrypt
- **Railway**: Automatic SSL included
- **Custom**: Use Cloudflare for SSL termination

## Monitoring & Logging

### 1. Application Monitoring

```javascript
// Frontend: Vercel Analytics
import { Analytics } from '@vercel/analytics/react';

// Layout.tsx
<Analytics />
```

### 2. Error Tracking

```javascript
// Sentry Integration
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 3. API Monitoring

```typescript
// Backend: Fastify logging
fastify.log.info('Server started');
fastify.log.error(error);
```

## Health Checks

### Frontend Health Check
```typescript
// pages/api/health.ts
export default function handler(req, res) {
  res.status(200).json({ status: 'healthy' });
}
```

### Backend Health Check
Already implemented at `/api/words/health`

## Deployment Checklist

### Pre-Deployment
- [ ] Run tests: `npm test`
- [ ] Build locally: `npm run build`
- [ ] Check TypeScript: `npm run type-check`
- [ ] Lint code: `npm run lint`
- [ ] Update dependencies
- [ ] Review environment variables
- [ ] Check API endpoints

### Deployment
- [ ] Deploy backend first
- [ ] Run database migrations
- [ ] Test API endpoints
- [ ] Deploy frontend
- [ ] Verify API connection
- [ ] Test critical paths

### Post-Deployment
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify SSL certificates
- [ ] Test on multiple devices
- [ ] Monitor server resources
- [ ] Set up alerts

## Rollback Strategy

### Vercel (Frontend)
1. Go to Deployments tab
2. Find previous stable deployment
3. Click "..." → "Promote to Production"

### Railway (Backend)
1. Use deployment history
2. Rollback to previous deployment
3. Or: `railway run --service=api --deploy=<deployment-id>`

## Environment-Specific Commands

### Development
```bash
npm run dev
```

### Staging
```bash
NODE_ENV=staging npm run build
NODE_ENV=staging npm start
```

### Production
```bash
NODE_ENV=production npm run build
NODE_ENV=production npm start
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check allowed origins in backend
   - Verify API URL in frontend env

2. **Database Connection**
   - Check DATABASE_URL format
   - Verify SSL requirements
   - Check connection pooling

3. **Build Failures**
   - Clear cache and rebuild
   - Check Node.js version
   - Review build logs

4. **Performance Issues**
   - Enable caching headers
   - Optimize images
   - Use CDN for assets

## Scaling Considerations

### Horizontal Scaling
- Frontend: Vercel auto-scales
- Backend: Add more Railway instances
- Database: Use connection pooling

### Vertical Scaling
- Upgrade Railway/Render plan
- Increase database resources
- Add Redis for caching

## Security Best Practices

1. **Environment Variables**
   - Never commit secrets
   - Rotate keys regularly
   - Use strong JWT secrets

2. **API Security**
   - Implement rate limiting
   - Validate all inputs
   - Use HTTPS only

3. **Database Security**
   - Use connection SSL
   - Implement query timeouts
   - Regular backups

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Review error logs weekly
- Performance audits quarterly
- Security audits bi-annually

### Backup Strategy
- Database: Daily automated backups
- Code: Git repository
- Environment: Document all configs

---

## Quick Deploy Commands

### Full Stack Deploy
```bash
# Backend
cd packages/api
railway up

# Frontend
cd packages/web
vercel --prod
```

### Emergency Rollback
```bash
# Frontend
vercel rollback

# Backend
railway rollback
```

---

**Support**: For deployment issues, check the logs first, then consult platform-specific documentation.