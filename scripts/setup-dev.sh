#!/bin/bash

# TypeAmp Development Environment Setup Script
# This script handles initial developer setup and environment validation

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
REQUIRED_NODE_VERSION="18"
REQUIRED_NPM_VERSION="9"
POSTGRES_MIN_VERSION="13"

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

print_header() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
}

# Check command existence
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Version comparison
version_ge() {
    [ "$(printf '%s\n' "$1" "$2" | sort -V | head -n1)" = "$2" ]
}

# Check Node.js version
check_node_version() {
    print_header "Checking Node.js Version"
    
    if ! command_exists node; then
        log_error "Node.js is not installed!"
        echo "Please install Node.js ${REQUIRED_NODE_VERSION}.x or higher from: https://nodejs.org/"
        return 1
    fi
    
    local node_version=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [ "$node_version" -lt "$REQUIRED_NODE_VERSION" ]; then
        log_error "Node.js version $node_version is too old. Required: ${REQUIRED_NODE_VERSION}.x or higher"
        return 1
    fi
    
    log_success "Node.js $(node -v) is installed"
}

# Check npm version
check_npm_version() {
    print_header "Checking npm Version"
    
    if ! command_exists npm; then
        log_error "npm is not installed!"
        return 1
    fi
    
    local npm_version=$(npm -v | cut -d '.' -f 1)
    if [ "$npm_version" -lt "$REQUIRED_NPM_VERSION" ]; then
        log_warning "npm version $(npm -v) is older than recommended ${REQUIRED_NPM_VERSION}.x"
        log_info "Updating npm..."
        npm install -g npm@latest
    fi
    
    log_success "npm $(npm -v) is installed"
}

# Check PostgreSQL installation
check_postgresql() {
    print_header "Checking PostgreSQL"
    
    if command_exists psql; then
        local pg_version=$(psql --version | awk '{print $3}' | cut -d '.' -f 1)
        if [ "$pg_version" -ge "$POSTGRES_MIN_VERSION" ]; then
            log_success "PostgreSQL $pg_version is installed"
            return 0
        else
            log_warning "PostgreSQL $pg_version is older than recommended $POSTGRES_MIN_VERSION"
        fi
    else
        log_error "PostgreSQL is not installed or not in PATH"
        echo "Please install PostgreSQL $POSTGRES_MIN_VERSION or higher"
        echo ""
        echo "Installation options:"
        echo "  macOS:   brew install postgresql"
        echo "  Ubuntu:  sudo apt-get install postgresql"
        echo "  Windows: Download from https://www.postgresql.org/download/windows/"
        return 1
    fi
}

# Create environment files
create_env_files() {
    print_header "Setting up Environment Files"
    
    # Check for root .env file
    if [ ! -f ".env" ] && [ -f ".env.template" ]; then
        log_info "Creating .env from template..."
        cp .env.template .env
        log_success "Created .env file"
    elif [ ! -f ".env" ]; then
        log_info "Creating default .env file..."
        cat > .env << EOF
# TypeAmp Development Environment Variables
NODE_ENV=development

# Database - PostgreSQL Configuration
DATABASE_URL=postgresql://typeamp_user:typeamp_dev_pass@localhost:5432/typeamp_dev
TEST_DATABASE_URL=postgresql://typeamp_user:typeamp_dev_pass@localhost:5432/typeamp_test
DATABASE_USER=typeamp_user
DATABASE_PASSWORD=typeamp_dev_pass
DATABASE_NAME=typeamp_dev

# API Configuration
API_PORT=8081
API_HOST=localhost
JWT_SECRET=dev-secret-key-change-in-production

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:8081
NEXT_PUBLIC_ENVIRONMENT=development

# AI Service (Optional)
ANTHROPIC_API_KEY=
EOF
        log_success "Created default .env file"
    else
        log_info ".env file already exists"
    fi
    
    # Create package-specific env files
    if [ ! -f "packages/api/.env" ]; then
        log_info "Creating packages/api/.env..."
        cat > packages/api/.env << EOF
# API Environment Variables
DATABASE_URL=postgresql://typeamp_user:typeamp_dev_pass@localhost:5432/typeamp_dev
JWT_SECRET=dev-secret-key-change-in-production
API_PORT=8081
API_HOST=localhost
EOF
        log_success "Created packages/api/.env"
    fi
    
    if [ ! -f "packages/web/.env.local" ]; then
        log_info "Creating packages/web/.env.local..."
        cat > packages/web/.env.local << EOF
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:8081
NEXT_PUBLIC_ENVIRONMENT=development
EOF
        log_success "Created packages/web/.env.local"
    fi
}

