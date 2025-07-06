#!/bin/bash

# TypeAmp Troubleshooting Script
# This script helps diagnose and fix common development environment issues

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
API_PORT=8081
WEB_PORT=3000
DB_PORT=5432

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[FIXED]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_fix() {
    echo -e "${MAGENTA}[FIX]${NC} $1"
}

print_header() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
}

# Interactive prompt
prompt_yes_no() {
    local prompt=$1
    local response
    
    while true; do
        read -p "$prompt (y/n): " response
        case $response in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Please answer yes (y) or no (n).";;
        esac
    done
}

# Automatic issue detection
detect_issues() {
    print_header "Automatic Issue Detection"
    
    local issues_found=0
    local auto_fix=${1:-false}
    
    # Check for common port conflicts
    log_info "Checking for port conflicts..."
    local ports=("$API_PORT:Backend API" "$WEB_PORT:Frontend" "$DB_PORT:PostgreSQL")
    for port_info in "${ports[@]}"; do
        local port="${port_info%%:*}"
        local service="${port_info#*:}"
        
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            local pid=$(lsof -Pi :$port -sTCP:LISTEN -t 2>/dev/null | head -1)
            local process=$(ps -p $pid -o comm= 2>/dev/null || echo "Unknown")
            
            if [[ "$process" == *"node"* ]] || [[ "$process" == *"tsx"* ]]; then
                log_warning "Found Node.js process on port $port (PID: $pid) - possible stale development server"
                if [ "$auto_fix" = "true" ] || prompt_yes_no "Kill stale process on port $port?"; then
                    kill $pid 2>/dev/null && log_success "Killed process $pid"
                fi
                issues_found=$((issues_found + 1))
            fi
        fi
    done
    
    # Check PostgreSQL connectivity
    log_info "Checking PostgreSQL connectivity..."
    if ! pg_isready -h localhost -p 5432 -q; then
        log_warning "PostgreSQL is not running"
        if [ "$auto_fix" = "true" ] || prompt_yes_no "Start PostgreSQL?"; then
            if [[ "$OSTYPE" == "linux-gnu"* ]]; then
                sudo systemctl start postgresql && log_success "PostgreSQL started"
            elif [[ "$OSTYPE" == "darwin"* ]]; then
                brew services start postgresql && log_success "PostgreSQL started"
            fi
        fi
        issues_found=$((issues_found + 1))
    fi
    
    # Check environment files
    log_info "Checking environment configuration..."
    local env_files=(".env" "packages/api/.env" "packages/web/.env.local")
    for env_file in "${env_files[@]}"; do
        if [ ! -f "$env_file" ]; then
            log_warning "Missing environment file: $env_file"
            if [ "$auto_fix" = "true" ] || prompt_yes_no "Create missing environment file $env_file?"; then
                case "$env_file" in
                    ".env")
                        cat > "$env_file" << 'EOF'
NODE_ENV=development
DATABASE_URL=postgresql://typeamp_user:typeamp_dev_pass@localhost:5432/typeamp_dev
TEST_DATABASE_URL=postgresql://typeamp_user:typeamp_dev_pass@localhost:5432/typeamp_test
DATABASE_USER=typeamp_user
DATABASE_PASSWORD=typeamp_dev_pass
DATABASE_NAME=typeamp_dev
API_PORT=8081
API_HOST=localhost
JWT_SECRET=dev-secret-key-change-in-production
NEXT_PUBLIC_API_URL=http://localhost:8081
NEXT_PUBLIC_ENVIRONMENT=development
EOF
                        ;;
                    "packages/api/.env")
                        mkdir -p "$(dirname "$env_file")"
                        cat > "$env_file" << 'EOF'
DATABASE_URL=postgresql://typeamp_user:typeamp_dev_pass@localhost:5432/typeamp_dev
JWT_SECRET=dev-secret-key-change-in-production
API_PORT=8081
API_HOST=localhost
EOF
                        ;;
                    "packages/web/.env.local")
                        mkdir -p "$(dirname "$env_file")"
                        cat > "$env_file" << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8081
NEXT_PUBLIC_ENVIRONMENT=development
EOF
                        ;;
                esac
                log_success "Created $env_file"
            fi
            issues_found=$((issues_found + 1))
        fi
    done
    
    # Check for missing dependencies
    log_info "Checking dependencies..."
    if [ ! -d "node_modules" ]; then
        log_warning "Dependencies not installed"
        if [ "$auto_fix" = "true" ] || prompt_yes_no "Install dependencies?"; then
            npm install && log_success "Dependencies installed"
        fi
        issues_found=$((issues_found + 1))
    fi
    
    # Check Prisma client
    if [ ! -d "packages/api/src/generated/prisma" ]; then
        log_warning "Prisma client not generated"
        if [ "$auto_fix" = "true" ] || prompt_yes_no "Generate Prisma client?"; then
            npm run generate --workspace=@typeamp/api && log_success "Prisma client generated"
        fi
        issues_found=$((issues_found + 1))
    fi
    
    if [ $issues_found -eq 0 ]; then
        log_success "No issues detected!"
    else
        log_info "Found and addressed $issues_found potential issues"
    fi
    
    return $issues_found
}

