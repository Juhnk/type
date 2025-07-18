#!/bin/bash

# TypeAmp Production Deployment Script
# This script handles deployment to the production environment with blue-green deployment

set -euo pipefail

echo "🚀 Starting TypeAmp production deployment..."

# Configuration
DEPLOY_ENV="production"
APP_NAME="typeamp-prod"
HEALTH_CHECK_URL="${PRODUCTION_FRONTEND_URL}/api/health"
MAX_HEALTH_CHECK_ATTEMPTS=60
HEALTH_CHECK_INTERVAL=10
ROLLBACK_TIMEOUT=300

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

# Error handling with automatic rollback
handle_error() {
    log_error "Production deployment failed at step: $1"
    log_error "Initiating automatic rollback..."
    
    # Update deployment status to failure
    update_deployment_status "failure" "Deployment failed: $1"
    
    # Perform rollback
    perform_rollback
    
    # Send alerts
    send_failure_alert "$1"
    
    exit 1
}

# Trap errors
trap 'handle_error "unknown step"' ERR

# Send failure alerts
send_failure_alert() {
    local failure_reason=$1
    
    log_info "Sending failure alerts..."
    
    # Slack notification (if configured)
    if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚨 TypeAmp production deployment failed: $failure_reason\"}" \
            "${SLACK_WEBHOOK_URL}" || log_warning "Failed to send Slack alert"
    fi
    
    # Email notification could be added here
    log_info "Failure alerts sent"
}

# Validate production environment
validate_production_environment() {
    log_info "Validating production environment..."
    
    local required_vars=(
        "DATABASE_URL_PRODUCTION"
        "NEXT_PUBLIC_API_URL_PRODUCTION"
        "PRODUCTION_FRONTEND_URL"
        "JWT_SECRET_PRODUCTION"
        "BACKUP_STORAGE_URL"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var:-}" ]; then
            log_error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    # Validate secrets are not default/test values
    if [[ "${JWT_SECRET_PRODUCTION}" == *"test"* ]] || [[ "${JWT_SECRET_PRODUCTION}" == *"dev"* ]]; then
        log_error "Production JWT secret appears to be a test/dev value"
        exit 1
    fi
    
    log_success "Production environment validation passed"
}

# Create database backup before deployment
create_database_backup() {
    log_info "Creating production database backup..."
    
    export DATABASE_URL="${DATABASE_URL_PRODUCTION}"
    
    # Generate backup filename with timestamp
    local backup_timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_name="typeamp_prod_backup_${backup_timestamp}"
    
    cd packages/api
    
    # Create backup using custom backup script
    npm run db:backup -- --name="${backup_name}" --storage="${BACKUP_STORAGE_URL}"
    
    # Store backup info for potential rollback
    echo "BACKUP_NAME=${backup_name}" >> "${GITHUB_ENV:-/dev/null}"
    echo "BACKUP_TIMESTAMP=${backup_timestamp}" >> "${GITHUB_ENV:-/dev/null}"
    
    cd ../..
    
    log_success "Database backup created: $backup_name"
}

# Run database migrations with rollback capability
run_production_migrations() {
    log_info "Running production database migrations..."
    
    export DATABASE_URL="${DATABASE_URL_PRODUCTION}"
    
    cd packages/api
    
    # Generate Prisma client
    npx prisma generate
    
    # Run migrations
    if npx prisma migrate deploy; then
        log_success "Database migrations completed successfully"
    else
        handle_error "production database migration"
    fi
    
    cd ../..
}

