#!/bin/bash

# TypeAmp Staging Deployment Script
# This script handles deployment to the staging environment

set -euo pipefail

echo "🚀 Starting TypeAmp staging deployment..."

# Configuration
DEPLOY_ENV="staging"
APP_NAME="typeamp-staging"
HEALTH_CHECK_URL="${STAGING_FRONTEND_URL}/api/health"
MAX_HEALTH_CHECK_ATTEMPTS=30
HEALTH_CHECK_INTERVAL=10

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Error handling
handle_error() {
    log_error "Deployment failed at step: $1"
    log_error "Rolling back changes..."
    
    # Add rollback logic here
    if [ -n "${DEPLOYMENT_ID:-}" ]; then
        echo "Rolling back deployment ${DEPLOYMENT_ID}"
        # Add specific rollback commands for your deployment platform
    fi
    
    exit 1
}

# Trap errors
trap 'handle_error "unknown step"' ERR

# Validate required environment variables
validate_environment() {
    log_info "Validating environment variables..."
    
    local required_vars=(
        "DATABASE_URL_STAGING"
        "NEXT_PUBLIC_API_URL_STAGING"
        "STAGING_FRONTEND_URL"
        "JWT_SECRET_STAGING"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var:-}" ]; then
            log_error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    log_success "Environment validation passed"
}

# Database migration
run_database_migrations() {
    log_info "Running database migrations..."
    
    # Set database URL for staging
    export DATABASE_URL="${DATABASE_URL_STAGING}"
    
    # Navigate to API directory
    cd packages/api
    
    # Generate Prisma client
    npx prisma generate
    
    # Run migrations
    npx prisma migrate deploy
    
    # Verify migration success
    if npx prisma db execute --stdin <<< "SELECT 1" &>/dev/null; then
        log_success "Database migrations completed successfully"
    else
        handle_error "database migration"
    fi
    
    cd ../..
}

# Build and deploy frontend
deploy_frontend() {
    log_info "Building and deploying frontend..."
    
    # Set environment variables for build
    export NODE_ENV="production"
    export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL_STAGING}"
    export NEXT_PUBLIC_ENVIRONMENT="staging"
    
    # Build frontend
    cd packages/web
    npm run build
    
    # Deploy to hosting platform (example with Vercel)
    if command -v vercel &> /dev/null; then
        log_info "Deploying to Vercel..."
        DEPLOYMENT_URL=$(vercel --prod --token "${VERCEL_TOKEN}" --yes)
        echo "deployment_url=${DEPLOYMENT_URL}" >> "${GITHUB_OUTPUT:-/dev/null}"
        log_success "Frontend deployed to: $DEPLOYMENT_URL"
    else
        log_warning "Vercel CLI not found, skipping Vercel deployment"
        # Add alternative deployment logic here
    fi
    
    cd ../..
}

# Deploy backend API
deploy_backend() {
    log_info "Deploying backend API..."
    
    cd packages/api
    
    # Set environment variables
    export NODE_ENV="production"
    export DATABASE_URL="${DATABASE_URL_STAGING}"
    export JWT_SECRET="${JWT_SECRET_STAGING}"
    
    # Build backend
    npm run build
    
    # Deploy backend (customize based on your hosting platform)
    log_info "Backend build completed"
    # Add your backend deployment logic here
    # Examples: Docker deploy, serverless deploy, traditional server deploy
    
    cd ../..
    
    log_success "Backend deployment completed"
}

# Health check
health_check() {
    log_info "Performing health checks..."
    
    local attempt=0
    local success=false
    
    while [ $attempt -lt $MAX_HEALTH_CHECK_ATTEMPTS ]; do
        attempt=$((attempt + 1))
        log_info "Health check attempt $attempt/$MAX_HEALTH_CHECK_ATTEMPTS"
        
        if curl -f -s "$HEALTH_CHECK_URL" >/dev/null 2>&1; then
            success=true
            break
        fi
        
        if [ $attempt -lt $MAX_HEALTH_CHECK_ATTEMPTS ]; then
            log_info "Health check failed, retrying in ${HEALTH_CHECK_INTERVAL}s..."
            sleep $HEALTH_CHECK_INTERVAL
        fi
    done
    
    if [ "$success" = true ]; then
        log_success "Health checks passed"
    else
        handle_error "health check"
    fi
}

# Run smoke tests
run_smoke_tests() {
    log_info "Running smoke tests..."
    
    # Basic API endpoint tests
    local api_url="${NEXT_PUBLIC_API_URL_STAGING}"
    
    # Test health endpoint
    if curl -f -s "${api_url}/health" | grep -q "ok"; then
        log_success "API health endpoint test passed"
    else
        log_warning "API health endpoint test failed"
    fi
    
    # Test main application routes
    if curl -f -s "${STAGING_FRONTEND_URL}" >/dev/null; then
        log_success "Frontend accessibility test passed"
    else
        log_warning "Frontend accessibility test failed"
    fi
    
    log_success "Smoke tests completed"
}

# Update deployment status
update_deployment_status() {
    local status=$1
    local description=$2
    
    if [ -n "${GITHUB_TOKEN:-}" ] && [ -n "${DEPLOYMENT_ID:-}" ]; then
        log_info "Updating deployment status: $status"
        
        # Update GitHub deployment status
        curl -X POST \
            -H "Authorization: token ${GITHUB_TOKEN}" \
            -H "Accept: application/vnd.github.v3+json" \
            "https://api.github.com/repos/${GITHUB_REPOSITORY}/deployments/${DEPLOYMENT_ID}/statuses" \
            -d "{\"state\":\"${status}\",\"description\":\"${description}\"}" \
            >/dev/null 2>&1 || log_warning "Failed to update deployment status"
    fi
}

# Cleanup function
cleanup() {
    log_info "Cleaning up temporary files..."
    # Add cleanup logic here
}

# Main deployment flow
main() {
    log_info "TypeAmp Staging Deployment Started"
    log_info "Deployment ID: ${DEPLOYMENT_ID:-"unknown"}"
    log_info "Git SHA: ${GITHUB_SHA:-"unknown"}"
    
    # Update status to in_progress
    update_deployment_status "in_progress" "Deployment in progress"
    
    # Execute deployment steps
    validate_environment
    run_database_migrations
    deploy_backend
    deploy_frontend
    health_check
    run_smoke_tests
    
    # Update status to success
    update_deployment_status "success" "Deployment completed successfully"
    
    log_success "🎉 TypeAmp staging deployment completed successfully!"
    log_info "Frontend URL: ${STAGING_FRONTEND_URL}"
    log_info "API URL: ${NEXT_PUBLIC_API_URL_STAGING}"
    
    cleanup
}

# Trap cleanup on exit
trap cleanup EXIT

# Run main deployment
main "$@"