# Check and fix port conflicts
fix_port_conflicts() {
    print_header "Checking for Port Conflicts"
    
    local ports=("$API_PORT:Backend API" "$WEB_PORT:Frontend" "$DB_PORT:PostgreSQL")
    
    for port_info in "${ports[@]}"; do
        local port="${port_info%%:*}"
        local service="${port_info#*:}"
        
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            local pid=$(lsof -Pi :$port -sTCP:LISTEN -t 2>/dev/null | head -1)
            local process=$(ps -p $pid -o comm= 2>/dev/null || echo "Unknown")
            
            log_warning "Port $port is in use by process $process (PID: $pid)"
            
            if [[ "$process" == *"node"* ]] || [[ "$process" == *"tsx"* ]]; then
                if prompt_yes_no "Kill this process to free port $port?"; then
                    if kill $pid 2>/dev/null; then
                        log_success "Killed process on port $port"
                    else
                        log_error "Failed to kill process. Try: sudo kill $pid"
                    fi
                fi
            else
                log_info "Port $port is used by $process. This might be correct."
            fi
        else
            log_info "Port $port is available"
        fi
    done
}

# Fix database issues
fix_database() {
    print_header "Database Troubleshooting"
    
    # Check if PostgreSQL is installed
    if ! command -v psql >/dev/null 2>&1; then
        log_error "PostgreSQL is not installed"
        log_fix "Install PostgreSQL:"
        echo "  macOS:   brew install postgresql"
        echo "  Ubuntu:  sudo apt-get install postgresql"
        echo "  Windows: Download from https://www.postgresql.org/download/windows/"
        return 1
    fi
    
    # Check if PostgreSQL is running
    if ! pg_isready -q; then
        log_warning "PostgreSQL is not running"
        
        if prompt_yes_no "Start PostgreSQL?"; then
            if [[ "$OSTYPE" == "darwin"* ]]; then
                brew services start postgresql
            elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
                sudo systemctl start postgresql
            fi
            
            sleep 2
            
            if pg_isready -q; then
                log_success "PostgreSQL started successfully"
            else
                log_error "Failed to start PostgreSQL"
                log_fix "Try starting manually:"
                echo "  macOS:   brew services start postgresql"
                echo "  Linux:   sudo systemctl start postgresql"
            fi
        fi
    else
        log_info "PostgreSQL is running"
    fi
    
    # Check database connection
    if [ -f ".env" ]; then
        set -a
        source .env
        set +a
    fi
    
    local db_user="${DATABASE_USER:-typeamp_user}"
    local db_pass="${DATABASE_PASSWORD:-typeamp_dev_pass}"
    local db_name="${DATABASE_NAME:-typeamp_dev}"
    
    if ! PGPASSWORD="$db_pass" psql -h localhost -U "$db_user" -d "$db_name" -c "SELECT 1" >/dev/null 2>&1; then
        log_warning "Cannot connect to database"
        
        if prompt_yes_no "Recreate database and user?"; then
            log_info "Creating database user..."
            psql -U postgres -c "CREATE USER $db_user WITH PASSWORD '$db_pass' CREATEDB;" 2>/dev/null || true
            
            log_info "Creating database..."
            createdb -U "$db_user" "$db_name" 2>/dev/null || true
            createdb -U "$db_user" "${db_name%_dev}_test" 2>/dev/null || true
            
            if PGPASSWORD="$db_pass" psql -h localhost -U "$db_user" -d "$db_name" -c "SELECT 1" >/dev/null 2>&1; then
                log_success "Database connection fixed"
            else
                log_error "Still cannot connect to database"
                log_fix "Check your PostgreSQL configuration and user permissions"
            fi
        fi
    else
        log_info "Database connection is working"
    fi
}

# Fix dependency issues
fix_dependencies() {
    print_header "Dependency Troubleshooting"
    
    # Check node_modules
    if [ ! -d "node_modules" ]; then
        log_warning "Dependencies not installed"
        
        if prompt_yes_no "Install dependencies?"; then
            npm ci
            log_success "Dependencies installed"
        fi
    else
        log_info "Dependencies are installed"
    fi
    
    # Check for package-lock conflicts
    if git status --porcelain | grep -q "package-lock.json"; then
        log_warning "package-lock.json has uncommitted changes"
        
        if prompt_yes_no "Reset package-lock.json and reinstall?"; then
            git checkout package-lock.json
            rm -rf node_modules
            npm ci
            log_success "Dependencies reinstalled"
        fi
    fi
    
    # Check Prisma client
    if [ ! -d "packages/api/src/generated/prisma" ]; then
        log_warning "Prisma client not generated"
        
        if prompt_yes_no "Generate Prisma client?"; then
            npm run generate --workspace=@typeamp/api
            log_success "Prisma client generated"
        fi
    else
        log_info "Prisma client is generated"
    fi
}

