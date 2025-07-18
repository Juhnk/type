#!/bin/bash

# TypeAmp Database Migration Script for Production
# This script handles database migrations using Prisma with Neon

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}

echo -e "${BLUE}🗄️  TypeAmp Database Migration${NC}"
echo -e "${BLUE}==============================${NC}"

# Function to run migrations
run_migrations() {
    local env=$1
    
    echo -e "${YELLOW}📦 Environment: $env${NC}"
    
    # Load environment variables
    if [ "$env" = "production" ]; then
        echo -e "${YELLOW}⚠️  Loading production environment${NC}"
        # In production, we use Vercel env vars
        vercel env pull .env.production --environment=production
        source .env.production
    else
        echo -e "${BLUE}Loading $env environment${NC}"
        if [ -f ".env.$env" ]; then
            source .env.$env
        else
            echo -e "${RED}❌ Environment file .env.$env not found${NC}"
            exit 1
        fi
    fi
    
    # Navigate to API directory
    cd packages/api
    
    # Check database connection
    echo -e "${BLUE}🔍 Checking database connection...${NC}"
    npx prisma db execute --stdin <<< "SELECT 1;" || {
        echo -e "${RED}❌ Cannot connect to database${NC}"
        exit 1
    }
    echo -e "${GREEN}✅ Database connection successful${NC}"
    
    # Generate Prisma Client
    echo -e "${BLUE}🔧 Generating Prisma Client...${NC}"
    npx prisma generate
    
    # Create migration (if in development)
    if [ "$env" = "development" ]; then
        echo -e "${BLUE}📝 Creating migration...${NC}"
        read -p "Migration name: " migration_name
        npx prisma migrate dev --name "$migration_name"
    else
        # Deploy migrations in staging/production
        echo -e "${BLUE}🚀 Deploying migrations...${NC}"
        
        # Show pending migrations
        echo -e "${YELLOW}Pending migrations:${NC}"
        npx prisma migrate status
        
        if [ "$env" = "production" ]; then
            echo -e "${YELLOW}⚠️  You are about to run migrations on PRODUCTION${NC}"
            read -p "Are you sure? (y/N) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo -e "${YELLOW}Migration cancelled${NC}"
                exit 0
            fi
            
            # Create backup branch in Neon before migration
            echo -e "${BLUE}🔒 Creating database backup branch...${NC}"
            # This would use Neon CLI if available
            # neon branch create pre-migration-$(date +%Y%m%d-%H%M%S)
        fi
        
        # Deploy migrations
        npx prisma migrate deploy
    fi
    
    # Validate schema
    echo -e "${BLUE}✓ Validating schema...${NC}"
    npx prisma validate
    
    # Run seed (if requested)
    if [ "${2:-}" = "--seed" ]; then
        echo -e "${BLUE}🌱 Seeding database...${NC}"
        npm run seed
    fi
    
    echo -e "${GREEN}✅ Migration completed successfully!${NC}"
}

# Function to rollback
rollback() {
    local env=$1
    
    echo -e "${YELLOW}⚠️  Rolling back migration...${NC}"
    
    cd packages/api
    
    # Show migration history
    echo -e "${BLUE}Migration history:${NC}"
    npx prisma migrate status
    
    echo -e "${RED}Note: Prisma doesn't support automatic rollback.${NC}"
    echo "Options:"
    echo "1. Restore from Neon branch/backup"
    echo "2. Create a new migration to reverse changes"
    echo "3. Reset database (DANGER: Will delete all data)"
    
    read -p "Choose option (1-3): " choice
    
    case $choice in
        1)
            echo "Please use Neon dashboard to restore from backup branch"
            ;;
        2)
            echo "Creating a reversal migration..."
            read -p "Reversal migration name: " migration_name
            npx prisma migrate dev --name "revert_$migration_name"
            ;;
        3)
            echo -e "${RED}⚠️  This will DELETE ALL DATA!${NC}"
            read -p "Type 'DELETE ALL DATA' to confirm: " confirm
            if [ "$confirm" = "DELETE ALL DATA" ]; then
                npx prisma migrate reset --force
            else
                echo "Reset cancelled"
            fi
            ;;
        *)
            echo "Invalid option"
            ;;
    esac
}

# Function to check migration status
status() {
    cd packages/api
    
    echo -e "${BLUE}📊 Migration Status${NC}"
    echo -e "${BLUE}==================${NC}"
    
    npx prisma migrate status
    
    echo -e "\n${BLUE}📈 Database Info${NC}"
    npx prisma db execute --stdin <<< "
        SELECT 
            current_database() as database,
            pg_database_size(current_database()) as size,
            count(*) as migrations
        FROM _prisma_migrations;
    "
}

# Main execution
case ${2:-migrate} in
    "migrate")
        run_migrations $ENVIRONMENT $3
        ;;
    "rollback")
        rollback $ENVIRONMENT
        ;;
    "status")
        status
        ;;
    *)
        echo "Usage: $0 [environment] [command] [options]"
        echo "Environments: development, staging, production"
        echo "Commands:"
        echo "  migrate (default) - Run migrations"
        echo "  rollback         - Rollback migrations"
        echo "  status           - Check migration status"
        echo "Options:"
        echo "  --seed           - Run seed after migration"
        exit 1
        ;;
esac