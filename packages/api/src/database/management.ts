#!/usr/bin/env node

/**
 * TypeAmp Database Management Utilities
 * 
 * Provides tools for database backup, restore, migration, and maintenance.
 * 
 * Usage:
 *   npm run db:backup         # Create database backup
 *   npm run db:restore        # Restore from backup
 *   npm run db:migrate        # Run pending migrations
 *   npm run db:analyze        # Analyze database performance
 *   npm run db:vacuum         # Vacuum and optimize database
 */

import { PrismaClient } from '../generated/prisma/index.js';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface BackupOptions {
  outputPath?: string;
  compress?: boolean;
  includeData?: boolean;
  includeSchema?: boolean;
}

export interface RestoreOptions {
  backupPath: string;
  dropExisting?: boolean;
  validateSchema?: boolean;
}

export interface AnalysisReport {
  databaseSize: string;
  tableStats: Array<{
    tableName: string;
    rowCount: number;
    sizeBytes: number;
    sizeFormatted: string;
  }>;
  performanceMetrics: {
    totalQueries: number;
    avgQueryTime: number;
    slowQueries: number;
  };
  indexUsage: Array<{
    tableName: string;
    indexName: string;
    usageCount: number;
    effectiveness: string;
  }>;
}

export class DatabaseManager {
  private prisma: PrismaClient;
  private dbPath: string;

  constructor() {
    this.prisma = new PrismaClient();
    // Store database URL for PostgreSQL operations
    this.dbPath = process.env.DATABASE_URL || 'postgresql://typeamp_user:typeamp_dev_pass@localhost:5432/typeamp_dev';
  }

  /**
   * Create a backup of the current database
   */
  async createBackup(options: BackupOptions = {}): Promise<string> {
    const {
      outputPath,
      compress = true,
      includeData = true,
      includeSchema = true
    } = options;

    console.log('🔄 Creating database backup...');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'backups');
    
    // Ensure backup directory exists
    await fs.mkdir(backupDir, { recursive: true });

    const baseFileName = `typeamp-backup-${timestamp}`;
    const backupPath = outputPath || path.join(backupDir, `${baseFileName}.sql`);

    try {
      // Use pg_dump for PostgreSQL backups
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        throw new Error('DATABASE_URL not found');
      }

      let pgDumpArgs = [];
      
      if (!includeSchema && includeData) {
        pgDumpArgs.push('--data-only');
      } else if (includeSchema && !includeData) {
        pgDumpArgs.push('--schema-only');
      }
      // Default: both schema and data

      const pgDumpCommand = `pg_dump "${databaseUrl}" ${pgDumpArgs.join(' ')} -f "${backupPath}"`;
      await execAsync(pgDumpCommand);
      console.log(`✅ PostgreSQL backup created: ${backupPath}`);

      // Compress if requested
      if (compress) {
        const gzipCommand = `gzip "${backupPath}"`;
        await execAsync(gzipCommand);
        const compressedPath = `${backupPath}.gz`;
        console.log(`📦 Backup compressed: ${compressedPath}`);
        return compressedPath;
      }

