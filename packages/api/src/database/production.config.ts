/**
 * Production Database Configuration
 * 
 * This file contains configuration and utilities for production database setup,
 * including PostgreSQL optimization, connection pooling, and monitoring.
 */

export interface ProductionDatabaseConfig {
  // Database connection
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  
  // Connection pooling
  connectionPoolMin: number;
  connectionPoolMax: number;
  connectionTimeoutMs: number;
  idleTimeoutMs: number;
  
  // Performance optimization
  statementTimeoutMs: number;
  queryTimeoutMs: number;
  
  // Monitoring and logging
  logSlowQueries: boolean;
  slowQueryThresholdMs: number;
  enableQueryLogging: boolean;
  
  // Backup configuration
  backupRetentionDays: number;
  backupSchedule: string; // Cron format
  
  // Migration settings
  migrationsTableName: string;
  runMigrationsOnStartup: boolean;
}

/**
 * Default production configuration
 */
export const DEFAULT_PRODUCTION_CONFIG: ProductionDatabaseConfig = {
  // Database connection (should be overridden by environment variables)
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'typeamp_production',
  username: process.env.DB_USER || 'typeamp',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.DB_SSL === 'true',
  
  // Connection pooling - optimized for high concurrency
  connectionPoolMin: parseInt(process.env.DB_POOL_MIN || '5'),
  connectionPoolMax: parseInt(process.env.DB_POOL_MAX || '20'),
  connectionTimeoutMs: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
  idleTimeoutMs: parseInt(process.env.DB_IDLE_TIMEOUT || '600000'), // 10 minutes
  
  // Performance optimization
  statementTimeoutMs: parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000'),
  queryTimeoutMs: parseInt(process.env.DB_QUERY_TIMEOUT || '15000'),
  
  // Monitoring and logging
  logSlowQueries: process.env.DB_LOG_SLOW_QUERIES === 'true',
  slowQueryThresholdMs: parseInt(process.env.DB_SLOW_QUERY_THRESHOLD || '1000'),
  enableQueryLogging: process.env.NODE_ENV === 'development',
  
  // Backup configuration
  backupRetentionDays: parseInt(process.env.DB_BACKUP_RETENTION || '30'),
  backupSchedule: process.env.DB_BACKUP_SCHEDULE || '0 2 * * *', // Daily at 2 AM
  
  // Migration settings
  migrationsTableName: '_prisma_migrations',
  runMigrationsOnStartup: process.env.DB_AUTO_MIGRATE === 'true'
};

/**
 * Generate PostgreSQL connection URL for Prisma
 */
export function generateDatabaseUrl(config: ProductionDatabaseConfig): string {
  const sslParam = config.ssl ? '?sslmode=require' : '';
  return `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}${sslParam}`;
}

/**
 * Database connection validation
 */
export function validateDatabaseConfig(config: ProductionDatabaseConfig): void {
  const errors: string[] = [];
  
  if (!config.host) errors.push('Database host is required');
  if (!config.database) errors.push('Database name is required');
  if (!config.username) errors.push('Database username is required');
  if (!config.password) errors.push('Database password is required');
  
  if (config.connectionPoolMax < config.connectionPoolMin) {
    errors.push('Connection pool max must be greater than or equal to min');
  }
  
  if (config.connectionPoolMin < 1) {
    errors.push('Connection pool min must be at least 1');
  }
  
  if (config.connectionPoolMax > 100) {
    errors.push('Connection pool max should not exceed 100 for most use cases');
  }
  
  if (errors.length > 0) {
    throw new Error(`Database configuration validation failed:\n${errors.join('\n')}`);
  }
}

/**
 * PostgreSQL performance optimization settings
 */
export const POSTGRESQL_OPTIMIZATIONS = {
  // Connection settings
  max_connections: '200',
  shared_buffers: '256MB',
  effective_cache_size: '1GB',
  maintenance_work_mem: '64MB',
  
  // Query optimization
  work_mem: '4MB',
  random_page_cost: '1.1',
  effective_io_concurrency: '200',
  
  // WAL settings for performance
  wal_buffers: '16MB',
  checkpoint_completion_target: '0.9',
  checkpoint_timeout: '15min',
  
  // Logging
  log_min_duration_statement: '1000', // Log queries > 1 second
  log_statement: 'mod', // Log modifications
  log_line_prefix: '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ',
  
  // Monitoring
  track_activities: 'on',
  track_counts: 'on',
  track_io_timing: 'on',
  track_functions: 'all',
  
  // Memory settings
  temp_buffers: '8MB',
  max_prepared_transactions: '0',
  
  // Auto vacuum settings
  autovacuum: 'on',
  autovacuum_max_workers: '3',
  autovacuum_naptime: '1min'
};

