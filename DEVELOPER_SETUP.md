# TypeAmp Developer Setup Guide

Welcome to TypeAmp! This guide will help you set up your development environment quickly and efficiently.

## 🚀 Quick Start (New Developers)

If you're new to the project, run these two commands to get started:

```bash
# One-time setup (run this once)
npm run dev:setup

# Daily development startup (run this every day)
npm run dev:full
```

That's it! Your development environment should now be running at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8081

## 📋 Prerequisites

Before running the setup, ensure you have:

### Required Software
- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)  
- **PostgreSQL** 13.x or higher ([Download](https://www.postgresql.org/download/))
  - TypeAmp uses PostgreSQL as its primary database
  - SQLite is no longer supported

### System-Specific Installation

#### macOS
```bash
# Using Homebrew (recommended)
brew install node postgresql
brew services start postgresql
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install nodejs npm postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Windows
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
3. Install both and ensure they're added to your PATH

## 🛠️ Available Commands

### Setup Commands
- `npm run dev:setup` - Initial environment setup (run once)
- `npm run dev:full` - Start complete development environment
- `npm run dev:health` - Check if all services are healthy
- `npm run dev:reset` - Clean reset of entire environment

### Database Commands
- `npm run db:studio` - Open Prisma Studio (database GUI)
- Database management is handled automatically by setup scripts

### Troubleshooting
- `npm run troubleshoot` - Interactive troubleshooting menu
- `npm run troubleshoot auto` - Auto-detect and suggest fixes
- `npm run troubleshoot auto-fix` - Auto-detect and fix issues automatically
- `npm run troubleshoot ports` - Fix port conflicts
- `npm run troubleshoot database` - Fix database issues
- `npm run troubleshoot deps` - Fix dependency problems
- `npm run troubleshoot env` - Fix environment configuration
- `npm run troubleshoot reset` - Clean reset (nuclear option)

## 🔧 Detailed Setup Process

### 1. Initial Setup (`npm run dev:setup`)

This command performs:
- ✅ Validates Node.js and npm versions
- ✅ Checks PostgreSQL installation and starts if needed
- ✅ Creates PostgreSQL user `typeamp_user` with proper privileges
- ✅ Creates `typeamp_dev` and `typeamp_test` databases
- ✅ Creates environment configuration files with PostgreSQL URLs
- ✅ Installs all dependencies
- ✅ Generates Prisma client for PostgreSQL
- ✅ Runs database migrations to PostgreSQL
- ✅ Seeds database with realistic test data

### 2. Daily Startup (`npm run dev:full`)

This command:
- ✅ Validates environment configuration
- ✅ Checks PostgreSQL connectivity with retry logic
- ✅ Clears port conflicts automatically
- ✅ Starts backend API server (port 8081)
- ✅ Starts frontend dev server (port 3000)
- ✅ Waits for services to be ready (up to 2 minutes)
- ✅ Monitors services and auto-restarts if needed (max 3 attempts)
- ✅ Provides real-time status updates
- ✅ Graceful shutdown on Ctrl+C

## 📁 Project Structure

```
typeamp/
├── packages/
│   ├── web/          # Next.js frontend
│   └── api/          # Node.js/Fastify backend
├── scripts/          # Development automation scripts
├── logs/             # Service logs (auto-created)
├── .env              # Environment variables
└── package.json      # Root workspace configuration
```

## 🌍 Environment Variables

The setup script automatically creates these files:

### Root `.env`
```env
NODE_ENV=development
DATABASE_URL=postgresql://typeamp_user:typeamp_dev_pass@localhost:5432/typeamp_dev
TEST_DATABASE_URL=postgresql://typeamp_user:typeamp_dev_pass@localhost:5432/typeamp_test
API_PORT=8081
JWT_SECRET=dev-secret-key-change-in-production
NEXT_PUBLIC_API_URL=http://localhost:8081
```

### `packages/api/.env`
```env
DATABASE_URL=postgresql://typeamp_user:typeamp_dev_pass@localhost:5432/typeamp_dev
JWT_SECRET=dev-secret-key-change-in-production
API_PORT=8081
```

### `packages/web/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8081
NEXT_PUBLIC_ENVIRONMENT=development
```

## 🔍 Health Checks

Run `npm run dev:health` to verify everything is working:

```bash
✓ PostgreSQL service running
✓ Database connection successful (typeamp_dev)
✓ API Health Endpoint responding (< 50ms)
✓ Frontend server responding
✓ All processes running
✓ Ports available
✓ System resources sufficient
```

## 🤖 Automatic Issue Detection

TypeAmp includes smart troubleshooting that can automatically detect and fix common issues:

```bash
# Automatically detect issues and suggest fixes
npm run troubleshoot auto

# Automatically detect and fix issues without prompting
npm run troubleshoot auto-fix
```

The auto-detection checks for:
- ✅ Stale Node.js processes on development ports
- ✅ PostgreSQL service status and connectivity
- ✅ Missing environment configuration files
- ✅ Missing dependencies or Prisma client
- ✅ Database table existence and migrations

## 🚨 Common Issues & Solutions

### Issue: Port Already in Use
```bash
# Automatic fix
npm run troubleshoot ports

# Manual fix
lsof -ti:3000 | xargs kill  # Kill process on port 3000
lsof -ti:8081 | xargs kill  # Kill process on port 8081
```

### Issue: PostgreSQL Connection Failed
```bash
# Automatic fix
npm run troubleshoot database

# Manual verification
pg_isready -h localhost -p 5432
sudo systemctl start postgresql

# Test connection
PGPASSWORD='typeamp_dev_pass' psql -h localhost -U typeamp_user -d typeamp_dev -c "SELECT 1;"
```

### Issue: Dependencies Out of Sync
```bash
# Automatic fix
npm run troubleshoot deps

# Manual fix
rm -rf node_modules package-lock.json
npm install
```

### Issue: Environment Variables Missing
```bash
# Automatic fix
npm run troubleshoot env

# Manual fix - delete and re-run setup
rm .env packages/api/.env packages/web/.env.local
npm run dev:setup
```

### Issue: PostgreSQL Authentication Errors
```bash
# Reset PostgreSQL user and databases
sudo -u postgres psql -c "DROP USER IF EXISTS typeamp_user;"
sudo -u postgres dropdb typeamp_dev typeamp_test 2>/dev/null || true

# Re-run setup to recreate everything
npm run dev:setup
```

### Issue: Database Schema Out of Sync
```bash
# Reset and regenerate schema
npm run db:push --workspace=@typeamp/api
npm run seed --workspace=@typeamp/api
```

## 🔄 Daily Workflow

### Starting Development
```bash
npm run dev:full
```

### Checking Status
```bash
npm run dev:health
```

### When Things Go Wrong
```bash
# Try automatic detection and fixes first
npm run troubleshoot auto-fix

# Or use interactive troubleshooting
npm run troubleshoot
```

### Clean Reset (Nuclear Option)
```bash
npm run dev:reset
npm run dev:setup
```

## 📊 Service Monitoring

When running `npm run dev:full`, you'll see:

```
🚀 TypeAmp Development Environment Ready!

📍 Service URLs:
  Frontend:    http://localhost:3000
  Backend API: http://localhost:8081
  API Health:  http://localhost:8081/health

📊 Service Status:
  PostgreSQL:  ✅ Running (Port: 5432)
  Database:    ✅ Connected (typeamp_dev)
  Backend API: ✅ Running (PID: 12345)
  Frontend:    ✅ Running (PID: 12346)

📝 Logs:
  API logs:    logs/api.log
  Web logs:    logs/web.log
```

## 🧪 Testing

### Frontend Tests
```bash
cd packages/web
npm run test
```

### Backend Tests
```bash
cd packages/api
npm run test
```

### E2E Tests
```bash
cd packages/web
npm run test:e2e
```

## 🎯 API Endpoints

Once running, you can test these endpoints:

- `GET http://localhost:8081/health` - API health check
- `GET http://localhost:8081/api/words` - Get word list
- `GET http://localhost:3000` - Frontend application

## 🛟 Getting Help

### Automated Help
- `npm run troubleshoot auto-fix` - Automatic issue detection and repair
- `npm run dev:health` - Diagnose current status  
- `npm run troubleshoot` - Interactive problem solving
- Check logs in `logs/api.log` and `logs/web.log`

### Manual Investigation
```bash
# Check running processes
ps aux | grep -E "(node|tsx|next)"

# Check ports
lsof -i :3000,8081,5432

# Check PostgreSQL database
PGPASSWORD='typeamp_dev_pass' psql -U typeamp_user -d typeamp_dev -h localhost
```

## 🎉 Success Indicators

You'll know everything is working when:

1. ✅ `npm run dev:setup` completes without errors
2. ✅ `npm run dev:full` shows all services as running
3. ✅ http://localhost:3000 loads the TypeAmp interface
4. ✅ http://localhost:8081/health returns `{"status": "ok"}`
5. ✅ `npm run dev:health` passes all checks

## 📞 Support

If you encounter issues not covered here:

1. First, try `npm run troubleshoot auto-fix` for fully automated fixes
2. Use `npm run troubleshoot auto` for guided issue detection
3. Try `npm run troubleshoot` for interactive problem solving
4. Check the [troubleshooting script](scripts/troubleshoot.sh) for advanced options
5. Review recent logs in the `logs/` directory
6. Ask the team for help with specific error messages

---

**Happy coding! 🚀**