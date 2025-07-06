#!/usr/bin/env node

/**
 * TypeAmp Database Seeding Script
 * 
 * This script populates the database with realistic fake data for development and testing.
 * It generates users with varied skill levels, realistic test results showing progression,
 * user settings, achievements, and analytics data.
 * 
 * Usage:
 *   npm run seed              # Seed development database with default data
 *   npm run seed:production   # Seed production database with larger dataset
 *   npm run seed:minimal      # Seed minimal dataset for testing
 */

import { PrismaClient } from '../generated/prisma/index.js';
import bcrypt from 'bcrypt';
import {
  generateUserPersonas,
  generateTestResults,
  generateUserSettings,
  generateAchievements,
  generateWordListStats,
  generateDailyStats,
  type UserSeedData,
  type TestResultSeedData
} from './seedData.js';

// Configuration for different seeding modes
const SEED_CONFIGS = {
  minimal: {
    users: 10,
    timeSpanDays: 30,
    description: 'Minimal dataset for testing'
  },
  development: {
    users: 100,
    timeSpanDays: 180,
    description: 'Development dataset with varied users'
  },
  production: {
    users: 500,
    timeSpanDays: 365,
    description: 'Production-ready dataset with comprehensive data'
  }
};

export class DatabaseSeeder {
  private prisma: PrismaClient;
  private config: typeof SEED_CONFIGS[keyof typeof SEED_CONFIGS];

  constructor(mode: keyof typeof SEED_CONFIGS = 'development') {
    this.prisma = new PrismaClient();
    this.config = SEED_CONFIGS[mode];
  }

