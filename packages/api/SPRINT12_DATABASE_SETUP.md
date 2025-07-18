# Sprint 12: Database Seeding & Production Data - Setup Guide

## 🎯 Overview

Sprint 12 implements a comprehensive database seeding system for TypeAmp, providing realistic fake data for development and testing, along with production-ready database configurations and management utilities.

## 📦 What's Included

### 1. Database Seeding System
- **Realistic User Personas**: 5 skill levels (beginner → professional) with weighted distributions
- **Skill Progression**: Test results show realistic improvement over time
- **Temporal Patterns**: Clustered sessions, weekend/weekday patterns
- **User Settings**: Skill-appropriate preferences and themes
- **Configurable Datasets**: Minimal (10 users), Development (100 users), Production (500 users)

### 2. Production Database Configuration
- **PostgreSQL Optimization**: Connection pooling, performance tuning
- **Monitoring Queries**: Performance analysis, slow query detection
- **Environment Templates**: Complete .env configuration examples
- **Backup Scripts**: Automated backup generation and scheduling

### 3. Database Management Utilities
- **Backup & Restore**: Automated database backup with compression
- **Performance Analysis**: Table statistics, index usage, query performance
- **Database Optimization**: Vacuum, analyze, and maintenance operations
- **Migration Management**: Safe deployment and schema validation

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd packages/api
npm install
```

### 2. Generate Prisma Client
```bash
npm run generate
```

### 3. Seed Development Database
```bash
# Minimal dataset (10 users, 30 days history)
npm run seed:minimal

# Development dataset (100 users, 180 days history)
npm run seed

# Production dataset (500 users, 365 days history)
npm run seed:production
```

### 4. Explore Your Data
```bash
# Open Prisma Studio to browse seeded data
npm run db:studio

# Analyze database performance
npm run db:analyze

# Create backup
npm run db:backup
```

## 📊 Seeding System Details

### User Skill Distribution
- **Beginners (30%)**: 15-35 WPM, 85-95% accuracy, basic preferences
- **Intermediate (35%)**: 30-55 WPM, 90-97% accuracy, mixed modes
- **Advanced (25%)**: 50-85 WPM, 94-98.5% accuracy, all modes/difficulties
- **Expert (8%)**: 80-120 WPM, 96-99.2% accuracy, advanced settings
- **Professional (2%)**: 100-150 WPM, 98-99.8% accuracy, optimized setups

### Realistic Data Features
- **Skill Progression**: Mathematical curves showing improvement over time
- **Session Clustering**: Users often do multiple tests in one session
- **Usage Patterns**: More tests on weekdays, realistic time distributions
- **Setting Preferences**: Advanced users prefer dark themes, pace carets
- **Error Patterns**: Speed/accuracy tradeoffs, consistency metrics

### Generated Statistics
```bash
# Example output from npm run seed:minimal
👥 Users: 10
📊 Test Results: 272
⚙️ User Settings: 10

🏆 Sample Users:
1. user1@example.com: Best 89 WPM
2. user2@example.com: Best 45 WPM
3. user3@example.com: Best 125 WPM
```

## 🔧 Database Management

### Available Commands

```bash
# Database Operations
npm run db:push          # Push schema changes to database
npm run db:reset         # Reset database (⚠️ destroys data)
npm run db:studio        # Open Prisma Studio

# Backup & Restore
npm run db:backup        # Create compressed backup
npm run db:restore       # Restore from backup (requires path)

# Performance & Maintenance
npm run db:analyze       # Analyze database performance
npm run db:vacuum        # Optimize database
npm run db:migrate       # Run pending migrations

# Seeding
npm run seed:minimal     # 10 users, 30 days
npm run seed            # 100 users, 180 days
npm run seed:production  # 500 users, 365 days
```

### Backup System

Automatic backups are created with:
- **Timestamp**: `typeamp-backup-2025-07-05T21-50-12-543Z.db.gz`
- **Compression**: Gzip compression for space efficiency
- **Location**: `./backups/` directory
- **Retention**: Configurable cleanup of old backups

### Performance Analysis

The analysis tool provides:
- **Database Size**: Total storage usage
- **Table Statistics**: Row counts and estimated sizes
- **Index Usage**: Effectiveness and usage patterns
- **Performance Metrics**: Query statistics and slow query detection

Example output:
```
📊 Database Analysis Report
===========================
Database Size: 100 KB

📋 Table Statistics:
  Users: 10 rows (1.95 KB)
  TestResults: 272 rows (39.84 KB)
  UserSettings: 10 rows (1000 Bytes)

📈 Index Usage:
  Users.Users_email_key: 100 uses (High)
  TestResults.TestResults_userId_fkey: 500 uses (High)
```

## 🏗️ Production Configuration

### Environment Setup

Create `.env.production` with:

```env
# Database Connection
DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"
DB_HOST="your-postgres-host"
DB_PORT="5432"
DB_NAME="typeamp_production"
DB_USER="typeamp_user"
DB_PASSWORD="your-secure-password"
DB_SSL="true"

# Connection Pool Settings
DB_POOL_MIN="5"
DB_POOL_MAX="20"
DB_CONNECTION_TIMEOUT="30000"
DB_IDLE_TIMEOUT="600000"

# Performance Settings
DB_STATEMENT_TIMEOUT="30000"
DB_QUERY_TIMEOUT="15000"

# Monitoring
DB_LOG_SLOW_QUERIES="true"
DB_SLOW_QUERY_THRESHOLD="1000"

