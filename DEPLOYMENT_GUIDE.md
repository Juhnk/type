# TypeAmp Deployment Guide

## 📋 Prerequisites

Before deploying TypeAmp, ensure you have:

1. **Accounts Created**:
   - [ ] Vercel account (https://vercel.com)
   - [ ] Neon account (https://neon.tech)
   - [ ] Sentry account (https://sentry.io)
   - [ ] Google Analytics account (optional)

2. **Tools Installed**:
   - [ ] Node.js 20+ and npm
   - [ ] Vercel CLI: `npm i -g vercel`
   - [ ] Git configured with GitHub

3. **Repository Access**:
   - [ ] GitHub repository forked or cloned
   - [ ] Admin access to repository settings

## 🚀 Step-by-Step Deployment

### Step 1: Database Setup (Neon)

1. **Create Neon Project**:
   ```bash
   # Visit https://neon.tech and create account
   # Create new project with:
   # - Name: typeamp-production
   # - Region: Choose closest to your users
   # - PostgreSQL version: 16
   ```

2. **Get Database URLs**:
   - Copy the pooled connection string (for DATABASE_URL)
   - Copy the direct connection string (for DIRECT_URL)

3. **Configure Database**:
   ```bash
   cd packages/api
   
   # Create .env.production
   echo "DATABASE_URL=your-pooled-connection-string" >> .env.production
   echo "DIRECT_URL=your-direct-connection-string" >> .env.production
   
   # Run initial migration
   npx prisma generate
   npx prisma db push
   ```

### Step 2: Vercel Project Setup

1. **Install and Login**:
   ```bash
   npm i -g vercel
   vercel login
   ```

2. **Initialize Project**:
   ```bash
   # From repository root
   vercel
   
   # Answer prompts:
   # - Set up and deploy: Y
   # - Which scope: Your account
   # - Link to existing project: N
   # - Project name: typeamp
   # - Directory: ./packages/web
   # - Override settings: N
   ```

3. **Configure Build Settings**:
   ```bash
   # Vercel will auto-detect Next.js
   # Verify settings in vercel.json
   ```

### Step 3: Environment Variables

1. **Add Production Variables**:
   ```bash
   # Database
   vercel env add DATABASE_URL production
   vercel env add DIRECT_URL production
   
   # Authentication
   vercel env add JWT_SECRET production
   # Generate with: openssl rand -base64 32
   
   # API Configuration
   vercel env add NEXT_PUBLIC_API_URL production
   # Value: https://typeamp.com/api
   
   # Monitoring (optional)
   vercel env add NEXT_PUBLIC_SENTRY_DSN production
   vercel env add SENTRY_AUTH_TOKEN production
   ```

2. **Add Staging Variables**:
   ```bash
   # Repeat for staging environment
   vercel env add DATABASE_URL preview
   # Use separate Neon branch for staging
   ```

### Step 4: Deploy to Staging

1. **Create Staging Branch**:
   ```bash
   git checkout -b staging
   git push origin staging
   ```

2. **Deploy**:
   ```bash
   vercel --env=preview
   ```

3. **Verify Deployment**:
   - Visit provided URL
   - Test core functionality
   - Check database connection
   - Verify API endpoints

### Step 5: Production Deployment

1. **Final Checks**:
   ```bash
   # Run all tests
   npm test
   
   # Type check
   npm run type-check
   
   # Build locally
   npm run build
   ```

2. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

3. **Post-Deployment**:
   - Verify production URL
   - Test critical user flows
   - Monitor error rates in Sentry
   - Check performance metrics

### Step 6: Domain Configuration

1. **Add Custom Domain**:
   ```bash
   vercel domains add typeamp.com
   ```

2. **Configure DNS**:
   ```
   # Add to your DNS provider:
   A     @      76.76.21.21
   CNAME www    cname.vercel-dns.com
   ```

3. **SSL Certificate**:
   - Automatic via Vercel
   - Verify HTTPS works

### Step 7: Monitoring Setup

1. **Sentry Configuration**:
   ```bash
   # Install Sentry CLI
   npm install -g @sentry/cli
   
   # Login
   sentry-cli login
   
   # Create release
   sentry-cli releases new -p typeamp v1.0.0
   sentry-cli releases files v1.0.0 upload-sourcemaps ./packages/web/.next
   sentry-cli releases finalize v1.0.0
   ```

2. **Vercel Analytics**:
   - Enable in Vercel dashboard
   - Add Analytics component to layout

3. **Uptime Monitoring**:
   - Set up Better Uptime
   - Configure alerts

## 🔧 Common Issues & Solutions

### Database Connection Issues

**Problem**: "Can't reach database server"
```bash
# Solution: Check connection string format
# Should be: postgresql://user:pass@project.neon.tech/db?sslmode=require
```

### Build Failures

**Problem**: "Module not found" errors
```bash
# Solution: Clear cache and rebuild
vercel env pull
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variable Issues

**Problem**: "Missing environment variable"
```bash
# Solution: Verify all vars are set
vercel env ls production
```

## 📊 Performance Optimization

### 1. Enable Caching
```javascript
// next.config.js
module.exports = {
  headers: async () => [
    {
      source: '/:all*(svg|jpg|png)',
      headers: [{
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable',
      }],
    },
  ],
};
```

### 2. Database Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_test_results_user_created 
ON test_results(user_id, created_at DESC);
```

### 3. Enable ISR
```javascript
// For static pages with data
export const revalidate = 3600; // 1 hour
```

## 🚨 Rollback Procedures

### Quick Rollback
```bash
# Via Vercel Dashboard
# 1. Go to Deployments
# 2. Find previous working deployment
# 3. Click "..." → "Promote to Production"

# Via CLI
vercel rollback
```

### Database Rollback
```bash
# Using Neon branching
# 1. Create branch from point in time
# 2. Update DATABASE_URL to new branch
# 3. Redeploy
```

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Security headers configured
- [ ] Error tracking setup

### Deployment
- [ ] Deploy to staging first
- [ ] Run smoke tests on staging
- [ ] Deploy to production
- [ ] Verify production deployment
- [ ] Update DNS if needed

### Post-Deployment
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify analytics tracking
- [ ] Test critical user paths
- [ ] Update status page
- [ ] Notify team

## 🔗 Useful Commands

```bash
# Check deployment status
vercel ls

# View logs
vercel logs typeamp.com

# Inspect environment
vercel env ls production

# Redeploy
vercel --prod --force

# Scale functions
vercel scale functions 1 10
```

## 📞 Support

If you encounter issues:

1. Check Vercel status: https://vercel-status.com
2. Check Neon status: https://neonstatus.com
3. Review logs: `vercel logs`
4. Contact support with deployment ID