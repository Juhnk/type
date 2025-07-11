import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from '@/components/ui/switch';
import {
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Zap,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  WifiOff,
  Wifi,
  PlayCircle,
  PauseCircle,
} from 'lucide-react';
import React from 'react';

const meta = {
  title: 'Components/UI/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A toggle switch component built with Radix UI. Used for binary on/off settings.',
      },
    },
  },
  tags: ['ui', 'form', 'interactive', 'autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'The controlled checked state of the switch',
      table: {
        type: { summary: 'boolean' },
      },
    },
    defaultChecked: {
      control: 'boolean',
      description: 'The default checked state when uncontrolled',
      table: {
        type: { summary: 'boolean' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the switch is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    required: {
      control: 'boolean',
      description: 'Whether the switch is required',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic examples
export const Default: Story = {
  args: {},
};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
};

// With labels
export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <label
        htmlFor="airplane-mode"
        className="cursor-pointer text-sm font-medium"
      >
        Airplane Mode
      </label>
    </div>
  ),
};

export const WithLabelAndDescription: Story = {
  render: () => (
    <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
      <div className="space-y-0.5">
        <label
          htmlFor="marketing"
          className="cursor-pointer text-sm font-medium"
        >
          Marketing emails
        </label>
        <p className="text-muted-foreground text-sm">
          Receive emails about new products, features, and more.
        </p>
      </div>
      <Switch id="marketing" />
    </div>
  ),
};

// TypeAmp settings switches
export const SoundEffects: Story = {
  render: () => {
    const [enabled, setEnabled] = React.useState(false);

    return (
      <div className="flex items-center space-x-2">
        {enabled ? (
          <Volume2 className="text-muted-foreground h-4 w-4" />
        ) : (
          <VolumeX className="text-muted-foreground h-4 w-4" />
        )}
        <Switch
          id="sound-effects"
          checked={enabled}
          onCheckedChange={setEnabled}
        />
        <label
          htmlFor="sound-effects"
          className="cursor-pointer text-sm font-medium"
        >
          Sound Effects
        </label>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Toggle sound effects with dynamic icon',
      },
    },
  },
};

export const DarkModeToggle: Story = {
  render: () => {
    const [isDark, setIsDark] = React.useState(false);

    return (
      <div className="flex items-center space-x-2">
        {isDark ? (
          <Moon className="text-muted-foreground h-4 w-4" />
        ) : (
          <Sun className="text-muted-foreground h-4 w-4" />
        )}
        <Switch id="dark-mode" checked={isDark} onCheckedChange={setIsDark} />
        <label
          htmlFor="dark-mode"
          className="cursor-pointer text-sm font-medium"
        >
          Dark Mode
        </label>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Dark mode toggle with sun/moon icons',
      },
    },
  },
};

export const AnimationsToggle: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Zap className="text-muted-foreground h-4 w-4" />
      <Switch id="animations" defaultChecked />
      <label
        htmlFor="animations"
        className="cursor-pointer text-sm font-medium"
      >
        Smooth Animations
      </label>
    </div>
  ),
};

export const BlindModeToggle: Story = {
  render: () => {
    const [enabled, setEnabled] = React.useState(false);

    return (
      <div className="flex items-center space-x-2">
        {enabled ? (
          <EyeOff className="text-muted-foreground h-4 w-4" />
        ) : (
          <Eye className="text-muted-foreground h-4 w-4" />
        )}
        <Switch
          id="blind-mode"
          checked={enabled}
          onCheckedChange={setEnabled}
        />
        <label
          htmlFor="blind-mode"
          className="cursor-pointer text-sm font-medium"
        >
          Blind Mode
        </label>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Toggle blind mode for advanced practice',
      },
    },
  },
};

// Settings form
export const SettingsForm: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <h3 className="text-lg font-semibold">Behavior Settings</h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="sound" className="cursor-pointer text-sm font-medium">
            Sound Effects
          </label>
          <Switch id="sound" />
        </div>

        <div className="flex items-center justify-between">
          <label
            htmlFor="animations"
            className="cursor-pointer text-sm font-medium"
          >
            Animations
          </label>
          <Switch id="animations" defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <label
            htmlFor="auto-save"
            className="cursor-pointer text-sm font-medium"
          >
            Auto Save
          </label>
          <Switch id="auto-save" defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <label
            htmlFor="quick-restart"
            className="cursor-pointer text-sm font-medium"
          >
            Quick Restart
          </label>
          <Switch id="quick-restart" defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <label
            htmlFor="focus-mode"
            className="cursor-pointer text-sm font-medium"
          >
            Focus Mode
          </label>
          <Switch id="focus-mode" />
        </div>

        <div className="flex items-center justify-between">
          <label
            htmlFor="blind-mode"
            className="cursor-pointer text-sm font-medium"
          >
            Blind Mode
          </label>
          <Switch id="blind-mode" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete settings form with multiple switches',
      },
    },
  },
};

// Notification preferences
export const NotificationPreferences: Story = {
  render: () => (
    <div className="space-y-3 rounded-lg border p-4">
      <h4 className="text-sm font-semibold">Notifications</h4>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="text-muted-foreground h-4 w-4" />
            <span className="text-sm">New Records</span>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="text-muted-foreground h-4 w-4" />
            <span className="text-sm">Daily Reminders</span>
          </div>
          <Switch />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="text-muted-foreground h-4 w-4" />
            <span className="text-sm">Weekly Reports</span>
          </div>
          <Switch defaultChecked />
        </div>
      </div>
    </div>
  ),
};

// Connection status
export const ConnectionStatus: Story = {
  render: () => {
    const [isOnline, setIsOnline] = React.useState(true);

    return (
      <div className="bg-muted/50 flex items-center space-x-2 rounded-lg p-3">
        {isOnline ? (
          <Wifi className="h-4 w-4 text-green-600" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-600" />
        )}
        <span className="text-sm font-medium">
          {isOnline ? 'Online' : 'Offline'}
        </span>
        <Switch
          checked={isOnline}
          onCheckedChange={setIsOnline}
          className="ml-auto"
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Connection status toggle with dynamic styling',
      },
    },
  },
};

// Custom styled
export const CustomStyled: Story = {
  render: () => (
    <div className="space-y-3">
      <Switch className="data-[state=checked]:bg-green-500" />
      <Switch className="data-[state=checked]:bg-purple-500" />
      <Switch className="data-[state=checked]:bg-orange-500" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Switches with custom colors',
      },
    },
  },
};

// Dark mode
export const DarkMode: Story = {
  args: {
    defaultChecked: true,
  },
  globals: {
    colorScheme: 'dark',
  },
};

// Size variations
export const SizeVariations: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <div className="flex flex-col items-center space-y-2">
        <Switch className="scale-75" />
        <span className="text-muted-foreground text-xs">Small</span>
      </div>
      <div className="flex flex-col items-center space-y-2">
        <Switch />
        <span className="text-muted-foreground text-xs">Default</span>
      </div>
      <div className="flex flex-col items-center space-y-2">
        <Switch className="scale-125" />
        <span className="text-muted-foreground text-xs">Large</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different switch sizes using scale',
      },
    },
  },
};