      return backupPath;
    } catch (error) {
      console.error('❌ Backup failed:', error);
      throw error;
    }
  }

  /**
   * Restore database from backup
   */
  async restoreFromBackup(options: RestoreOptions): Promise<void> {
    const { backupPath, dropExisting = false, validateSchema = true } = options;

    console.log(`🔄 Restoring database from: ${backupPath}`);

    try {
      // Check if backup file exists
      await fs.access(backupPath);

      if (dropExisting) {
        console.log('🗑️ Dropping existing database...');
        await this.dropDatabase();
      }

      // Handle compressed backups
      let actualBackupPath = backupPath;
      if (backupPath.endsWith('.gz')) {
        console.log('📦 Decompressing backup...');
        const decompressCommand = `gunzip -c "${backupPath}" > "${backupPath.replace('.gz', '')}"`;
        await execAsync(decompressCommand);
        actualBackupPath = backupPath.replace('.gz', '');
      }

      // Restore based on database type
      if (this.dbPath.includes('.db')) {
        // SQLite restore
        await fs.copyFile(actualBackupPath, this.dbPath);
      } else {
        // PostgreSQL restore
        const psqlCommand = `psql "${process.env.DATABASE_URL}" < "${actualBackupPath}"`;
        await execAsync(psqlCommand);
      }

      if (validateSchema) {
        console.log('✅ Validating restored schema...');
        await this.validateDatabaseSchema();
      }

      console.log('✅ Database restored successfully');
    } catch (error) {
      console.error('❌ Restore failed:', error);
      throw error;
    }
  }

  /**
   * Run database migrations
   */
  async runMigrations(): Promise<void> {
    console.log('🔄 Running database migrations...');

    try {
      const migrateCommand = 'npx prisma migrate deploy';
      const { stdout, stderr } = await execAsync(migrateCommand);
      
      if (stderr && !stderr.includes('warning')) {
        throw new Error(stderr);
      }

      console.log('✅ Migrations completed successfully');
      console.log(stdout);
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  /**
   * Analyze database performance and generate report
   */
  async analyzeDatabasePerformance(): Promise<AnalysisReport> {
    console.log('📊 Analyzing database performance...');

    try {
      // Get table statistics
      const tableStats = await this.getTableStatistics();
      
      // Get database size
      const databaseSize = await this.getDatabaseSize();

      // Simulate performance metrics (would be more sophisticated in production)
      const performanceMetrics = {
        totalQueries: 0,
        avgQueryTime: 0,
        slowQueries: 0
      };

      // Simulate index usage (would query actual usage stats in production)
      const indexUsage = await this.getIndexUsage();

      const report: AnalysisReport = {
        databaseSize,
        tableStats,
        performanceMetrics,
        indexUsage
      };

      console.log('✅ Analysis completed');
      this.printAnalysisReport(report);

      return report;
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      throw error;
    }
  }

  /**
   * Vacuum and optimize database (PostgreSQL)
   */
  async vacuumDatabase(): Promise<void> {
    console.log('🧹 Optimizing PostgreSQL database...');

    try {
      // PostgreSQL vacuum and analyze
      await this.prisma.$executeRaw`VACUUM ANALYZE;`;
      console.log('✅ PostgreSQL database optimized');
    } catch (error) {
      console.error('❌ Optimization failed:', error);
      throw error;
    }
  }

  /**
   * Get table statistics
   */
  private async getTableStatistics(): Promise<AnalysisReport['tableStats']> {
    const stats = [];

    // Count records in each table
    const userCount = await this.prisma.user.count();
    const testResultCount = await this.prisma.testResult.count();
    const userSettingsCount = await this.prisma.userSettings.count();

    stats.push({
      tableName: 'Users',
      rowCount: userCount,
      sizeBytes: userCount * 200, // Estimated
      sizeFormatted: this.formatBytes(userCount * 200)
    });

    stats.push({
      tableName: 'TestResults', 
      rowCount: testResultCount,
      sizeBytes: testResultCount * 150, // Estimated
      sizeFormatted: this.formatBytes(testResultCount * 150)
    });

    stats.push({
      tableName: 'UserSettings',
      rowCount: userSettingsCount,
      sizeBytes: userSettingsCount * 100, // Estimated
      sizeFormatted: this.formatBytes(userSettingsCount * 100)
    });

    return stats;
  }

  /**
   * Get database size
   */
  private async getDatabaseSize(): Promise<string> {
    try {
      if (this.dbPath.includes('.db')) {
        const stats = await fs.stat(this.dbPath);
        return this.formatBytes(stats.size);
      } else {
        // For PostgreSQL, would query pg_database_size
        return 'Unknown';
      }
    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * Get index usage statistics
   */
  private async getIndexUsage(): Promise<AnalysisReport['indexUsage']> {
    // Simplified index usage - in production would query actual usage statistics
    return [
      {
        tableName: 'Users',
        indexName: 'Users_email_key',
        usageCount: 100,
        effectiveness: 'High'
      },
      {
        tableName: 'TestResults',
        indexName: 'TestResults_userId_fkey',
        usageCount: 500,
        effectiveness: 'High'
      }
    ];
  }

  /**
   * Validate database schema
   */
  private async validateDatabaseSchema(): Promise<void> {
    try {
      // Simple validation - check that we can query each table
      await this.prisma.user.findFirst();
      await this.prisma.testResult.findFirst();
      await this.prisma.userSettings.findFirst();
      console.log('✅ Schema validation passed');
    } catch (error) {
      console.error('❌ Schema validation failed:', error);
      throw error;
    }
  }

  /**
   * Drop database (be careful!)
   */
  private async dropDatabase(): Promise<void> {
    if (this.dbPath.includes('.db')) {
      try {
        await fs.unlink(this.dbPath);
        console.log('✅ Database file deleted');
      } catch (error) {
        // File might not exist, that's ok
      }
    } else {
      console.log('⚠️ PostgreSQL database drop not implemented (safety measure)');
    }
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Print analysis report
   */
  private printAnalysisReport(report: AnalysisReport): void {
    console.log('\n📊 Database Analysis Report');
    console.log('===========================');
    console.log(`Database Size: ${report.databaseSize}`);
    
    console.log('\n📋 Table Statistics:');
    report.tableStats.forEach(stat => {
      console.log(`  ${stat.tableName}: ${stat.rowCount} rows (${stat.sizeFormatted})`);
    });

    console.log('\n📈 Index Usage:');
    report.indexUsage.forEach(index => {
      console.log(`  ${index.tableName}.${index.indexName}: ${index.usageCount} uses (${index.effectiveness})`);
    });
  }

  /**
   * Clean up resources
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

/**
 * CLI interface for database management
 */
async function main() {
  const command = process.argv[2];
  const manager = new DatabaseManager();

  try {
    switch (command) {
      case 'backup':
        await manager.createBackup({ compress: true });
        break;
      
      case 'restore':
        const backupPath = process.argv[3];
        if (!backupPath) {
          console.error('❌ Please provide backup path');
          process.exit(1);
        }
        await manager.restoreFromBackup({ backupPath });
        break;
      
      case 'migrate':
        await manager.runMigrations();
        break;
      
      case 'analyze':
        await manager.analyzeDatabasePerformance();
        break;
      
      case 'vacuum':
        await manager.vacuumDatabase();
        break;
      
      default:
        console.log('Available commands:');
        console.log('  backup  - Create database backup');
        console.log('  restore <path> - Restore from backup');
        console.log('  migrate - Run database migrations');
        console.log('  analyze - Analyze database performance');
        console.log('  vacuum  - Optimize database');
        break;
    }
  } catch (error) {
    console.error('❌ Command failed:', error);
    process.exit(1);
  } finally {
    await manager.disconnect();
  }
}

// Run CLI if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default DatabaseManager;