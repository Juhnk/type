import type { Meta, StoryObj } from '@storybook/nextjs';
import { Header } from '@/components/layout/Header';

const meta = {
  title: 'Components/Layout/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Main navigation header for the TypeAmp application with authentication state management.',
      },
    },
  },
  tags: ['layout', 'navigation', 'autodocs'],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default state (not authenticated)
export const Default: Story = {
  parameters: {
    mockStore: {
      auth: {
        user: null,
        token: null,
      },
    },
  },
};

// Authenticated user
export const Authenticated: Story = {
  parameters: {
    mockStore: {
      auth: {
        user: {
          id: '1',
          username: 'speedtyper',
          email: 'user@example.com',
        },
        token: 'mock-token',
      },
    },
    docs: {
      description: {
        story: 'Header when user is logged in, showing email and logout button',
      },
    },
  },
};

// Long email address
export const LongEmailAddress: Story = {
  parameters: {
    mockStore: {
      auth: {
        user: {
          id: '1',
          username: 'professional_speed_typer',
          email: 'professional.speed.typer@example-company.com',
        },
        token: 'mock-token',
      },
    },
    docs: {
      description: {
        story: 'Header with a long email address to test text overflow',
      },
    },
  },
};

// Dark mode
export const DarkMode: Story = {
  parameters: {
    mockStore: {
      auth: {
        user: null,
        token: null,
      },
    },
  },
  globals: {
    colorScheme: 'dark',
  },
};

// Dark mode authenticated
export const DarkModeAuthenticated: Story = {
  parameters: {
    mockStore: {
      auth: {
        user: {
          id: '1',
          username: 'nighttyper',
          email: 'night@typer.com',
        },
        token: 'mock-token',
      },
    },
  },
  globals: {
    colorScheme: 'dark',
  },
};

// Different themes
export const NordTheme: Story = {
  parameters: {
    mockStore: {
      auth: {
        user: null,
        token: null,
      },
    },
  },
  globals: {
    theme: 'nord',
  },
};

export const DraculaTheme: Story = {
  parameters: {
    mockStore: {
      auth: {
        user: {
          id: '1',
          username: 'dracula_fan',
          email: 'dracula@theme.com',
        },
        token: 'mock-token',
      },
    },
  },
  globals: {
    theme: 'dracula',
  },
};

// Mobile view
export const MobileView: Story = {
  parameters: {
    mockStore: {
      auth: {
        user: null,
        token: null,
      },
    },
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'Header responsive behavior on mobile devices',
      },
    },
  },
};

// Tablet view
export const TabletView: Story = {
  parameters: {
    mockStore: {
      auth: {
        user: {
          id: '1',
          username: 'tabletuser',
          email: 'tablet@user.com',
        },
        token: 'mock-token',
      },
    },
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'Header responsive behavior on tablet devices',
      },
    },
  },
};

// With hover states
export const HoverStates: Story = {
  parameters: {
    mockStore: {
      auth: {
        user: null,
        token: null,
      },
    },
    docs: {
      description: {
        story: 'Demonstrates hover states on navigation links',
      },
    },
  },
};

// Interactive login flow
export const InteractiveLogin: Story = {
  parameters: {
    mockStore: {
      auth: {
        user: null,
        token: null,
      },
    },
    docs: {
      description: {
        story: 'Click the login button to simulate opening auth modal',
      },
    },
  },
};

// Interactive logout flow
export const InteractiveLogout: Story = {
  parameters: {
    mockStore: {
      auth: {
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@user.com',
        },
        token: 'mock-token',
      },
    },
    docs: {
      description: {
        story: 'Click the logout button to simulate logout action',
      },
    },
  },
};

// Navigation showcase
export const NavigationShowcase: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-muted-foreground mb-2 text-sm font-medium">
          Default State
        </h3>
        <Header />
      </div>

      <div>
        <h3 className="text-muted-foreground mb-2 text-sm font-medium">
          Authenticated State
        </h3>
        <div className="[&_header]:rounded-lg [&_header]:border">
          <Header />
        </div>
      </div>

      <div className="rounded-lg bg-slate-900 p-4">
        <h3 className="mb-2 text-sm font-medium text-slate-400">
          Dark Background
        </h3>
        <div className="[&_header]:rounded-lg">
          <Header />
        </div>
      </div>
    </div>
  ),
  parameters: {
    mockStore: {
      auth: {
        user: null,
        token: null,
      },
    },
    docs: {
      description: {
        story: 'Showcases the header in different contexts',
      },
    },
  },
};

// Fixed position example
export const FixedPosition: Story = {
  render: () => (
    <div className="h-[600px] overflow-y-auto">
      <div className="sticky top-0 z-50">
        <Header />
      </div>
      <div className="space-y-4 p-8">
        <p className="text-muted-foreground">
          Scroll down to see the sticky header behavior...
        </p>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="bg-muted rounded-lg p-4">
            <p>Content block {i + 1}</p>
            <p className="text-muted-foreground text-sm">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
        ))}
      </div>
    </div>
  ),
  parameters: {
    mockStore: {
      auth: {
        user: {
          id: '1',
          username: 'scrolluser',
          email: 'scroll@test.com',
        },
        token: 'mock-token',
      },
    },
    layout: 'padded',
    docs: {
      description: {
        story: 'Header with sticky positioning for scrollable content',
      },
    },
  },
};