# Setup PostgreSQL database
setup_database() {
    print_header "Setting up PostgreSQL Database"
    
    # Check if PostgreSQL is running
    if ! pg_isready -q; then
        log_warning "PostgreSQL is not running"
        
        # Try to start PostgreSQL based on OS
        if [[ "$OSTYPE" == "darwin"* ]]; then
            log_info "Starting PostgreSQL on macOS..."
            brew services start postgresql || true
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            log_info "Starting PostgreSQL on Linux..."
            sudo systemctl start postgresql || true
        fi
        
        # Wait for PostgreSQL to start
        sleep 2
        
        if ! pg_isready -q; then
            log_error "Failed to start PostgreSQL"
            return 1
        fi
    fi
    
    log_success "PostgreSQL is running"
    
    # Create user and databases with proper PostgreSQL setup
    log_info "Setting up database user and databases..."
    
    # Drop existing user and databases for clean setup
    sudo -u postgres psql -c "DROP USER IF EXISTS typeamp_user;" 2>/dev/null || true
    sudo -u postgres dropdb typeamp_dev 2>/dev/null || true
    sudo -u postgres dropdb typeamp_test 2>/dev/null || true
    
    # Create user with proper privileges
    if sudo -u postgres psql -c "CREATE USER typeamp_user WITH PASSWORD 'typeamp_dev_pass' CREATEDB CREATEROLE;" 2>/dev/null; then
        log_success "Database user 'typeamp_user' created"
    else
        log_warning "Database user creation failed (may already exist)"
        # Check if user exists
        if sudo -u postgres psql -tc "SELECT 1 FROM pg_user WHERE usename = 'typeamp_user'" 2>/dev/null | grep -q 1; then
            log_success "Database user 'typeamp_user' already exists"
        else
            log_error "Failed to create database user"
            return 1
        fi
    fi
    
    # Create databases with proper ownership
    if sudo -u postgres createdb -O typeamp_user typeamp_dev && sudo -u postgres createdb -O typeamp_user typeamp_test; then
        log_success "Created typeamp_dev and typeamp_test databases"
    else
        log_error "Failed to create databases"
        return 1
    fi
    
    # Test database connection
    if PGPASSWORD='typeamp_dev_pass' psql -h localhost -U typeamp_user -d typeamp_dev -c "SELECT 1;" >/dev/null 2>&1; then
        log_success "Database connection test successful"
    else
        log_error "Database connection test failed"
        return 1
    fi
    
    log_success "PostgreSQL database setup complete"
}

# Install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    log_info "Installing root dependencies..."
    npm ci
    
    log_info "Installing workspace dependencies..."
    npm install --workspaces
    
    log_success "All dependencies installed"
}

# Generate Prisma client
generate_prisma() {
    print_header "Generating Prisma Client"
    
    log_info "Generating Prisma client..."
    npm run generate --workspace=@typeamp/api
    
    log_success "Prisma client generated"
}

# Run database migrations
run_migrations() {
    print_header "Running Database Migrations"
    
    log_info "Running migrations..."
    npm run db:push --workspace=@typeamp/api
    
    log_success "Database migrations complete"
}

# Seed database
seed_database() {
    print_header "Seeding Database"
    
    log_info "Seeding database with development data..."
    npm run seed --workspace=@typeamp/api
    
    log_success "Database seeded successfully"
}

# Main setup flow
main() {
    print_header "TypeAmp Development Environment Setup"
    
    echo "This script will set up your development environment for TypeAmp."
    echo "It will check dependencies, create databases, and configure your environment."
    echo ""
    
    # System checks
    check_node_version || exit 1
    check_npm_version || exit 1
    check_postgresql || exit 1
    
    # Environment setup
    create_env_files
    
    # Database setup
    setup_database || {
        log_error "Database setup failed"
        echo "Please ensure PostgreSQL is installed and running"
        exit 1
    }
    
    # Install and configure
    install_dependencies
    generate_prisma
    run_migrations
    seed_database
    
    print_header "Setup Complete! 🎉"
    
    echo "Your TypeAmp development environment is ready!"
    echo ""
    echo "To start developing, run:"
    echo -e "  ${GREEN}npm run dev:full${NC}"
    echo ""
    echo "This will start:"
    echo "  - Backend API server on http://localhost:8081"
    echo "  - Frontend dev server on http://localhost:3000"
    echo ""
    echo "Other useful commands:"
    echo "  npm run dev:health  - Check service health"
    echo "  npm run dev:reset   - Reset and restart everything"
    echo "  npm run db:studio   - Open Prisma Studio"
    echo ""
    log_success "Happy coding! 🚀"
}

# Run main function
main "$@"