# Fix environment variables
fix_environment() {
    print_header "Environment Configuration"
    
    # Check .env files
    local env_files=(".env" "packages/api/.env" "packages/web/.env.local")
    
    for env_file in "${env_files[@]}"; do
        if [ ! -f "$env_file" ]; then
            log_warning "$env_file is missing"
            
            if prompt_yes_no "Create $env_file from template?"; then
                case "$env_file" in
                    ".env")
                        cp .env.template "$env_file" 2>/dev/null || \
                        cat > "$env_file" << EOF
NODE_ENV=development
DATABASE_URL=postgresql://typeamp_user:typeamp_dev_pass@localhost:5432/typeamp_dev
API_PORT=8081
API_HOST=localhost
JWT_SECRET=dev-secret-key-change-in-production
NEXT_PUBLIC_API_URL=http://localhost:8081
NEXT_PUBLIC_ENVIRONMENT=development
TEST_DATABASE_URL=postgresql://typeamp_user:typeamp_dev_pass@localhost:5432/typeamp_test
EOF
                        ;;
                    "packages/api/.env")
                        cat > "$env_file" << EOF
DATABASE_URL=postgresql://typeamp_user:typeamp_dev_pass@localhost:5432/typeamp_dev
JWT_SECRET=dev-secret-key-change-in-production
API_PORT=8081
API_HOST=localhost
EOF
                        ;;
                    "packages/web/.env.local")
                        cat > "$env_file" << EOF
NEXT_PUBLIC_API_URL=http://localhost:8081
NEXT_PUBLIC_ENVIRONMENT=development
EOF
                        ;;
                esac
                log_success "Created $env_file"
            fi
        else
            log_info "$env_file exists"
        fi
    done
}

# Clean and reset
clean_reset() {
    print_header "Clean Reset"
    
    log_warning "This will remove all generated files and databases"
    
    if prompt_yes_no "Perform clean reset?"; then
        log_info "Stopping all services..."
        pkill -f "tsx watch" || true
        pkill -f "next dev" || true
        
        log_info "Removing generated files..."
        rm -rf node_modules
        rm -rf packages/*/node_modules
        rm -rf packages/web/.next
        rm -rf packages/api/src/generated
        rm -f *.pid
        rm -rf logs
        
        log_info "Dropping databases..."
        sudo -u postgres dropdb "${DATABASE_NAME:-typeamp_dev}" 2>/dev/null || true
        sudo -u postgres dropdb "${DATABASE_NAME:-typeamp_test}" 2>/dev/null || true
        
        log_success "Clean reset complete"
        log_info "Run 'npm run dev:setup' to set up fresh environment"
    fi
}

# Check logs
check_logs() {
    print_header "Recent Log Entries"
    
    if [ -d "logs" ]; then
        if [ -f "logs/api.log" ]; then
            log_info "Recent API logs:"
            tail -20 logs/api.log | sed 's/^/  /'
        fi
        
        if [ -f "logs/web.log" ]; then
            log_info "Recent Frontend logs:"
            tail -20 logs/web.log | sed 's/^/  /'
        fi
    else
        log_info "No log files found"
    fi
}

# Interactive troubleshooting menu
interactive_menu() {
    while true; do
        print_header "TypeAmp Troubleshooting Menu"
        
        echo "What would you like to troubleshoot?"
        echo ""
        echo "0) Auto-detect and fix issues (recommended)"
        echo "1) Port conflicts"
        echo "2) Database issues"
        echo "3) Dependency problems"
        echo "4) Environment variables"
        echo "5) View recent logs"
        echo "6) Clean reset (remove everything)"
        echo "7) Run all checks"
        echo "8) Exit"
        echo ""
        
        read -p "Select an option (0-8): " choice
        
        case $choice in
            0) detect_issues;;
            1) fix_port_conflicts;;
            2) fix_database;;
            3) fix_dependencies;;
            4) fix_environment;;
            5) check_logs;;
            6) clean_reset;;
            7) 
                fix_port_conflicts
                fix_database
                fix_dependencies
                fix_environment
                ;;
            8) 
                echo "Exiting troubleshooter"
                exit 0
                ;;
            *) 
                log_warning "Invalid option. Please select 0-8."
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Main troubleshooting flow
main() {
    print_header "TypeAmp Development Troubleshooter"
    
    if [ $# -eq 0 ]; then
        # No arguments, run interactive menu
        interactive_menu
    else
        # Run specific troubleshooting based on argument
        case "$1" in
            auto) detect_issues;;
            auto-fix) detect_issues true;;
            ports) fix_port_conflicts;;
            database|db) fix_database;;
            deps|dependencies) fix_dependencies;;
            env|environment) fix_environment;;
            logs) check_logs;;
            reset) clean_reset;;
            all)
                fix_port_conflicts
                fix_database
                fix_dependencies
                fix_environment
                ;;
            *)
                echo "Usage: $0 [auto|auto-fix|ports|database|deps|env|logs|reset|all]"
                echo "Or run without arguments for interactive mode"
                exit 1
                ;;
        esac
    fi
}

# Run main function
main "$@"