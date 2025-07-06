# GitHub Actions Secrets Configuration

This document outlines all the secrets and environment variables required for the TypeAmp CI/CD pipeline.

## Required Secrets

### 🔐 Core Secrets

#### `TURBO_TOKEN`
- **Description**: Vercel Turbo token for monorepo caching
- **Required for**: Build optimization and caching
- **How to get**: Sign up at [Vercel](https://vercel.com/account/tokens)
- **Example**: `your-turbo-token-here`

#### `TURBO_TEAM`
- **Description**: Vercel Turbo team identifier
- **Required for**: Build optimization and caching
- **How to get**: Team name from Vercel dashboard
- **Example**: `your-team-name`

### 🗄️ Database Secrets

#### `DATABASE_URL_STAGING`
- **Description**: PostgreSQL connection string for staging environment
- **Required for**: Staging deployments and database migrations
- **Format**: `postgresql://username:password@host:port/database`
- **Example**: `postgresql://user:pass@staging-db.example.com:5432/typeamp_staging`

#### `DATABASE_URL_PRODUCTION`
- **Description**: PostgreSQL connection string for production environment
- **Required for**: Production deployments and database migrations
- **Format**: `postgresql://username:password@host:port/database`
- **Example**: `postgresql://user:pass@prod-db.example.com:5432/typeamp_prod`

### 🔑 Authentication Secrets

#### `JWT_SECRET_STAGING`
- **Description**: JWT signing secret for staging environment
- **Required for**: API authentication in staging
- **Security**: Must be a cryptographically secure random string
- **Generation**: `openssl rand -base64 64`

#### `JWT_SECRET_PRODUCTION`
- **Description**: JWT signing secret for production environment
- **Required for**: API authentication in production
- **Security**: Must be a cryptographically secure random string (different from staging)
- **Generation**: `openssl rand -base64 64`

### 🌐 API Configuration

#### `NEXT_PUBLIC_API_URL_STAGING`
- **Description**: Public API URL for staging environment
- **Required for**: Frontend-to-API communication in staging
- **Example**: `https://api-staging.typeamp.dev`

#### `NEXT_PUBLIC_API_URL_PRODUCTION`
- **Description**: Public API URL for production environment
- **Required for**: Frontend-to-API communication in production
- **Example**: `https://api.typeamp.dev`

#### `ANTHROPIC_API_KEY_STAGING`
- **Description**: Anthropic Claude API key for staging environment
- **Required for**: AI text generation in staging
- **How to get**: [Anthropic Console](https://console.anthropic.com/)

#### `ANTHROPIC_API_KEY_PRODUCTION`
- **Description**: Anthropic Claude API key for production environment
- **Required for**: AI text generation in production
- **How to get**: [Anthropic Console](https://console.anthropic.com/)

### 🚀 Deployment Secrets

#### `VERCEL_TOKEN`
- **Description**: Vercel deployment token
- **Required for**: Automated deployments to Vercel
- **How to get**: [Vercel Account Settings](https://vercel.com/account/tokens)
- **Scopes**: Deployment, read project, write project

#### `STAGING_FRONTEND_URL`
- **Description**: Base URL for staging frontend
- **Required for**: Health checks and smoke tests
- **Example**: `https://staging.typeamp.dev`

#### `PRODUCTION_FRONTEND_URL`
- **Description**: Base URL for production frontend
- **Required for**: Health checks and smoke tests
- **Example**: `https://typeamp.dev`

### 🔍 Security & Monitoring

#### `SNYK_TOKEN`
- **Description**: Snyk security scanning token
- **Required for**: Vulnerability scanning
- **How to get**: [Snyk Account Settings](https://app.snyk.io/account)
- **Permissions**: Test projects, view results

#### `CODECOV_TOKEN`
- **Description**: Codecov upload token
- **Required for**: Code coverage reporting
- **How to get**: [Codecov Repository Settings](https://codecov.io/)
- **Usage**: Upload coverage reports

#### `SENTRY_DSN_STAGING`
- **Description**: Sentry error tracking DSN for staging
- **Required for**: Error monitoring in staging
- **How to get**: [Sentry Project Settings](https://sentry.io/)

#### `SENTRY_DSN_PRODUCTION`
- **Description**: Sentry error tracking DSN for production
- **Required for**: Error monitoring in production
- **How to get**: [Sentry Project Settings](https://sentry.io/)

### 📢 Notifications

#### `SLACK_WEBHOOK_URL`
- **Description**: Slack webhook URL for deployment notifications
- **Required for**: Failure and success notifications
- **How to get**: [Slack App Incoming Webhooks](https://api.slack.com/messaging/webhooks)
- **Optional**: Can be left empty to disable Slack notifications

### 💾 Backup & Storage

#### `BACKUP_STORAGE_URL`
- **Description**: Storage URL for database backups
- **Required for**: Production database backups
- **Format**: Depends on storage provider (S3, Google Cloud, etc.)
- **Example**: `s3://typeamp-backups` or `gs://typeamp-backups`

#### `AWS_ACCESS_KEY_ID` (if using S3)
- **Description**: AWS access key for S3 backup storage
- **Required for**: S3 backup operations
- **Permissions**: S3 read/write access to backup bucket

#### `AWS_SECRET_ACCESS_KEY` (if using S3)
- **Description**: AWS secret key for S3 backup storage
- **Required for**: S3 backup operations
- **Security**: Keep secure, rotate regularly

## 🔧 Environment Variables (Optional)

### `GITHUB_TOKEN`
- **Description**: GitHub token for API access
- **Required for**: Deployment status updates
- **Auto-provided**: GitHub Actions provides this automatically
- **Permissions**: Repository access

### `DEPLOYMENT_ID`
- **Description**: GitHub deployment ID
- **Required for**: Deployment status tracking
- **Auto-generated**: Created by GitHub Actions during deployment

### `GITHUB_SHA`
- **Description**: Git commit SHA
- **Required for**: Build tracking and rollback identification
- **Auto-provided**: GitHub Actions provides this automatically

## 📋 Setup Checklist

### Initial Setup
- [ ] Create all required secrets in GitHub repository settings
- [ ] Verify database connections are working
- [ ] Test API keys are valid and have correct permissions
- [ ] Configure monitoring services (Sentry, Codecov, Snyk)
- [ ] Set up backup storage and test restoration

### Security Verification
- [ ] All secrets use strong, unique values
- [ ] Production secrets are different from staging secrets
- [ ] Service accounts use minimal required permissions
- [ ] Secrets are not logged or exposed in any output
- [ ] Regular secret rotation schedule is established

### Testing
- [ ] Run CI/CD pipeline in staging environment
- [ ] Verify all health checks pass
- [ ] Test rollback procedures
- [ ] Confirm monitoring and alerting work
- [ ] Validate backup and restoration processes

## 🔄 Secret Rotation Schedule

### High Priority (Monthly)
- Database passwords
- JWT secrets
- API keys (Anthropic, external services)

### Medium Priority (Quarterly)
- Deployment tokens (Vercel)
- Monitoring service tokens (Snyk, Codecov)
- Storage access keys

### Low Priority (Yearly)
- GitHub tokens (if manually created)
- Webhook URLs (unless compromised)

## 🚨 Security Incidents

If any secret is compromised:

1. **Immediately rotate** the compromised secret
2. **Update** the secret in GitHub repository settings
3. **Re-deploy** affected environments
4. **Review** access logs for any unauthorized usage
5. **Update** any dependent services or configurations

## 📚 Additional Resources

- [GitHub Actions Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Database Security Best Practices](https://www.postgresql.org/docs/current/security.html)
- [JWT Security Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

---

**⚠️ Security Notice**: Never commit secrets to version control. Always use GitHub's encrypted secrets feature for sensitive data.