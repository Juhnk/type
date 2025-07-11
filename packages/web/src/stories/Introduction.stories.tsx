export default {
  title: 'Introduction',
};

export const Welcome = () => (
  <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
    <h1>TypeAmp Component Library</h1>
    <p>
      Welcome to the TypeAmp component library and design system documentation.
    </p>

    <h2>Overview</h2>
    <p>TypeAmp is a modern typing practice application built with:</p>
    <ul>
      <li>
        <strong>Next.js 15</strong> - React framework with App Router
      </li>
      <li>
        <strong>React 19</strong> - Latest React features
      </li>
      <li>
        <strong>TypeScript</strong> - Type-safe development
      </li>
      <li>
        <strong>Tailwind CSS v4</strong> - Utility-first styling
      </li>
      <li>
        <strong>shadcn/ui</strong> - Beautifully designed components
      </li>
    </ul>

    <h2>Design Principles</h2>
    <ol>
      <li>
        <strong>Performance First</strong> - Optimized for 60+ FPS typing
        experience
      </li>
      <li>
        <strong>Accessibility</strong> - WCAG 2.1 AA compliant
      </li>
      <li>
        <strong>Responsive</strong> - Mobile-first design approach
      </li>
      <li>
        <strong>Themeable</strong> - Support for light/dark modes and custom
        themes
      </li>
      <li>
        <strong>Developer Experience</strong> - Well-documented, type-safe
        components
      </li>
    </ol>

    <h2>Getting Started</h2>
    <pre
      style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}
    >
      <code>{`// Import components
import { Button } from '@/components/ui/button';

// Use in your app
<Button variant="default">Start Typing</Button>`}</code>
    </pre>
  </div>
);
