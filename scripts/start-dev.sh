#!/bin/bash

# TypeAmp Development Startup Script
# This script orchestrates the startup of all development services

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
DB_HOST=localhost
DB_PORT=5432
STARTUP_TIMEOUT=120
HEALTH_CHECK_INTERVAL=3
MAX_RESTART_ATTEMPTS=3

# Process tracking
declare -a PIDS=()
declare -A RESTART_COUNTS=()
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_ROOT/logs"

# Cleanup function for graceful shutdown
cleanup() {
    local exit_code=$?
    echo ""
    log_info "Shutting down development environment..."
    
    # Kill all tracked processes
    for pid in "${PIDS[@]}"; do
        if kill -0 "$pid" 2>/dev/null; then
            local process_name=$(ps -p "$pid" -o comm= 2>/dev/null || echo "unknown")
            log_info "Stopping process: $process_name (PID: $pid)"
            
            # Try graceful shutdown first
            if kill "$pid" 2>/dev/null; then
                # Wait up to 5 seconds for graceful shutdown
                local count=0
                while kill -0 "$pid" 2>/dev/null && [ $count -lt 5 ]; do
                    sleep 1
                    count=$((count + 1))
                done
                
                # Force kill if still running
                if kill -0 "$pid" 2>/dev/null; then
                    log_warning "Force killing stubborn process: $pid"
                    kill -9 "$pid" 2>/dev/null || true
                fi
            fi
        fi
    done
    
    # Clean up PID files
    rm -f "$PROJECT_ROOT"/*.pid 2>/dev/null || true
    
    if [ $exit_code -eq 0 ]; then
        log_success "Development environment stopped gracefully"
    else
        log_error "Development environment stopped with errors (exit code: $exit_code)"
    fi
    
    exit $exit_code
}

# Set up signal handlers for cleanup
trap cleanup EXIT
trap cleanup INT
trap cleanup TERM

# Ensure log directory exists
mkdir -p "$LOG_DIR"

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

log_service() {
    local service=$1
    local message=$2
    echo -e "${MAGENTA}[$service]${NC} $message"
}

print_header() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
}

# Cleanup function
cleanup() {
    log_info "Shutting down services..."
    
    # Kill all child processes
    for pid in "${PIDS[@]}"; do
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid" 2>/dev/null || true
        fi
    done
    
    # Remove PID files
    rm -f "$PROJECT_ROOT/api.pid" "$PROJECT_ROOT/web.pid"
    
    log_success "All services stopped"
}

# Set up signal handlers
trap cleanup EXIT INT TERM

# Check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Kill process on port
kill_port() {
    local port=$1
    local service=$2
    
    if check_port "$port"; then
        log_warning "Port $port is already in use by $service. Attempting to free it..."
        
        # Get PID of process using the port
        local pid=$(lsof -Pi :$port -sTCP:LISTEN -t 2>/dev/null | head -1)
        
        if [ -n "$pid" ]; then
            local process_name=$(ps -p $pid -o comm= 2>/dev/null || echo "unknown")
            log_info "Found process: $process_name (PID: $pid) using port $port"
            
            # Try graceful kill first
            if kill "$pid" 2>/dev/null; then
                log_info "Sent TERM signal to PID $pid, waiting for cleanup..."
                
                # Wait up to 10 seconds for graceful shutdown
                local wait_count=0
                while check_port "$port" && [ $wait_count -lt 10 ]; do
                    sleep 1
                    wait_count=$((wait_count + 1))
                    echo -n "."
                done
                echo ""
                
                # Check if process is still alive and port still in use
                if check_port "$port"; then
                    if kill -0 "$pid" 2>/dev/null; then
                        log_warning "Process $pid didn't respond to TERM, using KILL signal"
                        kill -9 "$pid" 2>/dev/null || true
                        sleep 3
                    fi
                fi
                
                log_success "Process cleanup completed for port $port"
            else
                log_warning "Could not send TERM signal, trying KILL signal"
                kill -9 "$pid" 2>/dev/null || true
                sleep 3
            fi
        fi
        
        # Final verification that port is free
        if check_port "$port"; then
            log_error "Port $port is still in use after cleanup attempts"
            local remaining_pid=$(lsof -Pi :$port -sTCP:LISTEN -t 2>/dev/null | head -1)
            if [ -n "$remaining_pid" ]; then
                log_error "Remaining process: $(ps -p $remaining_pid -o pid,comm,args --no-headers 2>/dev/null || echo 'Unknown process')"
            fi
            return 1
        fi
        
        log_success "Port $port is now available"
    fi
    
    return 0
}

# Wait for service to be ready
wait_for_service() {
    local service=$1
    local url=$2
    local timeout=$3
    local elapsed=0
    
    log_service "$service" "Waiting for service to be ready..."
    
    while [ $elapsed -lt $timeout ]; do
        if curl -s -f "$url" >/dev/null 2>&1; then
            log_service "$service" "✅ Service is ready!"
            return 0
        fi
        
        sleep $HEALTH_CHECK_INTERVAL
        elapsed=$((elapsed + HEALTH_CHECK_INTERVAL))
        echo -n "."
    done
    
    echo ""
    log_error "$service failed to start within $timeout seconds"
    return 1
}

# Check environment setup
check_environment() {
    print_header "Checking Environment"
    
    # Check if setup has been run
    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        log_error "Environment not configured. Please run 'npm run dev:setup' first"
        exit 1
    fi
    
    # Check if node_modules exist
    if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
        log_warning "Dependencies not installed. Installing now..."
        npm ci
    fi
    
    # Check if Prisma client is generated
    if [ ! -d "$PROJECT_ROOT/packages/api/src/generated/prisma" ]; then
        log_warning "Prisma client not generated. Generating now..."
        npm run generate --workspace=@typeamp/api
    fi
    
    # Load environment variables
    if [ -f "$PROJECT_ROOT/.env" ]; then
        export $(grep -v '^#' "$PROJECT_ROOT/.env" | xargs)
    fi
    
    log_success "Environment check passed"
}

# Enhanced database connection check with retry logic
check_database() {
    print_header "Checking Database Connection"
    
    log_info "Testing PostgreSQL connection..."
    
    # Load environment variables
    if [ -f "$PROJECT_ROOT/.env" ]; then
        set -a
        source "$PROJECT_ROOT/.env"
        set +a
    fi
    
    local db_user="${DATABASE_USER:-typeamp_user}"
    local db_pass="${DATABASE_PASSWORD:-typeamp_dev_pass}"
    local db_name="${DATABASE_NAME:-typeamp_dev}"
    local db_host="${DB_HOST:-localhost}"
    local db_port="${DB_PORT:-5432}"
    
    # Check if PostgreSQL service is running
    log_info "Checking PostgreSQL service on $db_host:$db_port..."
    if ! pg_isready -h "$db_host" -p "$db_port" -q; then
        log_error "PostgreSQL is not running on $db_host:$db_port"
        log_info "Attempting to start PostgreSQL..."
        
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            if command -v systemctl >/dev/null 2>&1; then
                sudo systemctl start postgresql || log_warning "Failed to start PostgreSQL via systemctl"
                sleep 3
            fi
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            if command -v brew >/dev/null 2>&1; then
                brew services start postgresql || log_warning "Failed to start PostgreSQL via brew"
                sleep 3
            fi
        fi
        
        # Check again after start attempt
        if ! pg_isready -h "$db_host" -p "$db_port" -q; then
            log_error "PostgreSQL failed to start. Please start it manually:"
            echo "  Linux:   sudo systemctl start postgresql"
            echo "  macOS:   brew services start postgresql"
            echo "  Windows: Start PostgreSQL service from Services"
            exit 1
        fi
        
        log_success "PostgreSQL service started successfully"
    fi
    
    # Test database connection with retry logic
    log_info "Testing database connection (user: $db_user, database: $db_name)..."
    local retry_count=0
    local max_retries=5
    local base_delay=2
    
    while [ $retry_count -lt $max_retries ]; do
        if PGPASSWORD="$db_pass" psql -h "$db_host" -p "$db_port" -U "$db_user" -d "$db_name" -c "SELECT 1;" >/dev/null 2>&1; then
            log_success "PostgreSQL database connection successful"
            
            # Verify database has tables
            local table_count=$(PGPASSWORD="$db_pass" psql -h "$db_host" -p "$db_port" -U "$db_user" -d "$db_name" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)
            
            if [ "${table_count:-0}" -gt 0 ]; then
                log_success "Found $table_count tables in database"
            else
                log_warning "Database exists but has no tables. You may need to run migrations."
                log_info "Run: npm run db:push --workspace=@typeamp/api"
            fi
            
            return 0
        else
            retry_count=$((retry_count + 1))
            if [ $retry_count -lt $max_retries ]; then
                local delay=$((base_delay * retry_count))
                log_warning "Database connection failed (attempt $retry_count/$max_retries). Retrying in ${delay}s..."
                sleep $delay
            fi
        fi
    done
    
    log_error "Failed to connect to PostgreSQL database after $max_retries attempts"
    log_info "Connection details:"
    echo "  Host: $db_host:$db_port"
    echo "  User: $db_user"
    echo "  Database: $db_name"
    echo ""
    log_info "Troubleshooting steps:"
    echo "  1. Check if database exists: sudo -u postgres psql -l | grep $db_name"
    echo "  2. Check if user exists: sudo -u postgres psql -c \"\\du\" | grep $db_user"
    echo "  3. Run setup: npm run dev:setup"
    echo "  4. Check credentials in .env file"
    exit 1
}

# Start backend API
start_backend() {
    print_header "Starting Backend API"
    
    # Kill existing process on port
    kill_port "$API_PORT" "API"
    
    # Start API server
    log_service "API" "Starting on port $API_PORT..."
    
    cd "$PROJECT_ROOT/packages/api"
    npm run dev > "$LOG_DIR/api.log" 2>&1 &
    local pid=$!
    
    # Verify process started successfully
    sleep 2
    if ! kill -0 "$pid" 2>/dev/null; then
        log_error "API process failed to start (PID $pid no longer exists)"
        if [ -f "$LOG_DIR/api.log" ]; then
            log_error "Last few lines from API log:"
            tail -10 "$LOG_DIR/api.log" | sed 's/^/  /'
        fi
        return 1
    fi
    
    PIDS+=($pid)
    echo $pid > "$PROJECT_ROOT/api.pid"
    log_info "API process started successfully (PID: $pid)"
    
    # Wait for API to be ready
    if wait_for_service "API" "http://localhost:$API_PORT/health" "$STARTUP_TIMEOUT"; then
        log_service "API" "Backend API is running at http://localhost:$API_PORT"
    else
        log_error "Backend API failed to start. Check logs at: $LOG_DIR/api.log"
        tail -20 "$LOG_DIR/api.log"
        exit 1
    fi
}

# Start frontend
start_frontend() {
    print_header "Starting Frontend Development Server"
    
    # Kill existing process on port
    kill_port "$WEB_PORT" "Frontend"
    
    # Start Next.js dev server
    log_service "Frontend" "Starting on port $WEB_PORT..."
    
    cd "$PROJECT_ROOT/packages/web"
    npm run dev > "$LOG_DIR/web.log" 2>&1 &
    local pid=$!
    
    # Verify process started successfully
    sleep 2
    if ! kill -0 "$pid" 2>/dev/null; then
        log_error "Frontend process failed to start (PID $pid no longer exists)"
        if [ -f "$LOG_DIR/web.log" ]; then
            log_error "Last few lines from Frontend log:"
            tail -10 "$LOG_DIR/web.log" | sed 's/^/  /'
        fi
        return 1
    fi
    
    PIDS+=($pid)
    echo $pid > "$PROJECT_ROOT/web.pid"
    log_info "Frontend process started successfully (PID: $pid)"
    
    # Wait for frontend to be ready
    if wait_for_service "Frontend" "http://localhost:$WEB_PORT" "$STARTUP_TIMEOUT"; then
        log_service "Frontend" "Frontend is running at http://localhost:$WEB_PORT"
    else
        log_error "Frontend failed to start. Check logs at: $LOG_DIR/web.log"
        tail -20 "$LOG_DIR/web.log"
        exit 1
    fi
}

# Display status dashboard
display_status() {
    print_header "TypeAmp Development Environment Ready! 🚀"
    
    echo -e "${GREEN}All services are running successfully!${NC}"
    echo ""
    echo "📍 Service URLs:"
    echo -e "  Frontend:    ${CYAN}http://localhost:$WEB_PORT${NC}"
    echo -e "  Backend API: ${CYAN}http://localhost:$API_PORT${NC}"
    echo -e "  API Health:  ${CYAN}http://localhost:$API_PORT/health${NC}"
    echo ""
    echo "📊 Service Status:"
    echo -e "  Database:    ${GREEN}✅ Connected${NC}"
    echo -e "  Backend API: ${GREEN}✅ Running${NC} (PID: $(cat $PROJECT_ROOT/api.pid 2>/dev/null || echo 'N/A'))"
    echo -e "  Frontend:    ${GREEN}✅ Running${NC} (PID: $(cat $PROJECT_ROOT/web.pid 2>/dev/null || echo 'N/A'))"
    echo ""
    echo "📝 Logs:"
    echo -e "  API logs:    ${BLUE}$LOG_DIR/api.log${NC}"
    echo -e "  Web logs:    ${BLUE}$LOG_DIR/web.log${NC}"
    echo ""
    echo "🛠️  Useful Commands:"
    echo "  npm run dev:health  - Check service health"
    echo "  npm run dev:reset   - Reset and restart everything"
    echo "  npm run db:studio   - Open Prisma Studio"
    echo "  Ctrl+C              - Stop all services"
    echo ""
    echo -e "${YELLOW}Services are running. Press Ctrl+C to stop.${NC}"
}

# Monitor services
monitor_services() {
    log_info "Starting service monitoring (checking every 30 seconds)..."
    
    while true; do
        sleep 30
        
        # Check API health with timeout and restart logic
        if ! curl -s -f --max-time 10 "http://localhost:$API_PORT/health" >/dev/null 2>&1; then
            local restart_count=${RESTART_COUNTS[api]:-0}
            
            if [ $restart_count -lt $MAX_RESTART_ATTEMPTS ]; then
                RESTART_COUNTS[api]=$((restart_count + 1))
                log_error "Backend API has stopped responding! (Restart attempt ${RESTART_COUNTS[api]}/$MAX_RESTART_ATTEMPTS)"
                
                # Exponential backoff
                local delay=$((${RESTART_COUNTS[api]} * 10))
                log_info "Waiting ${delay}s before restart attempt..."
                sleep $delay
                
                log_info "Attempting to restart API..."
                if start_backend; then
                    log_success "API restart successful"
                    RESTART_COUNTS[api]=0  # Reset counter on successful restart
                else
                    log_error "API restart failed"
                fi
            else
                log_error "API has failed $MAX_RESTART_ATTEMPTS times, giving up"
                log_error "Check API logs: $LOG_DIR/api.log"
                exit 1
            fi
        else
            # Reset restart counter if service is healthy
            RESTART_COUNTS[api]=0
        fi
        
        # Check Frontend health with timeout and restart logic
        if ! curl -s -f --max-time 10 "http://localhost:$WEB_PORT" >/dev/null 2>&1; then
            local restart_count=${RESTART_COUNTS[frontend]:-0}
            
            if [ $restart_count -lt $MAX_RESTART_ATTEMPTS ]; then
                RESTART_COUNTS[frontend]=$((restart_count + 1))
                log_error "Frontend has stopped responding! (Restart attempt ${RESTART_COUNTS[frontend]}/$MAX_RESTART_ATTEMPTS)"
                
                # Exponential backoff
                local delay=$((${RESTART_COUNTS[frontend]} * 10))
                log_info "Waiting ${delay}s before restart attempt..."
                sleep $delay
                
                log_info "Attempting to restart Frontend..."
                if start_frontend; then
                    log_success "Frontend restart successful"
                    RESTART_COUNTS[frontend]=0  # Reset counter on successful restart
                else
                    log_error "Frontend restart failed"
                fi
            else
                log_error "Frontend has failed $MAX_RESTART_ATTEMPTS times, giving up"
                log_error "Check Frontend logs: $LOG_DIR/web.log"
                exit 1
            fi
        else
            # Reset restart counter if service is healthy
            RESTART_COUNTS[frontend]=0
        fi
        
        # Show status update every 5 minutes (10 cycles)
        if [ $(($(date +%s) % 300)) -lt 30 ]; then
            log_info "Services monitoring: API ✅ Frontend ✅"
        fi
    done
}

# Main startup flow
main() {
    print_header "TypeAmp Development Environment Startup"
    
    # Change to project root
    cd "$PROJECT_ROOT"
    
    # Run checks
    check_environment
    check_database
    
    # Start services
    start_backend
    start_frontend
    
    # Display status
    display_status
    
    # Monitor services (this will run until interrupted)
    monitor_services
}

# Run main function
main "$@"