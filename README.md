# TypeAmp ⚡

> **The Ultimate Typing Practice Game** - Amplify your typing skills with AI-powered challenges and comprehensive analytics.

[![CI/CD Pipeline](https://github.com/typeamp/typeamp/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/typeamp/typeamp/actions)
[![CodeQL](https://github.com/typeamp/typeamp/workflows/CodeQL/badge.svg)](https://github.com/typeamp/typeamp/actions)
[![Dependencies](https://github.com/typeamp/typeamp/workflows/Dependency%20Review/badge.svg)](https://github.com/typeamp/typeamp/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org/)

## 🎯 Overview

TypeAmp is a modern, full-stack typing game application designed to help users improve their typing speed, accuracy, and consistency through engaging practice sessions and AI-powered challenges.

### ✨ Key Features

- 🎮 **Interactive Typing Game** - Engaging real-time typing practice
- 🤖 **AI-Powered Challenges** - Context-aware text generation for varied practice
- 📊 **Comprehensive Analytics** - Detailed performance metrics and progress tracking
- 🎨 **Modern UI/UX** - Built with Next.js 15, TypeScript, and Tailwind CSS
- 🔐 **Secure Authentication** - JWT-based user authentication and session management
- 📱 **Responsive Design** - Optimized for desktop and mobile devices
- 🚀 **High Performance** - Optimized for speed with advanced caching strategies

## 🏗️ Architecture

TypeAmp is built as a **Turborepo monorepo** with enterprise-grade architecture:

```
typeamp/
├── packages/
│   ├── web/          # Next.js 15 Frontend Application
│   └── api/          # Node.js/Fastify Backend API
├── .github/          # GitHub Actions CI/CD & Templates
└── docs/             # Documentation
```

### 🛠️ Technology Stack

**Frontend (`packages/web`)**
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Testing**: Vitest + Testing Library
- **Build Tool**: Turbo

**Backend (`packages/api`)**
- **Framework**: Fastify 5
- **Language**: TypeScript 5+
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcrypt
- **AI Integration**: Anthropic Claude API
- **Documentation**: OpenAPI/Swagger
- **Testing**: Vitest + Supertest
- **Runtime**: Node.js 18+

**DevOps & Infrastructure**
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint, Prettier, TypeScript
- **Security**: CodeQL, Dependabot, Snyk
- **Deployment**: Vercel (Frontend) + Railway (Backend)
- **Monitoring**: Built-in health checks and logging

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+ (included with Node.js)
- **PostgreSQL** 14+ (for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/typeamp/typeamp.git
   cd typeamp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment templates
   cp packages/api/.env.example packages/api/.env
   cp packages/web/.env.example packages/web/.env.local
   
   # Edit the files with your configuration
   ```

4. **Set up the database**
   ```bash
   # Navigate to API package
   cd packages/api
   
   # Run Prisma migrations
   npm run db:migrate
   
   # Seed the database (optional)
   npm run db:seed
   ```

5. **Start development servers**
   ```bash
   # From the root directory
   npm run dev
   ```

6. **Access the application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:3003
   - **API Documentation**: http://localhost:3003/docs

## 📚 Development Guide

### Available Scripts

**Root Level Commands**
```bash
npm run dev          # Start all development servers
npm run build        # Build all packages
npm run test         # Run all tests
npm run lint         # Lint all packages
npm run type-check   # TypeScript type checking
```

**Frontend Commands (`packages/web`)**
```bash
npm run dev --workspace=packages/web          # Start Next.js dev server
npm run build --workspace=packages/web        # Build for production
npm run test --workspace=packages/web         # Run frontend tests
npm run test:ui --workspace=packages/web      # Run tests with UI
npm run lint --workspace=packages/web         # Lint frontend code
```

**Backend Commands (`packages/api`)**
```bash
npm run dev --workspace=packages/api          # Start Fastify dev server
npm run build --workspace=packages/api        # TypeScript compilation check
npm run test --workspace=packages/api         # Run backend tests
npm run test:coverage --workspace=packages/api # Run tests with coverage
npm run db:migrate --workspace=packages/api   # Run database migrations
npm run db:reset --workspace=packages/api     # Reset database
```

### 🧪 Testing

TypeAmp maintains high testing standards with comprehensive test coverage:

**Test Types**
- **Unit Tests**: Component and function testing
- **Integration Tests**: API endpoint testing  
- **E2E Tests**: End-to-end user workflows
- **Security Tests**: Vulnerability and penetration testing

**Running Tests**
```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Watch mode for development
npm run test:watch
```

**Coverage Requirements**
- **Minimum Coverage**: 80%
- **Current Coverage**: 
  - Frontend: 85%+
  - Backend: 95%+

### 🔒 Security

TypeAmp follows security best practices:

- **Authentication**: JWT tokens with secure refresh mechanism
- **Input Validation**: Comprehensive schema validation with Zod
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **XSS Prevention**: Content Security Policy and input sanitization
- **HTTPS Enforcement**: TLS encryption for all communications
- **Dependency Scanning**: Automated vulnerability detection

## 📖 API Documentation

### Word Source API

The core API provides endpoints for typing practice content:

**Endpoints**
- `GET /api/words` - Retrieve word lists for typing practice
- `GET /api/words/lists` - Get available word list information
- `GET /api/words/health` - API health check

**Example Usage**
```bash
# Get 50 randomized Python programming terms
curl "http://localhost:3003/api/words?list=python&limit=50&randomize=true"

# Response
{
  "words": ["def", "class", "import", "function", "variable"],
  "metadata": {
    "list": "python",
    "count": 50,
    "total_available": 352
  }
}
```

**Available Word Lists**
- `english1k` - 1,024 most common English words
- `english10k` - 10,000+ extended English vocabulary
- `javascript` - JavaScript programming terms and keywords
- `python` - Python programming terms and keywords

### Interactive API Documentation

Visit the Swagger UI at `http://localhost:3003/docs` for complete API documentation with interactive testing.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork & Clone** the repository
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes** and add tests
4. **Run tests**: `npm run test`
5. **Commit changes**: `git commit -m 'feat: add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration with custom rules
- **Prettier**: Automatic code formatting
- **Conventional Commits**: Standardized commit messages
- **Testing**: Required for all new features

## 🔄 Deployment

### Staging Environment

Pull requests are automatically deployed to staging:
- **Frontend**: https://staging-typeamp.vercel.app
- **Backend**: https://staging-api.typeamp.com

### Production Environment

Main branch deployments go to production:
- **Frontend**: https://typeamp.com
- **Backend**: https://api.typeamp.com

### Environment Configuration

**Required Environment Variables**

```bash
# Backend (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/typeamp
JWT_SECRET=your-super-secret-jwt-key
ANTHROPIC_API_KEY=your-anthropic-api-key
NODE_ENV=development

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3003
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📊 Performance

TypeAmp is optimized for speed and efficiency:

- **Frontend**: Lighthouse Score 90+
- **Backend**: Sub-100ms API response times
- **Database**: Optimized queries with proper indexing
- **Caching**: Redis for session management and API responses
- **CDN**: Global content delivery for static assets

## 🛣️ Roadmap

### Sprint 2 (Completed) ✅
- [x] Word Source API implementation
- [x] Comprehensive testing suite
- [x] API documentation with Swagger
- [x] CI/CD pipeline setup

### Sprint 3 (Completed) ✅
- [x] Frontend integration with Word Source API
- [x] Real-time typing game implementation
- [x] User performance analytics
- [x] Responsive UI components
- [x] Interactive configuration controls
- [x] Loading states and error handling
- [x] Comprehensive test coverage

### Future Sprints 📋
- [ ] AI-powered challenge generation
- [ ] Advanced performance metrics
- [ ] Social features and leaderboards
- [ ] Mobile app development
- [ ] Multiplayer typing competitions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Fastify](https://www.fastify.io/) - Fast and low overhead web framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM for Node.js
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Anthropic](https://www.anthropic.com/) - AI-powered text generation

## 📞 Support

- **Documentation**: [docs.typeamp.com](https://docs.typeamp.com)
- **Issues**: [GitHub Issues](https://github.com/typeamp/typeamp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/typeamp/typeamp/discussions)
- **Email**: support@typeamp.com

---

<p align="center">
  Made with ❤️ by the TypeAmp Team
</p>