import type { Meta, StoryObj } from '@storybook/nextjs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, Target, TrendingUp } from 'lucide-react';

const meta = {
  title: 'Components/UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A card component with header, content, and footer sections.',
      },
    },
  },
  tags: ['ui', 'layout', 'autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic card
export const Default: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content can contain any React components or HTML elements.</p>
      </CardContent>
    </Card>
  ),
};

// Card with footer
export const WithFooter: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>Manage your account preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Update your profile information and preferences here.</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
  ),
};

// Stats card example
export const StatsCard: Story = {
  render: () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Average WPM</CardTitle>
        <Activity className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">72.4</div>
        <p className="text-muted-foreground text-xs">
          <TrendingUp className="inline h-3 w-3 text-green-500" /> +12% from
          last week
        </p>
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of a statistics card used in the TypeAmp dashboard',
      },
    },
  },
};

// Game result card
export const GameResultCard: Story = {
  render: () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Test Complete!
          <Badge variant="default">New Record!</Badge>
        </CardTitle>
        <CardDescription>
          Great job! You've improved your speed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">Speed</p>
            <p className="text-2xl font-bold">85 WPM</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">Accuracy</p>
            <p className="text-2xl font-bold">97.5%</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">Time</p>
            <p className="text-2xl font-bold">1:00</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">Characters</p>
            <p className="text-2xl font-bold">425</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button className="flex-1">Try Again</Button>
        <Button variant="outline" className="flex-1">
          Share Results
        </Button>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Game result card showing typing test statistics',
      },
    },
  },
};

// Settings card
export const SettingsCard: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Test Duration
        </CardTitle>
        <CardDescription>
          Choose how long you want your typing test to last
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm">
            15s
          </Button>
          <Button variant="outline" size="sm">
            30s
          </Button>
          <Button variant="default" size="sm">
            60s
          </Button>
          <Button variant="outline" size="sm">
            120s
          </Button>
        </div>
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Settings card for configuring typing test options',
      },
    },
  },
};

// Dark mode card
export const DarkMode: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Dark Mode Card</CardTitle>
        <CardDescription>This card is displayed in dark mode</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Cards automatically adapt to the current theme.</p>
      </CardContent>
    </Card>
  ),
  globals: {
    theme: 'dark',
  },
};