# Backup Settings
DB_BACKUP_RETENTION="30"
DB_BACKUP_SCHEDULE="0 2 * * *"
BACKUP_DIR="/var/backups/typeamp"
```

### PostgreSQL Optimizations

For production deployment, configure PostgreSQL with:

```sql
-- Connection settings
max_connections = 200;
shared_buffers = '256MB';
effective_cache_size = '1GB';

-- Performance tuning
work_mem = '4MB';
random_page_cost = 1.1;
effective_io_concurrency = 200;

-- Logging
log_min_duration_statement = 1000;
log_statement = 'mod';
```

### Enhanced Schema

The production schema (`schema.enhanced.prisma`) includes:
- **Additional User Fields**: Display name, timezone, skill metrics
- **Enhanced Test Results**: Detailed performance metrics, error analysis
- **Achievement System**: Gamification with progress tracking
- **Analytics Tables**: Daily statistics, word list usage
- **Performance Indexes**: Optimized for common queries

## 📈 Data Quality Features

### Realistic User Behavior
- **Progression Curves**: Users improve at realistic rates based on skill level
- **Session Patterns**: Multiple tests clustered in time, realistic gaps
- **Preference Alignment**: Settings match user skill and experience level
- **Error Modeling**: Speed/accuracy tradeoffs, learning curves

### Statistical Accuracy
- **Skill Distribution**: Based on real typing skill demographics
- **Improvement Rates**: Realistic learning progression (15% → 2% per test)
- **Usage Patterns**: Weekend dips, daily active hours (9 AM - 11 PM)
- **Equipment Preferences**: Advanced users prefer specific themes/settings

### Data Integrity
- **Foreign Key Consistency**: All relationships properly maintained
- **Temporal Logic**: Test timestamps respect user join dates
- **Statistical Coherence**: Averages, bests, and totals align properly
- **Realistic Constraints**: No impossible speeds or perfect scores

## 🔍 Schema Evolution

### Current Schema (Basic)
```sql
Users: id, email, passwordHash, createdAt
TestResults: id, userId, wpm, accuracy, rawWpm, consistency, config, tags, timestamp
UserSettings: userId, theme, caretStyle, paceCaretWpm
```

### Enhanced Schema (Production Ready)
```sql
Users: + displayName, avatar, timezone, language, totalTests, averageWpm, bestWpm
TestResults: + mode, duration, totalChars, correctChars, errorRate, actualTime
UserSettings: + fontSize, soundEnabled, blindMode, punctuationPreference
Achievements: id, name, description, icon, category, condition, points
UserAchievements: userId, achievementId, unlockedAt, progress
WordListStats: listName, totalWords, avgDifficulty, usage, lastUsed
DailyStats: date, totalUsers, totalTests, avgWpm, avgAccuracy, newUsers
```

## 🛠️ Development Workflow

### 1. Local Development
```bash
# Start with clean database
npm run db:reset

# Generate Prisma client
npm run generate

# Seed with development data
npm run seed

# Start development server
npm run dev

# Open Prisma Studio to explore data
npm run db:studio
```

### 2. Testing
```bash
# Use minimal dataset for testing
npm run seed:minimal

# Run tests
npm run test

# Clean up
npm run db:reset
```

### 3. Production Preparation
```bash
# Generate production-scale data
npm run seed:production

# Analyze performance
npm run db:analyze

# Create backup before deployment
npm run db:backup

# Optimize database
npm run db:vacuum
```

## 📚 File Structure

```
src/database/
├── seed.ts                 # Main seeding orchestrator
├── seedData.ts            # Data generation utilities
├── management.ts          # Backup, restore, analysis tools
├── production.config.ts   # Production configuration
└── README.md             # This documentation

Generated during seeding:
backups/                   # Database backups
├── typeamp-backup-*.db.gz # Compressed backup files
└── ...
```

## ⚡ Performance Characteristics

### Seeding Performance
- **Minimal (10 users)**: ~2-3 seconds, ~270 test results
- **Development (100 users)**: ~15-20 seconds, ~2,700 test results  
- **Production (500 users)**: ~60-90 seconds, ~13,500 test results

### Database Sizes
- **Minimal**: ~100 KB
- **Development**: ~1 MB
- **Production**: ~5-10 MB

### Memory Usage
- **Seeding Process**: <100 MB RAM during generation
- **Runtime Queries**: Optimized with proper indexes
- **Backup Operations**: Minimal memory footprint

## 🔐 Security Considerations

### Data Safety
- **Default Passwords**: All seeded users have password `password123`
- **Email Uniqueness**: Faker.js ensures unique email generation
- **No Real Data**: All generated data is completely synthetic
- **Backup Encryption**: Consider encrypting backups for production

### Production Hardening
- **Password Hashing**: bcrypt with configurable rounds
- **Connection Security**: SSL/TLS for database connections
- **Input Validation**: Sanitized data generation
- **Backup Security**: Secure backup storage and retention

## 🎯 Sprint 12 Completion

✅ **Database Seeding System**: Comprehensive fake data generation  
✅ **Production Configuration**: PostgreSQL optimization and monitoring  
✅ **Management Utilities**: Backup, restore, and analysis tools  
✅ **Performance Indexes**: Query optimization for common patterns  
✅ **Documentation**: Complete setup and usage guides  

**Sprint 12 delivers a production-ready database infrastructure** with realistic test data, automated management tools, and scalable configuration options for TypeAmp's continued development and deployment.

---

*TypeAmp Database Seeding & Production Data - Sprint 12*  
*🚀 Ready for Development, Testing, and Production Deployment*