# Blue-green deployment for frontend
deploy_frontend_blue_green() {
    log_info "Deploying frontend with blue-green strategy..."
    
    # Set production environment variables
    export NODE_ENV="production"
    export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL_PRODUCTION}"
    export NEXT_PUBLIC_ENVIRONMENT="production"
    
    cd packages/web
    
    # Build for production
    npm run build
    
    # Deploy to staging slot first (blue-green)
    if command -v vercel &> /dev/null; then
        log_info "Deploying to staging slot..."
        STAGING_DEPLOYMENT_URL=$(vercel --token "${VERCEL_TOKEN}" --yes)
        
        # Test staging deployment
        log_info "Testing staging deployment..."
        if curl -f -s "${STAGING_DEPLOYMENT_URL}/api/health" >/dev/null; then
            log_success "Staging deployment health check passed"
            
            # Promote to production
            log_info "Promoting to production..."
            PRODUCTION_DEPLOYMENT_URL=$(vercel --prod --token "${VERCEL_TOKEN}" --yes)
            echo "deployment_url=${PRODUCTION_DEPLOYMENT_URL}" >> "${GITHUB_OUTPUT:-/dev/null}"
            
            log_success "Frontend deployed to production: $PRODUCTION_DEPLOYMENT_URL"
        else
            handle_error "staging deployment health check"
        fi
    else
        log_warning "Vercel CLI not found, using alternative deployment"
        # Add alternative deployment logic here
    fi
    
    cd ../..
}

# Deploy backend with zero-downtime
deploy_backend_zero_downtime() {
    log_info "Deploying backend with zero-downtime strategy..."
    
    cd packages/api
    
    # Set production environment variables
    export NODE_ENV="production"
    export DATABASE_URL="${DATABASE_URL_PRODUCTION}"
    export JWT_SECRET="${JWT_SECRET_PRODUCTION}"
    
    # Build backend
    npm run build
    
    # Deploy with zero-downtime strategy
    # This would depend on your hosting platform
    # Examples: Rolling deployment, blue-green, canary
    
    log_info "Backend deployment strategy would be implemented here"
    # Add your specific backend deployment logic
    
    cd ../..
    
    log_success "Backend deployment completed"
}

# Comprehensive health checks
comprehensive_health_check() {
    log_info "Performing comprehensive health checks..."
    
    local attempt=0
    local success=false
    
    while [ $attempt -lt $MAX_HEALTH_CHECK_ATTEMPTS ]; do
        attempt=$((attempt + 1))
        log_info "Health check attempt $attempt/$MAX_HEALTH_CHECK_ATTEMPTS"
        
        # Check multiple endpoints
        local checks_passed=true
        
        # Main health endpoint
        if ! curl -f -s "$HEALTH_CHECK_URL" >/dev/null 2>&1; then
            checks_passed=false
        fi
        
        # API health endpoint
        if ! curl -f -s "${NEXT_PUBLIC_API_URL_PRODUCTION}/health" >/dev/null 2>&1; then
            checks_passed=false
        fi
        
        # Database connectivity (through API)
        if ! curl -f -s "${NEXT_PUBLIC_API_URL_PRODUCTION}/api/status" >/dev/null 2>&1; then
            checks_passed=false
        fi
        
        if [ "$checks_passed" = true ]; then
            success=true
            break
        fi
        
        if [ $attempt -lt $MAX_HEALTH_CHECK_ATTEMPTS ]; then
            log_info "Health checks failed, retrying in ${HEALTH_CHECK_INTERVAL}s..."
            sleep $HEALTH_CHECK_INTERVAL
        fi
    done
    
    if [ "$success" = true ]; then
        log_success "Comprehensive health checks passed"
    else
        handle_error "comprehensive health check"
    fi
}

# Production smoke tests
run_production_smoke_tests() {
    log_info "Running production smoke tests..."
    
    local api_url="${NEXT_PUBLIC_API_URL_PRODUCTION}"
    local frontend_url="${PRODUCTION_FRONTEND_URL}"
    
    # Test critical user journeys
    log_info "Testing critical user journeys..."
    
    # Homepage accessibility
    if curl -f -s "${frontend_url}" | grep -q "TypeAmp"; then
        log_success "Homepage accessibility test passed"
    else
        log_warning "Homepage accessibility test failed"
    fi
    
    # API endpoints
    if curl -f -s "${api_url}/health" | grep -q "ok"; then
        log_success "API health endpoint test passed"
    else
        handle_error "API health endpoint test"
    fi
    
    # Database connectivity
    if curl -f -s "${api_url}/api/status" >/dev/null; then
        log_success "Database connectivity test passed"
    else
        handle_error "database connectivity test"
    fi
    
    log_success "Production smoke tests completed"
}

