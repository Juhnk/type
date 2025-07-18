import type { Preview, Decorator } from '@storybook/nextjs';
import React from 'react';
import '../src/app/globals.css'; // Import Tailwind CSS
import { Inter, Roboto_Mono } from 'next/font/google';
import { withProviders } from './decorators/withProviders';
import { withMockStore } from './decorators/withMockStore';

// Font setup
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
});

// Theme decorator with proper types
const withTheme: Decorator = (Story, context) => {
  // Apply theme and color scheme based on globals
  const theme = context.globals.theme || 'slate';
  const colorScheme = context.globals.colorScheme || 'light';

  React.useEffect(() => {
    // Update theme on document root
    document.documentElement.setAttribute('data-theme', theme);

    // Apply color scheme class
    if (colorScheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else if (colorScheme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      // Auto mode - use system preference
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      document.documentElement.classList.toggle('dark', prefersDark);
      document.documentElement.classList.toggle('light', !prefersDark);
    }
  }, [theme, colorScheme]);

  return (
    <div className={`${inter.variable} ${robotoMono.variable} font-sans`}>
      <Story />
    </div>
  );
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
    docs: {
      toc: true, // Enable table of contents
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1440px',
            height: '900px',
          },
        },
      },
      defaultViewport: 'responsive',
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0f172a' },
        { name: 'slate', value: '#f8fafc' },
      ],
    },
  },
  decorators: [withTheme, withProviders, withMockStore],
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'TypeAmp theme for components',
      defaultValue: 'slate',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'slate', title: 'Slate', icon: 'circle' },
          { value: 'dark', title: 'Dark', icon: 'circle' },
          { value: 'nord', title: 'Nord', icon: 'circle' },
          { value: 'dracula', title: 'Dracula', icon: 'circle' },
          { value: 'monokai', title: 'Monokai', icon: 'circle' },
          { value: 'ocean', title: 'Ocean', icon: 'circle' },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
    colorScheme: {
      name: 'Color Scheme',
      description: 'Light/Dark mode preference',
      defaultValue: 'light',
      toolbar: {
        icon: 'sun',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
          { value: 'auto', title: 'Auto', icon: 'browser' },
        ],
        showName: true,
      },
    },
  },
  tags: ['autodocs'], // Enable auto-generated documentation
};

export default preview;