/**
 * Database monitoring queries
 */
export const MONITORING_QUERIES = {
  // Connection monitoring
  activeConnections: `
    SELECT 
      count(*) as total_connections,
      count(*) FILTER (WHERE state = 'active') as active_connections,
      count(*) FILTER (WHERE state = 'idle') as idle_connections
    FROM pg_stat_activity 
    WHERE datname = current_database();
  `,
  
  // Query performance
  slowQueries: `
    SELECT 
      query,
      calls,
      total_time,
      mean_time,
      min_time,
      max_time,
      rows
    FROM pg_stat_statements 
    WHERE mean_time > 1000 
    ORDER BY mean_time DESC 
    LIMIT 10;
  `,
  
  // Database size
  databaseSize: `
    SELECT 
      pg_size_pretty(pg_database_size(current_database())) as database_size;
  `,
  
  // Table sizes
  tableSizes: `
    SELECT 
      schemaname,
      tablename,
      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
      pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY size_bytes DESC;
  `,
  
  // Index usage
  indexUsage: `
    SELECT 
      schemaname,
      tablename,
      indexname,
      idx_tup_read,
      idx_tup_fetch,
      pg_size_pretty(pg_relation_size(indexrelid)) as index_size
    FROM pg_stat_user_indexes 
    ORDER BY idx_tup_read DESC;
  `
};

/**
 * Backup script generator
 */
export function generateBackupScript(config: ProductionDatabaseConfig): string {
  const timestamp = '$(date +%Y%m%d_%H%M%S)';
  const backupFile = `typeamp_backup_${timestamp}.sql`;
  const backupDir = process.env.BACKUP_DIR || '/var/backups/typeamp';
  
  return `#!/bin/bash
# TypeAmp Database Backup Script
# Generated automatically - do not edit manually

set -e

BACKUP_DIR="${backupDir}"
BACKUP_FILE="${backupFile}"
DB_HOST="${config.host}"
DB_PORT="${config.port}"
DB_NAME="${config.database}"
DB_USER="${config.username}"
RETENTION_DAYS="${config.backupRetentionDays}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup
echo "Starting backup of $DB_NAME at $(date)"
PGPASSWORD="$DB_PASSWORD" pg_dump \\
  --host="$DB_HOST" \\
  --port="$DB_PORT" \\
  --username="$DB_USER" \\
  --dbname="$DB_NAME" \\
  --verbose \\
  --clean \\
  --if-exists \\
  --create \\
  --format=custom \\
  --file="$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_DIR/$BACKUP_FILE"

# Remove old backups
find "$BACKUP_DIR" -name "typeamp_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed successfully: $BACKUP_DIR/$BACKUP_FILE.gz"
echo "Backup size: $(du -h "$BACKUP_DIR/$BACKUP_FILE.gz" | cut -f1)"
`;
}

/**
 * Migration deployment script
 */
export function generateMigrationScript(): string {
  return `#!/bin/bash
# TypeAmp Database Migration Script
# Run this script to deploy database changes safely

set -e

echo "Starting TypeAmp database migration..."

# Check if database is accessible
echo "Checking database connection..."
npx prisma db execute --command="SELECT 1;" --schema=prisma/schema.prisma

# Create backup before migration
echo "Creating pre-migration backup..."
npm run db:backup

# Run migrations
echo "Applying database migrations..."
npx prisma migrate deploy --schema=prisma/schema.prisma

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate --schema=prisma/schema.prisma

# Verify migration success
echo "Verifying migration..."
npx prisma db execute --command="SELECT count(*) FROM _prisma_migrations;" --schema=prisma/schema.prisma

echo "Migration completed successfully!"
`;
}

/**
 * Environment configuration template
 */
export const ENV_TEMPLATE = `# TypeAmp Production Database Configuration
# Copy this to .env.production and fill in your values

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

# Migration Settings
DB_AUTO_MIGRATE="false"

# Security
JWT_SECRET="your-jwt-secret-key"
BCRYPT_ROUNDS="12"

# Application Settings
NODE_ENV="production"
PORT="3001"
HOST="0.0.0.0"

# Monitoring and Logging
LOG_LEVEL="info"
ENABLE_METRICS="true"
`;

export default {
  DEFAULT_PRODUCTION_CONFIG,
  generateDatabaseUrl,
  validateDatabaseConfig,
  POSTGRESQL_OPTIMIZATIONS,
  MONITORING_QUERIES,
  generateBackupScript,
  generateMigrationScript,
  ENV_TEMPLATE
};