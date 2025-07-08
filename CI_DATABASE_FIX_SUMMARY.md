# CI Database Connection Fix Summary

## Issues Fixed

1. **Workflow Syntax Error**: Removed invalid `if` condition from postgres service definition in `ci-enterprise.yml` (line 243)
2. **Missing Environment Variable**: Added `DEPENDENCY_CACHE_KEY` definition to workflow environment
3. **Database Connection in Tests**: Updated test setup to use `DATABASE_URL` from CI environment

## Changes Made

### 1. `.github/workflows/ci-enterprise.yml`
- Removed `if: matrix.needs-db` from postgres service configuration (services can't be conditional at that level)
- Added `DEPENDENCY_CACHE_KEY` environment variable definition

### 2. `packages/api/src/testing/setup.ts`
- Modified to use `DATABASE_URL` from environment if provided (for CI)
- Falls back to local default if not set
- This allows CI to override the database connection string

### 3. `packages/api/src/testing/testUtils.ts`
- Updated `initTestDatabase()` to prioritize `DATABASE_URL` over `TEST_DATABASE_URL`
- Maintains backward compatibility with existing configurations

### 4. `packages/api/src/lib/prisma.ts`
- Updated `getDatabaseUrl()` to use `DATABASE_URL` in test environment when available
- This ensures the main Prisma client also uses the CI-provided connection string

## How It Works in CI

1. GitHub Actions creates a PostgreSQL service container
2. The service is accessible at `localhost:5432` on Linux runners
3. CI sets `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/typeamp_test`
4. Test setup detects this environment variable and uses it instead of the hardcoded default
5. All Prisma clients (both in tests and main code) use this connection string

## Testing Locally

The changes maintain backward compatibility. Local development will continue to work as before:
- If `DATABASE_URL` is not set, tests will use the default local connection
- Developers can override by setting `DATABASE_URL` or `TEST_DATABASE_URL` environment variables