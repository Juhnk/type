# TypeAmp Project Documentation for Claude AI

## Product Overview
- Received comprehensive Game Design Document (GDD) for TypeAmp Version 5.0 on July 1, 2025
- Authored by Gemini AI
- Core philosophy focuses on frictionless skill amplification through typing practice
- High-performance typing game with local-first architecture

## Key Design Principles
- **Local-first data storage** - Works without mandatory account creation
- **Instant access** - No barriers to start practicing
- **Data-driven improvement** - Advanced performance metrics and analytics
- **Progressive enhancement** - Optional features that don't block core functionality
- **Performance-focused** - Optimized for 60+ FPS typing experience

## Project Structure & Architecture

### Monorepo Organization
```
typeamp/
├── packages/
│   ├── web/          # Next.js frontend application
│   └── api/          # Fastify backend API
├── scripts/          # Development and deployment scripts
├── logs/            # Application logs
└── .github/         # CI/CD workflows
```

### Key Configuration Files
- **Root**: `package.json` (workspace config), `.prettierrc.json`, `.env`
- **Web**: `tsconfig.json`, `eslint.config.mjs`, `tailwind.config.ts`, `components.json`
- **API**: `tsconfig.json`, `prisma/schema.prisma`

## Technology Stack

### Frontend (packages/web)
- **Framework**: Next.js 15.3.4 with App Router (React 19)
- **Language**: TypeScript with strict mode enabled
- **Styling**: 
  - Tailwind CSS v4 with custom design tokens
  - CSS custom properties for theming
  - shadcn/ui components (copied, not installed)
- **UI Components**: Radix UI primitives for accessibility
- **State Management**: Zustand v5 with persist middleware
- **Forms**: React Hook Form v7 + Zod validation
- **Data Fetching**: SWR for API cache management
- **Charts**: Recharts for statistics visualization
- **Icons**: Lucide React
- **Fonts**: Inter (sans), Roboto Mono (mono)

### Backend (packages/api)
- **Framework**: Fastify v5 with TypeScript
- **Database**: PostgreSQL with Prisma ORM v6
- **Authentication**: JWT-based with @fastify/jwt
- **API Docs**: Swagger/OpenAPI auto-generated
- **Logging**: Pino structured logging
- **AI Integration**: Anthropic Claude SDK for text generation
- **CORS**: Configured for local development

### Testing & Quality
- **Unit/Integration**: Vitest with React Testing Library
- **E2E Tests**: Playwright for cross-browser testing
- **Linting**: ESLint with Next.js config + Storybook plugin
- **Formatting**: Prettier with Tailwind CSS plugin
- **Git Hooks**: Husky + lint-staged for pre-commit checks
- **Type Checking**: TypeScript strict mode
- **Coverage**: 80% threshold requirement

### Development Tools
- **Component Development**: Storybook v9
- **Database GUI**: Prisma Studio
- **Package Manager**: npm with workspaces
- **Node Version**: 20.19.3 (via .nvmrc)

## Code Style & Conventions

### Prettier Configuration
```json
{
  "semi": true,
  "singleQuote": true,
  "jsxSingleQuote": false,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 80,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### TypeScript Conventions
- Use `interface` for object shapes, `type` for unions/primitives
- Prefer `const` assertions for literal types
- Always use strict null checks
- Export types alongside implementations
- Use absolute imports with `@/` alias

### Component Conventions
```typescript
// File naming: PascalCase.tsx for components
// Export pattern: named exports preferred

// Props interface naming
interface ComponentNameProps {
  // Required props first
  id: string;
  value: number;
  // Optional props after
  className?: string;
  onAction?: () => void;
}

// Component structure
export function ComponentName({ 
  id, 
  value, 
  className,
  onAction 
}: ComponentNameProps) {
  // Hooks at top
  // Event handlers
  // Render logic
  return <div>...</div>;
}
```

### State Management Patterns
```typescript
// Zustand store pattern
interface StoreState {
  // State
  value: string;
  items: Item[];
  
  // Actions (imperative naming)
  setValue: (value: string) => void;
  addItem: (item: Item) => void;
  reset: () => void;
}

