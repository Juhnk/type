import type { Meta, StoryObj } from '@storybook/react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Globe,
  Monitor,
  Moon,
  Sun,
  Zap,
  Clock,
  Target,
  Keyboard,
} from 'lucide-react';
import React from 'react';

const meta = {
  title: 'Components/UI/Select',
  component: Select,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A dropdown select component built with Radix UI. Provides keyboard navigation and accessibility features.',
      },
    },
  },
  tags: ['ui', 'form', 'interactive', 'autodocs'],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic example
export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

// With default value
export const WithDefaultValue: Story = {
  render: () => (
    <Select defaultValue="option2">
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

// Disabled state
export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Disabled select" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
      </SelectContent>
    </Select>
  ),
};

// With groups
export const WithGroups: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="orange">Orange</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Vegetables</SelectLabel>
          <SelectItem value="carrot">Carrot</SelectItem>
          <SelectItem value="broccoli">Broccoli</SelectItem>
          <SelectItem value="spinach">Spinach</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

// Theme selector
export const ThemeSelector: Story = {
  render: () => (
    <Select defaultValue="slate">
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="slate">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-slate-500" />
            Slate
          </div>
        </SelectItem>
        <SelectItem value="dark">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gray-900" />
            Dark
          </div>
        </SelectItem>
        <SelectItem value="nord">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-600" />
            Nord
          </div>
        </SelectItem>
        <SelectItem value="dracula">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-purple-600" />
            Dracula
          </div>
        </SelectItem>
        <SelectItem value="monokai">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-600" />
            Monokai
          </div>
        </SelectItem>
        <SelectItem value="ocean">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-teal-600" />
            Ocean
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Theme selector for TypeAmp appearance settings',
      },
    },
  },
};

// Game mode selector
export const GameModeSelector: Story = {
  render: () => (
    <Select defaultValue="time">
      <SelectTrigger className="w-[200px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="time">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time Mode
          </div>
        </SelectItem>
        <SelectItem value="words">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Words Mode
          </div>
        </SelectItem>
        <SelectItem value="quote">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Quote Mode
          </div>
        </SelectItem>
        <SelectItem value="zen">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Zen Mode
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Game mode selector with icons',
      },
    },
  },
};

// Difficulty selector
export const DifficultySelector: Story = {
  render: () => (
    <Select defaultValue="normal">
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="easy">
          <span className="text-green-600">Easy</span>
        </SelectItem>
        <SelectItem value="normal">
          <span className="text-blue-600">Normal</span>
        </SelectItem>
        <SelectItem value="hard">
          <span className="text-orange-600">Hard</span>
        </SelectItem>
        <SelectItem value="expert">
          <span className="text-red-600">Expert</span>
        </SelectItem>
      </SelectContent>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Difficulty level selector with color-coded options',
      },
    },
  },
};

// Font selector
export const FontSelector: Story = {
  render: () => (
    <Select defaultValue="roboto-mono">
      <SelectTrigger className="w-[200px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Monospace</SelectLabel>
          <SelectItem value="roboto-mono">
            <span style={{ fontFamily: 'Roboto Mono' }}>Roboto Mono</span>
          </SelectItem>
          <SelectItem value="jetbrains-mono">
            <span style={{ fontFamily: 'monospace' }}>JetBrains Mono</span>
          </SelectItem>
          <SelectItem value="fira-code">
            <span style={{ fontFamily: 'monospace' }}>Fira Code</span>
          </SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Sans Serif</SelectLabel>
          <SelectItem value="inter">
            <span style={{ fontFamily: 'Inter' }}>Inter</span>
          </SelectItem>
          <SelectItem value="roboto">
            <span style={{ fontFamily: 'sans-serif' }}>Roboto</span>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Font family selector with preview',
      },
    },
  },
};

// Duration selector
export const DurationSelector: Story = {
  render: () => (
    <Select defaultValue="60">
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="15">15 seconds</SelectItem>
        <SelectItem value="30">30 seconds</SelectItem>
        <SelectItem value="60">1 minute</SelectItem>
        <SelectItem value="120">2 minutes</SelectItem>
        <SelectItem value="300">5 minutes</SelectItem>
        <SelectItem value="600">10 minutes</SelectItem>
      </SelectContent>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Test duration selector',
      },
    },
  },
};

// Language selector
export const LanguageSelector: Story = {
  render: () => (
    <Select defaultValue="english">
      <SelectTrigger className="w-[200px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="english">🇺🇸 English</SelectItem>
        <SelectItem value="spanish">🇪🇸 Spanish</SelectItem>
        <SelectItem value="french">🇫🇷 French</SelectItem>
        <SelectItem value="german">🇩🇪 German</SelectItem>
        <SelectItem value="italian">🇮🇹 Italian</SelectItem>
        <SelectItem value="portuguese">🇵🇹 Portuguese</SelectItem>
        <SelectItem value="russian">🇷🇺 Russian</SelectItem>
        <SelectItem value="japanese">🇯🇵 Japanese</SelectItem>
        <SelectItem value="korean">🇰🇷 Korean</SelectItem>
        <SelectItem value="chinese">🇨🇳 Chinese</SelectItem>
      </SelectContent>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Language selector with flag emojis',
      },
    },
  },
};

// Small size
export const SmallSize: Story = {
  render: () => (
    <Select>
      <SelectTrigger size="sm" className="w-[140px]">
        <SelectValue placeholder="Small select" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

// Dark mode
export const DarkMode: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
  globals: {
    colorScheme: 'dark',
  },
};

// Form example
export const FormExample: Story = {
  render: () => (
    <form className="w-80 space-y-4">
      <div className="space-y-2">
        <label htmlFor="mode" className="text-sm font-medium">
          Game Mode
        </label>
        <Select defaultValue="time">
          <SelectTrigger id="mode" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="time">Time Mode</SelectItem>
            <SelectItem value="words">Words Mode</SelectItem>
            <SelectItem value="quote">Quote Mode</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label htmlFor="difficulty" className="text-sm font-medium">
          Difficulty
        </label>
        <Select defaultValue="normal">
          <SelectTrigger id="difficulty" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label htmlFor="duration" className="text-sm font-medium">
          Duration
        </label>
        <Select defaultValue="60">
          <SelectTrigger id="duration" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30 seconds</SelectItem>
            <SelectItem value="60">1 minute</SelectItem>
            <SelectItem value="120">2 minutes</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </form>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete form example with multiple selects',
      },
    },
  },
};
