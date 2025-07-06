import { PrismaClient } from '../generated/prisma/index.js';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use test database in test environment
const getDatabaseUrl = () => {
  if (process.env.NODE_ENV === 'test') {
    return process.env.TEST_DATABASE_URL || 'postgresql://typeamp_user:typeamp_dev_pass@localhost:5432/typeamp_test';
  }
  return process.env.DATABASE_URL || 'postgresql://typeamp_user:typeamp_dev_pass@localhost:5432/typeamp_dev';
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  },
  log: process.env.NODE_ENV === 'test' ? [] : ['query', 'info', 'warn', 'error']
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}