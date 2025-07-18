import type { Meta, StoryObj } from '@storybook/nextjs';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  X,
  AlertCircle,
  Info,
  Trophy,
  Star,
  Zap,
  TrendingUp,
} from 'lucide-react';

const meta = {
  title: 'Components/UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Displays a badge component with various visual styles. Perfect for status indicators, tags, and labels.',
      },
    },
  },
  tags: ['ui', 'status', 'autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
      description: 'The visual style of the badge',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    asChild: {
      control: 'boolean',
      description:
        'Change the default rendered element for the one passed as a child',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variants
export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Destructive',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
};

// With icons
export const WithCheckIcon: Story = {
  args: {
    variant: 'default',
    children: (
      <>
        <Check className="h-3 w-3" />
        Success
      </>
    ),
  },
};

export const WithErrorIcon: Story = {
  args: {
    variant: 'destructive',
    children: (
      <>
        <X className="h-3 w-3" />
        Error
      </>
    ),
  },
};

export const WithInfoIcon: Story = {
  args: {
    variant: 'secondary',
    children: (
      <>
        <Info className="h-3 w-3" />
        Information
      </>
    ),
  },
};

export const WithWarningIcon: Story = {
  args: {
    variant: 'outline',
    children: (
      <>
        <AlertCircle className="h-3 w-3" />
        Warning
      </>
    ),
  },
};

// Game-specific badges
export const NewRecord: Story = {
  args: {
    variant: 'default',
    children: (
      <>
        <Trophy className="h-3 w-3" />
        New Record!
      </>
    ),
    className: 'bg-gradient-to-r from-yellow-500 to-orange-500',
  },
  parameters: {
    docs: {
      description: {
        story: 'Badge shown when user achieves a new personal record',
      },
    },
  },
};

export const Streak: Story = {
  args: {
    variant: 'secondary',
    children: (
      <>
        <Zap className="h-3 w-3" />5 Day Streak
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "Badge showing user's current practice streak",
      },
    },
  },
};

export const Improvement: Story = {
  args: {
    variant: 'outline',
    children: (
      <>
        <TrendingUp className="h-3 w-3" />
        +15% WPM
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Badge showing performance improvement',
      },
    },
  },
};

export const Achievement: Story = {
  args: {
    variant: 'default',
    children: (
      <>
        <Star className="h-3 w-3" />
        Speed Demon
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Achievement badge for reaching typing milestones',
      },
    },
  },
};

// Status badges
export const StatusOnline: Story = {
  args: {
    variant: 'default',
    children: 'Online',
    className: 'bg-success',
  },
};

export const StatusOffline: Story = {
  args: {
    variant: 'secondary',
    children: 'Offline',
  },
};

export const StatusBusy: Story = {
  args: {
    variant: 'outline',
    children: 'In Game',
    className: 'border-warning text-warning',
  },
};

// Difficulty badges
export const DifficultyEasy: Story = {
  args: {
    variant: 'secondary',
    children: 'Easy',
    className: 'bg-success-soft text-success',
  },
};

export const DifficultyMedium: Story = {
  args: {
    variant: 'secondary',
    children: 'Medium',
    className: 'bg-warning-soft text-warning',
  },
};

export const DifficultyHard: Story = {
  args: {
    variant: 'secondary',
    children: 'Hard',
    className: 'bg-error-soft text-error',
  },
};

// Dark mode example
export const DarkMode: Story = {
  args: {
    variant: 'default',
    children: 'Dark Mode Badge',
  },
  globals: {
    colorScheme: 'dark',
  },
};

// As link
export const AsLink: Story = {
  args: {
    asChild: true,
    variant: 'outline',
    children: (
      <a href="#" className="cursor-pointer">
        View Profile
      </a>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Badge rendered as a clickable link using asChild prop',
      },
    },
  },
};

// Multiple badges showcase
export const BadgeGroup: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
        <Star className="h-3 w-3" />
        Custom
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple badges displayed together',
      },
    },
  },
};

// Typing stats badges
export const WPMBadge: Story = {
  args: {
    variant: 'secondary',
    children: '85 WPM',
  },
  parameters: {
    docs: {
      description: {
        story: 'Badge displaying words per minute',
      },
    },
  },
};

export const AccuracyBadge: Story = {
  args: {
    variant: 'outline',
    children: '98.5%',
    className: 'border-success text-success',
  },
  parameters: {
    docs: {
      description: {
        story: 'Badge displaying typing accuracy',
      },
    },
  },
};