  /**
   * Main seeding function that orchestrates the entire process
   */
  async seed(): Promise<void> {
    console.log(`🌱 Starting database seeding: ${this.config.description}`);
    console.log(`📊 Configuration: ${this.config.users} users, ${this.config.timeSpanDays} days history`);

    try {
      // Step 1: Clean existing data
      await this.cleanDatabase();

      // Step 2: Generate and seed users with realistic personas
      const users = await this.seedUsers();

      // Step 3: Generate and seed test results with skill progression
      await this.seedTestResults(users);

      // Step 4: Seed user settings based on user profiles
      await this.seedUserSettings(users);

      // Step 5: Update user aggregate statistics
      await this.updateUserStats();

      console.log('✅ Database seeding completed successfully!');
      await this.printSeedingSummary();

    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  /**
   * Clean existing data to ensure fresh seeding
   */
  private async cleanDatabase(): Promise<void> {
    console.log('🧹 Cleaning existing data...');

    // Delete in correct order to handle foreign key constraints
    // Only clean tables that exist in current schema
    await this.prisma.testResult.deleteMany();
    await this.prisma.userSettings.deleteMany();
    await this.prisma.user.deleteMany();

    console.log('✅ Database cleaned');
  }


  /**
   * Generate and seed users with realistic personas
   */
  private async seedUsers(): Promise<UserSeedData[]> {
    console.log('👥 Generating user personas...');

    const userPersonas = generateUserPersonas(this.config.users);
    console.log(`📝 Generated ${userPersonas.length} user personas`);

    const batchSize = 50;
    const users: UserSeedData[] = [];

    for (let i = 0; i < userPersonas.length; i += batchSize) {
      const batch = userPersonas.slice(i, i + batchSize);
      
      const batchData = await Promise.all(
        batch.map(async (persona) => ({
          email: persona.email,
          passwordHash: await bcrypt.hash('password123', 10), // Default password for seeded users
          createdAt: persona.joinDate
        }))
      );

      await this.prisma.user.createMany({
        data: batchData
      });

      users.push(...batch);
      console.log(`✅ Seeded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(userPersonas.length / batchSize)}`);
    }

    console.log(`✅ Created ${users.length} users`);
    return users;
  }

  /**
   * Generate and seed test results with realistic skill progression
   */
  private async seedTestResults(userPersonas: UserSeedData[]): Promise<void> {
    console.log('📊 Generating test results with skill progression...');

    const batchSize = 10; // Smaller batches for test results due to volume
    let totalResults = 0;

    for (let i = 0; i < userPersonas.length; i += batchSize) {
      const batch = userPersonas.slice(i, i + batchSize);
      
      // Get actual user IDs from database
      const userEmails = batch.map(p => p.email);
      const dbUsers = await this.prisma.user.findMany({
        where: { email: { in: userEmails } },
        select: { id: true, email: true }
      });

      // Generate test results for each user in batch
      const allTestResults: any[] = [];

      for (const persona of batch) {
        const dbUser = dbUsers.find(u => u.email === persona.email);
        if (!dbUser) continue;

        const testResults = generateTestResults(persona, this.config.timeSpanDays);
        
        const testResultData = testResults.map((result: TestResultSeedData) => ({
          userId: dbUser.id,
          wpm: result.wpm,
          accuracy: result.accuracy,
          rawWpm: result.rawWpm,
          consistency: result.consistency || 0,
          config: JSON.stringify({
            mode: result.mode,
            duration: result.duration,
            wordCount: result.wordCount,
            difficulty: result.difficulty,
            textSource: result.textSource
          }),
          tags: `${result.difficulty},${result.textSource}`,
          timestamp: result.timestamp
        }));

        allTestResults.push(...testResultData);
      }

      // Insert test results in smaller sub-batches
      const resultBatchSize = 100;
      for (let j = 0; j < allTestResults.length; j += resultBatchSize) {
        const resultBatch = allTestResults.slice(j, j + resultBatchSize);
        await this.prisma.testResult.createMany({
          data: resultBatch
        });
        totalResults += resultBatch.length;
      }

      console.log(`✅ Processed users ${i + 1}-${Math.min(i + batchSize, userPersonas.length)} (${totalResults} test results so far)`);
    }

    console.log(`✅ Created ${totalResults} test results`);
  }

  /**
   * Seed user settings based on user profiles
   */
  private async seedUserSettings(userPersonas: UserSeedData[]): Promise<void> {
    console.log('⚙️ Generating user settings...');

    // Get all users from database
    const dbUsers = await this.prisma.user.findMany({
      select: { id: true, email: true }
    });

    const batchSize = 50;
    let totalSettings = 0;

    for (let i = 0; i < userPersonas.length; i += batchSize) {
      const batch = userPersonas.slice(i, i + batchSize);
      
      const settingsData = batch.map(persona => {
        const dbUser = dbUsers.find(u => u.email === persona.email);
        if (!dbUser) return null;

        const settings = generateUserSettings(persona);
        
        return {
          userId: dbUser.id,
          theme: settings.theme,
          caretStyle: settings.caretStyle,
          paceCaretWpm: settings.paceCaretWpm
        };
      }).filter((s): s is NonNullable<typeof s> => s !== null);

      await this.prisma.userSettings.createMany({
        data: settingsData
      });

      totalSettings += settingsData.length;
      console.log(`✅ Settings batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(userPersonas.length / batchSize)}`);
    }

    console.log(`✅ Created ${totalSettings} user settings`);
  }


  /**
   * Update user aggregate statistics based on their test results
   * Note: Current schema doesn't have aggregate fields, so this is a placeholder
   */
  private async updateUserStats(): Promise<void> {
    console.log('🔄 User stats update skipped (current schema)');
  }

  /**
   * Print a summary of the seeding results
   */
  private async printSeedingSummary(): Promise<void> {
    console.log('\n📋 Seeding Summary:');
    console.log('==================');

    const [
      userCount,
      testResultCount,
      userSettingsCount
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.testResult.count(),
      this.prisma.userSettings.count()
    ]);

    console.log(`👥 Users: ${userCount}`);
    console.log(`📊 Test Results: ${testResultCount}`);
    console.log(`⚙️ User Settings: ${userSettingsCount}`);

    // Sample users
    const sampleUsers = await this.prisma.user.findMany({
      take: 5,
      include: {
        testResults: {
          take: 1,
          orderBy: { wpm: 'desc' }
        }
      }
    });

    console.log('\n🏆 Sample Users:');
    sampleUsers.forEach((user, i) => {
      const bestWpm = user.testResults[0]?.wpm || 0;
      console.log(`${i + 1}. ${user.email}: Best ${bestWpm} WPM`);
    });

    console.log('\n✨ Database seeding completed successfully!');
    console.log('🚀 Your TypeAmp database is now populated with realistic data.');
  }
}

/**
 * Main execution function
 */
async function main() {
  const mode = process.argv[2] as keyof typeof SEED_CONFIGS || 'development';
  
  if (!SEED_CONFIGS[mode]) {
    console.error(`❌ Invalid mode: ${mode}`);
    console.log('Available modes: minimal, development, production');
    process.exit(1);
  }

  const seeder = new DatabaseSeeder(mode);
  await seeder.seed();
}

// Run the seeder if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
}

export default DatabaseSeeder;
export { SEED_CONFIGS };