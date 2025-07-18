#!/bin/bash

# TypeAmp Health Check Script
# This script validates that all services are running correctly

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
API_PORT=8081
WEB_PORT=3000
DB_HOST=localhost
DB_PORT=5432
MAX_RESPONSE_TIME=5000  # milliseconds

# Status tracking
OVERALL_STATUS=0

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
    OVERALL_STATUS=1
}

print_header() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
}

# Check service with detailed info
check_service() {
    local name=$1
    local url=$2
    local expected_response=$3
    
    echo -n "Checking $name... "
    
    # Make request and capture response
    local response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null || echo "000")
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        if [ -n "$expected_response" ] && [[ "$body" == *"$expected_response"* ]]; then
            log_success "$name is healthy"
            return 0
        elif [ -z "$expected_response" ]; then
            log_success "$name is responding"
            return 0
        else
            log_warning "$name is responding but response doesn't match expected"
            return 1
        fi
    else
        log_error "$name is not responding (HTTP $http_code)"
        return 1
    fi
}

# Check database connection
check_database() {
    print_header "Database Health Check"
    
    echo -n "Checking PostgreSQL service... "
    if pg_isready -h "$DB_HOST" -p "$DB_PORT" -q; then
        log_success "PostgreSQL is running"
    else
        log_error "PostgreSQL is not running"
        return 1
    fi
    
    echo -n "Checking database connection... "
    if [ -f ".env" ]; then
        set -a
        source .env
        set +a
    fi
    
    if PGPASSWORD="${DATABASE_PASSWORD:-typeamp_dev_pass}" psql -h "$DB_HOST" -U "${DATABASE_USER:-typeamp_user}" -d "${DATABASE_NAME:-typeamp_dev}" -c "SELECT 1" >/dev/null 2>&1; then
        log_success "Database connection successful"
    else
        log_error "Cannot connect to database"
        return 1
    fi
    
    echo -n "Checking database tables... "
    local table_count=$(PGPASSWORD="${DATABASE_PASSWORD:-typeamp_dev_pass}" psql -h "$DB_HOST" -U "${DATABASE_USER:-typeamp_user}" -d "${DATABASE_NAME:-typeamp_dev}" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'" 2>/dev/null | xargs)
    
    if [ "$table_count" -gt 0 ]; then
        log_success "Found $table_count tables in database"
    else
        log_error "No tables found in database (migrations may not have run)"
        return 1
    fi
}

# Check backend API
check_backend() {
    print_header "Backend API Health Check"
    
    check_service "API Health Endpoint" "http://localhost:$API_PORT/health" "ok"
    
    echo -n "Checking API response time... "
    local start_time=$(date +%s%N)
    curl -s --max-time 5 "http://localhost:$API_PORT/health" >/dev/null 2>&1
    local curl_exit_code=$?
    local end_time=$(date +%s%N)
    local response_time=$(( (end_time - start_time) / 1000000 ))
    
    if [ $curl_exit_code -ne 0 ]; then
        log_error "API request failed (curl exit code: $curl_exit_code)"
        return 1
    fi
    
    if [ $response_time -lt 100 ]; then
        log_success "API response time: ${response_time}ms (Excellent)"
    elif [ $response_time -lt 500 ]; then
        log_warning "API response time: ${response_time}ms (Acceptable)"
    else
        log_error "API response time: ${response_time}ms (Too slow)"
    fi
    
    # Check specific API endpoints
    check_service "Words API" "http://localhost:$API_PORT/api/words" "words"
}

# Check frontend
check_frontend() {
    print_header "Frontend Health Check"
    
    check_service "Frontend Server" "http://localhost:$WEB_PORT" ""
    
    echo -n "Checking frontend build status... "
    if [ -d "packages/web/.next" ]; then
        log_success "Next.js build directory exists"
    else
        log_warning "Next.js build directory not found (may still be building)"
    fi
    
    echo -n "Checking API connectivity from frontend... "
    # This would ideally check if the frontend can reach the API
    # For now, we'll just verify the environment variable is set
    if [ -f "packages/web/.env.local" ] && grep -q "NEXT_PUBLIC_API_URL" "packages/web/.env.local"; then
        log_success "API URL is configured"
    else
        log_error "API URL is not configured in frontend"
    fi
}

# Check processes
check_processes() {
    print_header "Process Health Check"
    
    echo -n "Checking API process... "
    if [ -f "api.pid" ] && kill -0 $(cat api.pid) 2>/dev/null; then
        log_success "API process is running (PID: $(cat api.pid))"
    else
        log_error "API process is not running"
    fi
    
    echo -n "Checking Frontend process... "
    if [ -f "web.pid" ] && kill -0 $(cat web.pid) 2>/dev/null; then
        log_success "Frontend process is running (PID: $(cat web.pid))"
    else
        log_error "Frontend process is not running"
    fi
}

# Check ports
check_ports() {
    print_header "Port Availability Check"
    
    local ports=("$API_PORT:API" "$WEB_PORT:Frontend" "$DB_PORT:PostgreSQL")
    
    for port_info in "${ports[@]}"; do
        local port="${port_info%%:*}"
        local service="${port_info#*:}"
        
        echo -n "Checking port $port ($service)... "
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            log_success "Port $port is in use by $service"
        else
            log_error "Port $port is not in use (service may be down)"
        fi
    done
}

# Check system resources
check_resources() {
    print_header "System Resources Check"
    
    # Check memory usage
    echo -n "Checking memory usage... "
    local mem_usage=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
    if [ "$mem_usage" -lt 80 ]; then
        log_success "Memory usage: ${mem_usage}%"
    elif [ "$mem_usage" -lt 90 ]; then
        log_warning "Memory usage: ${mem_usage}% (High)"
    else
        log_error "Memory usage: ${mem_usage}% (Critical)"
    fi
    
    # Check disk space
    echo -n "Checking disk space... "
    local disk_usage=$(df -h . | awk 'NR==2 {print int($5)}')
    if [ "$disk_usage" -lt 80 ]; then
        log_success "Disk usage: ${disk_usage}%"
    elif [ "$disk_usage" -lt 90 ]; then
        log_warning "Disk usage: ${disk_usage}% (High)"
    else
        log_error "Disk usage: ${disk_usage}% (Critical)"
    fi
}

# Performance test
run_performance_test() {
    print_header "Performance Test"
    
    log_info "Running basic performance test..."
    
    # Test API endpoint performance
    echo -n "Testing API performance (10 requests)... "
    local total_time=0
    for i in {1..10}; do
        local start_time=$(date +%s%N)
        if curl -s --max-time 10 "http://localhost:$API_PORT/api/words" >/dev/null 2>&1; then
            local end_time=$(date +%s%N)
            local request_time=$(( (end_time - start_time) / 1000000 ))
            total_time=$((total_time + request_time))
        else
            log_error "Performance test failed on request $i"
            return 1
        fi
    done
    local avg_time=$((total_time / 10))
    
    if [ $avg_time -lt 50 ]; then
        log_success "Average API response time: ${avg_time}ms (Excellent)"
    elif [ $avg_time -lt 200 ]; then
        log_warning "Average API response time: ${avg_time}ms (Acceptable)"
    else
        log_error "Average API response time: ${avg_time}ms (Too slow)"
    fi
}

# Display summary
display_summary() {
    print_header "Health Check Summary"
    
    if [ $OVERALL_STATUS -eq 0 ]; then
        echo -e "${GREEN}✅ All health checks passed!${NC}"
        echo ""
        echo "Your TypeAmp development environment is healthy and ready for use."
    else
        echo -e "${RED}❌ Some health checks failed!${NC}"
        echo ""
        echo "Please review the errors above and take corrective action."
        echo ""
        echo "Common fixes:"
        echo "  - Database not running: Start PostgreSQL"
        echo "  - Services not running: Run 'npm run dev:full'"
        echo "  - Port conflicts: Kill processes on conflicting ports"
        echo "  - Missing dependencies: Run 'npm run dev:setup'"
    fi
    
    echo ""
    echo "For detailed logs, check:"
    echo "  - API logs: logs/api.log"
    echo "  - Frontend logs: logs/web.log"
}

# Main health check flow
main() {
    print_header "TypeAmp Health Check"
    
    # Run all health checks
    check_database
    check_backend
    check_frontend
    check_processes
    check_ports
    check_resources
    
    # Optional performance test
    if [ "${1:-}" = "--performance" ]; then
        run_performance_test
    fi
    
    # Display summary
    display_summary
    
    exit $OVERALL_STATUS
}

# Run main function
main "$@"