import type { Meta, StoryObj } from '@storybook/nextjs';
import { Input } from '@/components/ui/input';
import {
  Search as SearchIcon,
  Mail,
  Lock,
  User,
  DollarSign,
  Calendar,
  Eye,
  EyeOff,
} from 'lucide-react';
import React from 'react';

const meta = {
  title: 'Components/UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A basic input field component with various states and configurations. Supports all standard HTML input types.',
      },
    },
  },
  tags: ['ui', 'form', 'interactive', 'autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: [
        'text',
        'email',
        'password',
        'number',
        'tel',
        'url',
        'search',
        'date',
        'time',
      ],
      description: 'The type of input field',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'text' },
      },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    required: {
      control: 'boolean',
      description: 'Whether the input is required',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic examples
export const Default: Story = {
  args: {
    type: 'text',
    placeholder: 'Enter text...',
  },
};

export const WithValue: Story = {
  args: {
    type: 'text',
    defaultValue: 'Sample text',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter your email...',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password...',
  },
};

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: 'Enter number...',
    min: 0,
    max: 100,
  },
};

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
};

// States
export const Disabled: Story = {
  args: {
    type: 'text',
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const Required: Story = {
  args: {
    type: 'text',
    placeholder: 'Required field',
    required: true,
  },
};

export const Invalid: Story = {
  args: {
    type: 'email',
    placeholder: 'Invalid email',
    defaultValue: 'invalid-email',
    'aria-invalid': true,
  },
};

// With icons (using wrapper)
export const WithIconLeft: Story = {
  render: () => (
    <div className="relative">
      <SearchIcon className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
      <Input type="search" placeholder="Search..." className="pl-8" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Input with icon on the left side',
      },
    },
  },
};

export const WithIconRight: Story = {
  render: () => (
    <div className="relative">
      <Input type="email" placeholder="Email address" className="pr-8" />
      <Mail className="text-muted-foreground absolute top-2.5 right-2 h-4 w-4" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Input with icon on the right side',
      },
    },
  },
};

// Password with toggle
export const PasswordWithToggle: Story = {
  render: () => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter password..."
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute top-2.5 right-2"
        >
          {showPassword ? (
            <EyeOff className="text-muted-foreground h-4 w-4" />
          ) : (
            <Eye className="text-muted-foreground h-4 w-4" />
          )}
        </button>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Password input with visibility toggle',
      },
    },
  },
};

// TypeAmp specific inputs
export const UsernameInput: Story = {
  render: () => (
    <div className="relative">
      <User className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
      <Input type="text" placeholder="Choose a username..." className="pl-8" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Username input for profile creation',
      },
    },
  },
};

export const WPMGoalInput: Story = {
  args: {
    type: 'number',
    placeholder: 'Target WPM',
    min: 0,
    max: 200,
    defaultValue: 60,
  },
  parameters: {
    docs: {
      description: {
        story: 'Input for setting WPM goals',
      },
    },
  },
};

export const CustomWordsInput: Story = {
  args: {
    type: 'text',
    placeholder: 'Enter custom words separated by spaces...',
    className: 'w-96',
  },
  parameters: {
    docs: {
      description: {
        story: 'Input for entering custom practice words',
      },
    },
  },
};

// Dark mode
export const DarkMode: Story = {
  args: {
    type: 'text',
    placeholder: 'Dark mode input',
  },
  globals: {
    colorScheme: 'dark',
  },
};

// Different sizes
export const Small: Story = {
  args: {
    type: 'text',
    placeholder: 'Small input',
    className: 'h-8 text-xs',
  },
};

export const Large: Story = {
  args: {
    type: 'text',
    placeholder: 'Large input',
    className: 'h-12 text-lg px-4',
  },
};

// Form example
export const FormExample: Story = {
  render: () => (
    <form className="w-80 space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <Input
          id="password"
          type="password"
          placeholder="Enter password"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="wpm" className="text-sm font-medium">
          Target WPM
        </label>
        <Input id="wpm" type="number" placeholder="60" min={0} max={200} />
      </div>
    </form>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete form example with multiple inputs',
      },
    },
  },
};

// With validation styling
export const ValidationStates: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <Input
        type="text"
        placeholder="Valid input"
        defaultValue="Valid content"
        className="border-green-500 focus-visible:border-green-500"
      />
      <Input
        type="text"
        placeholder="Invalid input"
        defaultValue="Invalid content"
        aria-invalid="true"
      />
      <Input
        type="text"
        placeholder="Warning input"
        defaultValue="Warning content"
        className="border-yellow-500 focus-visible:border-yellow-500"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Inputs with different validation states',
      },
    },
  },
};
