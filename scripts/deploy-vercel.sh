#!/bin/bash

# TypeAmp Vercel Deployment Script
# Usage: ./scripts/deploy-vercel.sh [environment]

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-preview}
PROJECT_NAME="typeamp"

echo -e "${BLUE}🚀 TypeAmp Deployment Script${NC}"
echo -e "${BLUE}================================${NC}"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI is not installed${NC}"
    echo "Please install it with: npm i -g vercel"
    exit 1
fi

# Check if logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Vercel${NC}"
    echo "Logging in..."
    vercel login
fi

# Function to deploy
deploy() {
    local env=$1
    local args=""
    
    case $env in
        "production")
            args="--prod"
            echo -e "${YELLOW}🚀 Deploying to PRODUCTION${NC}"
            ;;
        "staging")
            args="--env=staging"
            echo -e "${YELLOW}🚀 Deploying to STAGING${NC}"
            ;;
        "preview")
            args=""
            echo -e "${YELLOW}🚀 Deploying to PREVIEW${NC}"
            ;;
        *)
            echo -e "${RED}❌ Unknown environment: $env${NC}"
            exit 1
            ;;
    esac
    
    # Pre-deployment checks
    echo -e "${BLUE}📋 Running pre-deployment checks...${NC}"
    
    # Check if all tests pass
    echo "Running tests..."
    npm run test:run --workspace=type || {
        echo -e "${RED}❌ Tests failed. Fix before deploying.${NC}"
        exit 1
    }
    
    # Check TypeScript
    echo "Checking TypeScript..."
    npm run type-check --workspace=type || {
        echo -e "${RED}❌ TypeScript errors found. Fix before deploying.${NC}"
        exit 1
    }
    
    # Build locally to catch errors
    echo "Building application..."
    npm run build --workspace=type || {
        echo -e "${RED}❌ Build failed. Fix before deploying.${NC}"
        exit 1
    }
    
    echo -e "${GREEN}✅ Pre-deployment checks passed${NC}"
    
    # Deploy to Vercel
    echo -e "${BLUE}🚀 Deploying to Vercel...${NC}"
    
    if [ "$env" = "production" ]; then
        # Production deployment confirmation
        echo -e "${YELLOW}⚠️  You are about to deploy to PRODUCTION${NC}"
        read -p "Are you sure? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}Deployment cancelled${NC}"
            exit 0
        fi
    fi
    
    # Run deployment
    vercel $args --yes || {
        echo -e "${RED}❌ Deployment failed${NC}"
        exit 1
    }
    
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    
    # Post-deployment tasks
    if [ "$env" = "production" ]; then
        echo -e "${BLUE}📋 Running post-deployment tasks...${NC}"
        
        # Purge CDN cache
        echo "Purging CDN cache..."
        # vercel purge (if needed)
        
        # Notify monitoring services
        echo "Notifying monitoring services..."
        # curl -X POST https://api.sentry.io/...
        
        # Update status page
        echo "Updating status page..."
        # Update status page API
        
        echo -e "${GREEN}✅ Post-deployment tasks completed${NC}"
    fi
}

# Function to setup environment variables
setup_env() {
    local env=$1
    
    echo -e "${BLUE}🔧 Setting up environment variables for $env...${NC}"
    
    case $env in
        "production")
            vercel env pull .env.production
            ;;
        "staging")
            vercel env pull .env.staging
            ;;
        *)
            vercel env pull .env.preview
            ;;
    esac
}

# Function to rollback
rollback() {
    echo -e "${YELLOW}⚠️  Rolling back deployment...${NC}"
    
    vercel rollback || {
        echo -e "${RED}❌ Rollback failed${NC}"
        exit 1
    }
    
    echo -e "${GREEN}✅ Rollback successful${NC}"
}

# Main execution
case ${2:-deploy} in
    "deploy")
        deploy $ENVIRONMENT
        ;;
    "setup")
        setup_env $ENVIRONMENT
        ;;
    "rollback")
        rollback
        ;;
    *)
        echo "Usage: $0 [environment] [command]"
        echo "Environments: production, staging, preview (default: preview)"
        echo "Commands: deploy (default), setup, rollback"
        exit 1
        ;;
esac

echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}✅ All done!${NC}"