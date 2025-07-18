/**
 * Application configuration for the API package
 * All environment-specific values should be defined here
 */

// Server Configuration
export const SERVER_CONFIG = {
  port: Number(process.env.API_PORT) || 8080,
  host: process.env.API_HOST || '0.0.0.0',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3002'
  ],
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  devServerUrl: process.env.DEV_SERVER_URL || 'http://localhost:8080',
};

// Database Configuration
export const DATABASE_CONFIG = {
  connectionTimeout: Number(process.env.DB_CONNECTION_TIMEOUT) || 30000, // 30 seconds
  idleTimeout: Number(process.env.DB_IDLE_TIMEOUT) || 600000, // 10 minutes
  statementTimeout: Number(process.env.DB_STATEMENT_TIMEOUT) || 30000, // 30 seconds
  queryTimeout: Number(process.env.DB_QUERY_TIMEOUT) || 15000, // 15 seconds
  slowQueryThreshold: Number(process.env.DB_SLOW_QUERY_THRESHOLD) || 1000, // 1 second
  poolMin: Number(process.env.DB_POOL_MIN) || 5,
  poolMax: Number(process.env.DB_POOL_MAX) || 20,
  backupRetentionDays: Number(process.env.DB_BACKUP_RETENTION_DAYS) || 30,
  backupSchedule: process.env.DB_BACKUP_SCHEDULE || '0 2 * * *', // 2 AM daily
};

// Security Configuration
export const SECURITY_CONFIG = {
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
  rateLimitWindow: Number(process.env.RATE_LIMIT_WINDOW) || 900000, // 15 minutes
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 100,
};

// AI Configuration
export const AI_CONFIG = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  modelName: process.env.AI_MODEL_NAME || 'claude-3-haiku-20240307',
  maxTokens: Number(process.env.AI_MAX_TOKENS) || 150,
  temperature: Number(process.env.AI_TEMPERATURE) || 0.7,
  enabled: process.env.ENABLE_AI === 'true',
};

// Logging Configuration
export const LOGGING_CONFIG = {
  level: process.env.LOG_LEVEL || 'info',
  prettyPrint: process.env.LOG_PRETTY === 'true',
  redactPaths: process.env.LOG_REDACT_PATHS?.split(',') || ['req.headers.authorization'],
};

// Performance Configuration
export const PERFORMANCE_CONFIG = {
  enableMetrics: process.env.ENABLE_METRICS === 'true',
  metricsPort: Number(process.env.METRICS_PORT) || 9090,
  enableProfiling: process.env.ENABLE_PROFILING === 'true',
};

// PostgreSQL Optimization Settings (for production)
export const POSTGRES_OPTIMIZATION = {
  sharedBuffers: process.env.PG_SHARED_BUFFERS || '256MB',
  effectiveCacheSize: process.env.PG_EFFECTIVE_CACHE_SIZE || '1GB',
  maintenanceWorkMem: process.env.PG_MAINTENANCE_WORK_MEM || '64MB',
  checkpointCompletionTarget: Number(process.env.PG_CHECKPOINT_COMPLETION_TARGET) || 0.9,
  walBuffers: process.env.PG_WAL_BUFFERS || '16MB',
  defaultStatisticsTarget: Number(process.env.PG_DEFAULT_STATISTICS_TARGET) || 100,
  randomPageCost: Number(process.env.PG_RANDOM_PAGE_COST) || 1.1,
  effectiveIoConcurrency: Number(process.env.PG_EFFECTIVE_IO_CONCURRENCY) || 200,
  workMem: process.env.PG_WORK_MEM || '4MB',
  minWalSize: process.env.PG_MIN_WAL_SIZE || '80MB',
  maxWalSize: process.env.PG_MAX_WAL_SIZE || '1GB',
  maxWorkerProcesses: Number(process.env.PG_MAX_WORKER_PROCESSES) || 8,
  maxParallelWorkersPerGather: Number(process.env.PG_MAX_PARALLEL_WORKERS_PER_GATHER) || 2,
  maxParallelWorkers: Number(process.env.PG_MAX_PARALLEL_WORKERS) || 8,
};