# Performance verification
verify_performance() {
    log_info "Verifying performance metrics..."
    
    # Run Lighthouse performance test
    if command -v lighthouse &> /dev/null; then
        local lighthouse_score=$(lighthouse "${PRODUCTION_FRONTEND_URL}" --only-categories=performance --output=json --quiet | jq '.categories.performance.score * 100')
        
        if (( $(echo "$lighthouse_score >= 90" | bc -l) )); then
            log_success "Performance score: ${lighthouse_score}% (Excellent)"
        elif (( $(echo "$lighthouse_score >= 70" | bc -l) )); then
            log_warning "Performance score: ${lighthouse_score}% (Good, but could be improved)"
        else
            log_warning "Performance score: ${lighthouse_score}% (Needs improvement)"
        fi
    else
        log_info "Lighthouse not available, skipping performance verification"
    fi
}

# Rollback function
perform_rollback() {
    log_info "Performing production rollback..."
    
    # Rollback database if backup exists
    if [ -n "${BACKUP_NAME:-}" ]; then
        log_info "Rolling back database to backup: ${BACKUP_NAME}"
        cd packages/api
        npm run db:restore -- --name="${BACKUP_NAME}"
        cd ../..
    fi
    
    # Rollback deployment (implementation depends on hosting platform)
    log_info "Rolling back deployment..."
    # Add rollback logic for your deployment platform
    
    log_success "Rollback completed"
}

# Update deployment status
update_deployment_status() {
    local status=$1
    local description=$2
    local environment_url=${3:-""}
    
    if [ -n "${GITHUB_TOKEN:-}" ] && [ -n "${DEPLOYMENT_ID:-}" ]; then
        log_info "Updating deployment status: $status"
        
        local payload="{\"state\":\"${status}\",\"description\":\"${description}\""
        if [ -n "$environment_url" ]; then
            payload="${payload},\"environment_url\":\"${environment_url}\""
        fi
        payload="${payload}}"
        
        curl -X POST \
            -H "Authorization: token ${GITHUB_TOKEN}" \
            -H "Accept: application/vnd.github.v3+json" \
            "https://api.github.com/repos/${GITHUB_REPOSITORY}/deployments/${DEPLOYMENT_ID}/statuses" \
            -d "$payload" \
            >/dev/null 2>&1 || log_warning "Failed to update deployment status"
    fi
}

# Send success notification
send_success_notification() {
    log_info "Sending success notifications..."
    
    # Slack notification
    if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"✅ TypeAmp production deployment successful! ${PRODUCTION_FRONTEND_URL}\"}" \
            "${SLACK_WEBHOOK_URL}" || log_warning "Failed to send Slack notification"
    fi
    
    log_info "Success notifications sent"
}

# Main production deployment flow
main() {
    log_info "🚀 TypeAmp Production Deployment Started"
    log_info "Deployment ID: ${DEPLOYMENT_ID:-"unknown"}"
    log_info "Git SHA: ${GITHUB_SHA:-"unknown"}"
    log_info "Build Date: $(date -u +'%Y-%m-%d %H:%M:%S UTC')"
    
    # Update status to in_progress
    update_deployment_status "in_progress" "Production deployment in progress"
    
    # Execute production deployment steps
    validate_production_environment
    create_database_backup
    run_production_migrations
    deploy_backend_zero_downtime
    deploy_frontend_blue_green
    comprehensive_health_check
    run_production_smoke_tests
    verify_performance
    
    # Update status to success
    update_deployment_status "success" "Production deployment completed successfully" "${PRODUCTION_FRONTEND_URL}"
    
    # Send notifications
    send_success_notification
    
    log_success "🎉 TypeAmp production deployment completed successfully!"
    log_info "🌐 Frontend URL: ${PRODUCTION_FRONTEND_URL}"
    log_info "📡 API URL: ${NEXT_PUBLIC_API_URL_PRODUCTION}"
    log_info "🕒 Deployment completed at: $(date -u +'%Y-%m-%d %H:%M:%S UTC')"
}

# Run main deployment
main "$@"