// Use atomic selectors for performance
const value = useStore(state => state.value);
```

### File Organization
```
src/
├── app/               # Next.js app router pages
├── components/
│   ├── ui/           # shadcn/ui base components
│   ├── game/         # Game-specific components
│   ├── layout/       # Layout components
│   ├── auth/         # Authentication components
│   └── common/       # Shared components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── store/            # Zustand stores
├── styles/           # Global styles and tokens
└── types/            # TypeScript type definitions
```

## Design System

### Design Tokens (`design-tokens.css`)
```css
/* Spacing Scale (4px base) */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */

/* Typography Scale */
--text-sm: 0.875rem;  /* 14px */
--text-base: 1rem;    /* 16px */
--text-lg: 1.125rem;  /* 18px */
--text-xl: 1.25rem;   /* 20px */
--text-2xl: 1.5rem;   /* 24px */

/* Component Heights */
--input-height-sm: 2rem;      /* h-8 */
--input-height-default: 2.25rem; /* h-9 */
--input-height-lg: 2.5rem;    /* h-10 */

/* Shadows */
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

/* Animation Durations */
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 350ms;

/* Status Colors */
--color-success: oklch(0.6 0.118 184.704);
--color-warning: oklch(0.828 0.189 84.429);
--color-error: var(--destructive);
--color-info: oklch(0.488 0.243 264.376);
```

### Utility Classes
```css
/* Always use these for consistency */
.focus-ring       /* Focus states */
.disabled-state   /* Disabled elements */
.transition-base  /* Standard transitions */
.text-body-sm/base/lg    /* Body text sizes */
.text-heading-sm/base/lg /* Heading sizes */
```

### Component Styling Patterns
- Use CVA (class-variance-authority) for component variants
- Prefer Tailwind utilities over custom CSS
- Use design tokens for all spacing/sizing
- Apply semantic color names (success/warning/error)

## API Patterns

### Endpoint Structure
```
GET    /api/health              # Health check
POST   /api/auth/signup         # User registration
POST   /api/auth/login          # User login
GET    /api/me                  # Current user
GET    /api/me/tests           # User's test results
POST   /api/me/tests           # Save test result
GET    /api/words              # Get practice words
GET    /api/leaderboard        # Global leaderboard
```

### Request/Response Format
```typescript
// Success Response
{
  "data": T,
  "meta": {
    "timestamp": "2025-07-11T00:00:00Z"
  }
}

// Error Response
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {}
  }
}
```

### Error Handling
- Use proper HTTP status codes
- Return structured error objects
- Log errors with context
- Never expose internal details

## Database Schema

### Core Tables
- **User**: Authentication and profile
- **TestResult**: Typing test results with full config
- **PracticeSession**: Detailed practice analytics
- **Leaderboard**: Cached leaderboard entries

### Data Patterns
- UUID primary keys
- Timestamps on all records
- Soft deletes where appropriate
- JSON fields for flexible configs

## Testing Strategy

### File Naming
- Unit tests: `*.test.ts` or `*.test.tsx`
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.spec.ts` in `e2e/` directory

### Testing Patterns
```typescript
// Component testing
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// API testing
import { describe, it, expect, vi } from 'vitest';

// Mock Zustand stores
vi.mock('@/store/useGameStore');
```

### Coverage Requirements
- Minimum 80% overall coverage
- Critical paths must have 100% coverage
- E2E tests for all user flows

## Development Workflow

### Environment Setup
```bash
# Initial setup
npm run dev:setup    # Sets up DB, env, dependencies

# Development
npm run dev          # Frontend only
npm run dev:full     # Frontend + Backend + DB

# Database
npm run db:push      # Apply schema changes
npm run db:studio    # Open Prisma Studio

# Testing
npm run test         # Run all tests
npm run test:watch   # Watch mode
npm run test:e2e     # E2E tests
```

### Git Workflow
- Feature branches: `feature/description`
- Commit format: `type(scope): message`
- Pre-commit hooks run automatically
- Never commit `.env` or credentials

### Common Tasks
1. **Adding a new component**: Create in appropriate directory, add story, test
2. **Adding an API endpoint**: Create handler, add types, update OpenAPI
3. **Updating schema**: Edit `schema.prisma`, run `db:push`, regenerate client
4. **Adding a feature**: Update store, components, tests, and documentation

## Performance Considerations

