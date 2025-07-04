# Contributing to TypeAmp 🤝

Thank you for your interest in contributing to TypeAmp! This guide will help you get started with contributing to our typing game platform.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Community](#community)

## 📜 Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [conduct@typeamp.com](mailto:conduct@typeamp.com).

## 🚀 Getting Started

### Ways to Contribute

- 🐛 **Report bugs** by opening an issue
- 💡 **Suggest features** through feature requests
- 📖 **Improve documentation** 
- 🧪 **Write tests** to increase coverage
- 🎨 **Enhance UI/UX** with design improvements
- ⚡ **Optimize performance** 
- 🔒 **Improve security**
- 🌐 **Add internationalization**

### Before You Start

1. **Search existing issues** to avoid duplicates
2. **Check the roadmap** to see planned features
3. **Join our discussions** for major changes
4. **Read the documentation** thoroughly

## 🛠️ Development Setup

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+ 
- **PostgreSQL** 14+
- **Git** 2.30+

### Local Development

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/typeamp.git
   cd typeamp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # API environment
   cp packages/api/.env.example packages/api/.env
   
   # Web environment  
   cp packages/web/.env.example packages/web/.env.local
   ```

4. **Set up the database**
   ```bash
   cd packages/api
   npm run db:migrate
   npm run db:seed
   ```

5. **Start development servers**
   ```bash
   # From root directory
   npm run dev
   ```

6. **Verify setup**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3003
   - API Docs: http://localhost:3003/docs

### Development Tools

**Recommended VS Code Extensions**
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- Prisma
- Git Lens

**Browser Extensions**
- React Developer Tools
- Redux DevTools (if using Redux)

## 📝 Contributing Guidelines

### Issue Guidelines

**Bug Reports**
- Use the bug report template
- Include clear reproduction steps
- Provide environment details
- Add screenshots/videos if applicable

**Feature Requests**
- Use the feature request template
- Explain the problem you're solving
- Describe your proposed solution
- Consider implementation complexity

### Branch Naming Convention

```bash
# Feature branches
feature/add-word-categories
feature/improve-typing-analytics

# Bug fixes
fix/authentication-timeout
fix/api-cors-headers

# Documentation
docs/api-documentation
docs/setup-guide

# Performance improvements
perf/optimize-word-loading
perf/reduce-bundle-size

# Refactoring
refactor/extract-typing-logic
refactor/simplify-state-management
```

### Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) for standardized commit messages:

```bash
# Format
<type>[optional scope]: <description>

# Examples
feat(api): add word filtering by difficulty
fix(web): resolve authentication redirect loop
docs: update API documentation
test(api): add integration tests for word endpoints
perf(web): optimize component re-renders
refactor(api): extract validation logic
chore(deps): update dependencies
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvements
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to build process or auxiliary tools

## 🔄 Pull Request Process

### 1. Preparation

```bash
# Create and switch to your feature branch
git checkout -b feature/your-feature-name

# Keep your branch up to date
git fetch origin
git rebase origin/main
```

### 2. Development

- Write clean, readable code
- Follow coding standards
- Add comprehensive tests
- Update documentation
- Ensure all checks pass

### 3. Testing

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Run type checking
npm run type-check
```

### 4. Pre-submission Checklist

- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or properly documented)
- [ ] Commits follow conventional format

### 5. Opening the PR

- Use the PR template
- Link related issues
- Add clear description
- Include screenshots/demos
- Request appropriate reviewers

### 6. Review Process

- Address review feedback promptly
- Keep discussions respectful
- Update tests if needed
- Rebase if requested

### 7. Merge

- Squash commits if requested
- Ensure CI passes
- Wait for approval from maintainers

## 🎯 Coding Standards

### TypeScript

```typescript
// ✅ Good: Explicit types, clear interfaces
interface TypingResult {
  wpm: number;
  accuracy: number;
  duration: number;
}

function calculateWPM(
  totalCharacters: number,
  timeInMinutes: number
): number {
  return Math.round(totalCharacters / 5 / timeInMinutes);
}

// ❌ Bad: Implicit any, unclear types
function calculate(chars, time) {
  return chars / 5 / time;
}
```

### React Components

```tsx
// ✅ Good: Functional component with proper typing
interface TypingGameProps {
  wordList: string[];
  onComplete: (result: TypingResult) => void;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export const TypingGame: React.FC<TypingGameProps> = ({
  wordList,
  onComplete,
  difficulty = 'medium'
}) => {
  // Component implementation
};

// ❌ Bad: No types, unclear props
export const TypingGame = ({ wordList, onComplete, difficulty }) => {
  // Implementation
};
```

### API Routes

```typescript
// ✅ Good: Proper error handling, typed responses
export async function wordsHandler(
  request: FastifyRequest<{ Querystring: WordsQuery }>,
  reply: FastifyReply
) {
  try {
    const { list = 'english1k', limit = 100 } = request.query;
    
    const words = await getWords(list, limit);
    
    return reply.status(200).send({
      words,
      metadata: { count: words.length, list }
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
}
```

### Styling

```tsx
// ✅ Good: Tailwind with semantic classes
<div className="flex flex-col space-y-4 p-6 bg-white rounded-lg shadow-md">
  <h2 className="text-2xl font-bold text-gray-900">Typing Results</h2>
  <div className="grid grid-cols-2 gap-4">
    <StatCard label="WPM" value={wpm} />
    <StatCard label="Accuracy" value={accuracy} />
  </div>
</div>

// ❌ Bad: Inline styles, unclear structure
<div style={{ padding: '24px', backgroundColor: 'white' }}>
  <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Results</h2>
</div>
```

## 🧪 Testing Requirements

### Coverage Requirements

- **Minimum**: 80% overall coverage
- **Preferred**: 90%+ for critical paths
- **Required**: 100% for utility functions

### Testing Structure

```typescript
// Unit Tests
describe('calculateWPM', () => {
  it('should calculate WPM correctly', () => {
    expect(calculateWPM(300, 5)).toBe(12);
  });

  it('should handle zero time gracefully', () => {
    expect(calculateWPM(300, 0)).toBe(0);
  });
});

// Integration Tests
describe('Words API', () => {
  it('should return words with correct format', async () => {
    const response = await request(app)
      .get('/api/words?list=english1k&limit=10')
      .expect(200);

    expect(response.body).toMatchSchema(wordsResponseSchema);
  });
});

// Component Tests
describe('TypingGame', () => {
  it('should render word list correctly', () => {
    render(<TypingGame wordList={testWords} onComplete={jest.fn()} />);
    
    expect(screen.getByText(testWords[0])).toBeInTheDocument();
  });
});
```

### Test Categories

**Unit Tests** - Individual functions/components
```bash
npm run test:unit
```

**Integration Tests** - API endpoints, component integration
```bash
npm run test:integration
```

**E2E Tests** - Complete user workflows
```bash
npm run test:e2e
```

## 📚 Documentation

### Code Documentation

```typescript
/**
 * Calculates typing speed in Words Per Minute (WPM)
 * 
 * @param totalCharacters - Total characters typed (including spaces)
 * @param timeInMinutes - Time taken in minutes
 * @returns WPM rounded to nearest integer
 * 
 * @example
 * ```typescript
 * const wpm = calculateWPM(300, 5); // Returns 12
 * ```
 */
export function calculateWPM(
  totalCharacters: number, 
  timeInMinutes: number
): number {
  if (timeInMinutes <= 0) return 0;
  return Math.round(totalCharacters / 5 / timeInMinutes);
}
```

### API Documentation

All API endpoints must include:
- OpenAPI/Swagger documentation
- Request/response examples
- Error scenarios
- Usage examples

### README Updates

When adding features, update:
- Feature list
- Installation instructions
- Usage examples
- Configuration options

## 🏆 Recognition

Contributors will be recognized in:
- README contributors section
- Release notes
- GitHub contributor graphs
- Special mentions for significant contributions

### Contribution Levels

**🌟 Contributor**: 1+ merged PR
**⭐ Regular Contributor**: 5+ merged PRs
**🏅 Core Contributor**: 20+ merged PRs + active in community
**👑 Maintainer**: Invited based on consistent high-quality contributions

## 🤔 Need Help?

### Getting Support

1. **Check Documentation**: Start with README and this guide
2. **Search Issues**: Look for existing discussions
3. **Ask Questions**: Open a discussion for help
4. **Join Discord**: Real-time chat with the community
5. **Email**: [developers@typeamp.com](mailto:developers@typeamp.com)

### Mentorship

New contributors can request mentorship for:
- First-time contributions
- Complex features
- Architecture decisions
- Career development

## 📞 Contact

- **General Questions**: [hello@typeamp.com](mailto:hello@typeamp.com)
- **Technical Support**: [developers@typeamp.com](mailto:developers@typeamp.com)
- **Security Issues**: [security@typeamp.com](mailto:security@typeamp.com)
- **Code of Conduct**: [conduct@typeamp.com](mailto:conduct@typeamp.com)

---

Thank you for contributing to TypeAmp! Your efforts help make typing practice better for everyone. 🎉