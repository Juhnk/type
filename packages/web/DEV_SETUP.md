# TypeAmp Development Environment Setup

## Quick Start

For a complete automated setup, run:

```bash
npm run dev:setup
```

This will automatically:

- ✅ Clean any corrupted builds
- ✅ Stop conflicting processes
- ✅ Start backend API on port 3003
- ✅ Start frontend on port 3000
- ✅ Verify both services are working
- ✅ Test CORS configuration

## Manual Setup

If you prefer to start services individually:

### 1. Backend API (Required First)

```bash
cd packages/api
PORT=3003 npm run dev
```

The API will be available at: `http://localhost:3003`

### 2. Frontend (Start After Backend)

```bash
cd packages/web
npm run dev
```

The frontend will be available at: `http://localhost:3000`

## Troubleshooting

### Webpack Chunk Errors

If you see "Cannot find module './191.js'" or similar errors:

```bash
npm run dev:clean
```

This will clean the Next.js build cache and restart the dev server.

### CORS Errors

If authentication fails with "Failed to fetch":

1. Ensure the backend API is running on port 3003
2. Check that CORS is configured correctly
3. Test with: `curl -X OPTIONS http://localhost:3003/api/auth/register -H "Origin: http://localhost:3000"`

Expected response headers:

```
access-control-allow-origin: http://localhost:3000
access-control-allow-credentials: true
access-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS
access-control-allow-headers: Content-Type, Authorization
```

### Port Conflicts

If ports 3000 or 3003 are in use:

```bash
# Kill existing processes
pkill -f "next dev"
pkill -f "tsx watch"

# Or find and kill specific processes
lsof -ti:3000 | xargs kill
lsof -ti:3003 | xargs kill
```

### Authentication Testing

Test the authentication flow:

```bash
# Register a new user
curl -X POST http://localhost:3003/api/auth/register \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}'

# Login with the user
curl -X POST http://localhost:3003/api/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}'
```

Both should return JSON with user data and JWT token.

## Development Scripts

- `npm run dev` - Start frontend only
- `npm run dev:setup` - Complete automated setup
- `npm run dev:clean` - Clean build and restart frontend
- `npm run build` - Production build
- `npm run test` - Run tests

## Architecture

### Frontend (localhost:3000)

- Next.js 15 with App Router
- TypeScript, Tailwind CSS, shadcn/ui
- Zustand for state management
- React Hook Form with Zod validation

### Backend (localhost:3003)

- Fastify with TypeScript
- Prisma ORM with PostgreSQL
- JWT authentication
- CORS configured for localhost:3000

### Key Files

- `src/lib/api-client.ts` - Frontend API client
- `src/components/auth/AuthModal.tsx` - Authentication UI
- `packages/api/src/index.ts` - Backend server setup
- `packages/api/src/routes/auth.ts` - Authentication endpoints

## Environment Status

✅ **Fixed Issues:**

- Webpack chunk errors resolved
- CORS properly configured
- Authentication flow working end-to-end
- Development environment stable

🎯 **Ready for Sprint 1:**

- User registration working
- User login working
- JWT token management functional
- Cross-origin requests successful
- Error handling implemented