### Frontend Optimization
- Use React.memo for expensive components
- Implement virtual scrolling for long lists
- Lazy load routes and heavy components
- Optimize bundle with dynamic imports
- Use atomic Zustand selectors

### Backend Optimization
- Connection pooling for database
- Implement caching where appropriate
- Use database indexes effectively
- Paginate all list endpoints
- Stream large responses

### Typing Game Specific
- 60+ FPS rendering target
- Minimal input latency (<16ms)
- Efficient text rendering
- Debounce statistics calculations
- Web Workers for heavy computations

## Accessibility Requirements

### Keyboard Navigation
- All interactive elements keyboard accessible
- Logical tab order
- Escape key closes modals
- Enter key submits forms

### Screen Reader Support
- Semantic HTML structure
- ARIA labels where needed
- Live regions for dynamic content
- Proper heading hierarchy

### Visual Accessibility
- WCAG AA color contrast
- Focus indicators on all elements
- Reduced motion preferences
- High contrast theme support

## Security Practices

### Frontend Security
- Sanitize all user inputs
- Use HTTPS in production
- Implement CSP headers
- No sensitive data in localStorage

### Backend Security
- JWT tokens with expiration
- Rate limiting on all endpoints
- Input validation with Zod
- SQL injection prevention via Prisma
- Secure password hashing with bcrypt

### Environment Security
- Use `.env.local` for secrets
- Different keys per environment
- Rotate secrets regularly
- Never log sensitive data

## Deployment Considerations

### Frontend Deployment
- Optimized for Vercel deployment
- Static generation where possible
- ISR for dynamic content
- Edge functions for performance

### Backend Deployment
- Containerized with Docker
- Health checks for monitoring
- Graceful shutdown handling
- Database migration strategy

## Working with Claude - Best Practices

### When Adding Features
1. Check existing patterns in similar components
2. Use established design tokens
3. Follow TypeScript conventions
4. Add proper error handling
5. Include loading states
6. Test accessibility
7. Update relevant documentation

### When Fixing Bugs
1. Reproduce locally first
2. Check logs for context
3. Write test to prevent regression
4. Follow existing error patterns
5. Update related components

### When Refactoring
1. Maintain backward compatibility
2. Update all usages
3. Run full test suite
4. Check bundle size impact
5. Document breaking changes

### Component Creation Checklist
- [ ] TypeScript props interface
- [ ] Accessibility attributes
- [ ] Loading/error states
- [ ] Responsive design
- [ ] Dark mode support
- [ ] Storybook story
- [ ] Unit tests
- [ ] Documentation

### API Endpoint Checklist
- [ ] Input validation schema
- [ ] Error handling
- [ ] Logging
- [ ] Rate limiting
- [ ] Authentication check
- [ ] OpenAPI documentation
- [ ] Integration tests

## Important Notes

### Current Limitations
- No email service configured
- AI features require API key
- Local storage for unauthenticated users
- Limited to web platform currently

### Future Enhancements
- Cross-platform synchronization
- Advanced AI text generation
- Multiplayer competitions
- Mobile applications
- Offline support with PWA

### Performance Targets
- Time to Interactive: <3s
- Lighthouse Score: 95+
- Bundle Size: <200KB initial
- API Response: <100ms p95

### Monitoring
- Error tracking with Sentry (when configured)
- Performance monitoring
- User analytics (privacy-focused)
- API health checks

## Quick Reference

### Common Commands
```bash
# Development
npm run dev          # Start frontend
npm run dev:full     # Start everything
npm run db:studio    # Database GUI

# Testing
npm run test        # Run tests
npm run lint        # Lint code
npm run type-check  # Type checking

# Storybook
npm run storybook   # Component development
```

### File Locations
- Components: `packages/web/src/components/`
- API Routes: `packages/api/src/routes/`
- Database Schema: `packages/api/prisma/schema.prisma`
- Design Tokens: `packages/web/src/styles/design-tokens.css`
- Environment: `.env` (local development)

### Key Libraries Docs
- [Next.js 15](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Fastify](https://fastify.dev)
- [Prisma](https://www.prisma.io/docs)

This documentation represents the current state of TypeAmp as of January 2025. Always verify patterns by checking existing code examples in the codebase.