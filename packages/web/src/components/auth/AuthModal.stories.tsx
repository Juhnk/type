import type { Meta, StoryObj } from '@storybook/react';
import { AuthModal } from './AuthModal';

const meta = {
  title: 'Components/Auth/AuthModal',
  component: AuthModal,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Authentication modal with login and registration forms. This story keeps the modal open for visual debugging and styling verification.',
      },
    },
  },
  tags: ['auth', 'modal', 'forms', 'autodocs'],
  // Default render function to ensure proper modal container for Storybook
  render: () => (
    <div
      id="modal-root"
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <div style={{ padding: '2rem', background: '#f8fafc' }}>
        <h3 style={{ marginBottom: '1rem' }}>Background Content</h3>
        <p>
          This content should be visible behind the modal overlay to demonstrate
          proper backdrop functionality.
        </p>
      </div>
      <AuthModal />
    </div>
  ),
} satisfies Meta<typeof AuthModal>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story - Modal open on login tab
export const OpenLoginTab: Story = {
  parameters: {
    mockStore: {
      modal: {
        isAuthModalOpen: true,
      },
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      },
    },
    docs: {
      description: {
        story:
          'Modal open on the login tab - default state for debugging styling issues',
      },
    },
  },
};

// Modal open on register tab
export const OpenRegisterTab: Story = {
  parameters: {
    mockStore: {
      modal: {
        isAuthModalOpen: true,
      },
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      },
    },
    docs: {
      description: {
        story: 'Modal open on the register tab to test both form layouts',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Simulate clicking the register tab
    const registerTab = canvasElement.querySelector('[value="register"]');
    if (registerTab) {
      (registerTab as HTMLElement).click();
    }
  },
};

// Dark mode testing
export const DarkMode: Story = {
  parameters: {
    mockStore: {
      modal: {
        isAuthModalOpen: true,
      },
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      },
    },
    docs: {
      description: {
        story:
          'Modal in dark mode to test theme compatibility and contrast issues',
      },
    },
  },
  globals: {
    colorScheme: 'dark',
  },
};

// Mobile view testing
export const MobileView: Story = {
  parameters: {
    mockStore: {
      modal: {
        isAuthModalOpen: true,
      },
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      },
    },
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story:
          'Modal on mobile devices to test responsive behavior and touch interactions',
      },
    },
  },
};

// Tablet view testing
export const TabletView: Story = {
  parameters: {
    mockStore: {
      modal: {
        isAuthModalOpen: true,
      },
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      },
    },
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'Modal on tablet devices to test medium screen layouts',
      },
    },
  },
};

// Form validation states
export const WithValidationErrors: Story = {
  parameters: {
    mockStore: {
      modal: {
        isAuthModalOpen: true,
      },
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      },
    },
    docs: {
      description: {
        story:
          'Modal with form validation errors visible for styling verification',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Simulate form submission to trigger validation
    const emailInput = canvasElement.querySelector('input[type="email"]');
    const passwordInput = canvasElement.querySelector('input[type="password"]');
    const submitButton = canvasElement.querySelector('button[type="submit"]');

    if (emailInput && passwordInput && submitButton) {
      // Enter invalid data
      (emailInput as HTMLInputElement).value = 'invalid-email';
      (passwordInput as HTMLInputElement).value = '123'; // Too short

      // Trigger form submission
      (submitButton as HTMLElement).click();
    }
  },
};

// Loading state simulation
export const LoadingState: Story = {
  parameters: {
    mockStore: {
      modal: {
        isAuthModalOpen: true,
      },
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
      },
    },
    docs: {
      description: {
        story:
          'Modal with loading state to test disabled form elements and loading indicators',
      },
    },
  },
};

// Error state simulation
export const ErrorState: Story = {
  parameters: {
    mockStore: {
      modal: {
        isAuthModalOpen: true,
      },
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Invalid email or password. Please try again.',
      },
    },
    docs: {
      description: {
        story:
          'Modal with error state to test error message display and styling',
      },
    },
  },
};

// Closed state for reference
export const Closed: Story = {
  parameters: {
    mockStore: {
      modal: {
        isAuthModalOpen: false,
      },
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      },
    },
    docs: {
      description: {
        story: 'Modal closed state - should render nothing visible',
      },
    },
  },
};

// === BUG REPRODUCTION STORIES ===
// These stories are specifically designed to isolate and reproduce visual bugs

// Visual regression test for all form elements
export const VisualRegressionTest: Story = {
  render: () => (
    <div
      id="modal-root"
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <div className="space-y-8 p-8">
        <div>
          <h3 className="text-muted-foreground mb-4 text-sm font-medium">
            AuthModal States for Visual Regression Testing
          </h3>
          <div className="space-y-4">
            <p className="text-sm">
              The modal should appear with proper backdrop opacity when opened.
            </p>
            <p className="text-sm">Key areas to check:</p>
            <ul className="ml-4 space-y-1 text-sm">
              <li>
                • Modal backdrop and overlay (should be semi-transparent black)
              </li>
              <li>• Dialog content positioning and sizing</li>
              <li>• Tab component styling and active states</li>
              <li>• Form input styling and focus states</li>
              <li>• Button styling and hover states</li>
              <li>• Form validation error display</li>
              <li>• Loading states and disabled elements</li>
              <li>• Typography and spacing consistency</li>
            </ul>
          </div>
        </div>
      </div>
      <AuthModal />
    </div>
  ),
  parameters: {
    mockStore: {
      modal: {
        isAuthModalOpen: false,
      },
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      },
    },
    docs: {
      description: {
        story:
          'Visual regression test checklist for AuthModal debugging - shows proper modal backdrop rendering',
      },
    },
  },
};

// Backdrop demonstration story with colorful background
export const BackdropDemo: Story = {
  render: () => (
    <div
      id="modal-root"
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        background:
          'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7)',
        backgroundSize: '400% 400%',
      }}
    >
      <div style={{ padding: '2rem', color: 'white', textAlign: 'center' }}>
        <h2
          style={{
            fontSize: '2rem',
            marginBottom: '1rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          🌈 Colorful Background Test
        </h2>
        <p
          style={{
            fontSize: '1.2rem',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
          }}
        >
          This vibrant background should be dimmed by the modal backdrop.
        </p>
        <p
          style={{
            marginTop: '1rem',
            fontSize: '1rem',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
          }}
        >
          ✅ Expected: Dark semi-transparent overlay (bg-black/50) should cover
          this content
        </p>
        <p
          style={{
            fontSize: '1rem',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
          }}
        >
          ❌ Bug: If you can see this text clearly, the backdrop is missing
        </p>
      </div>
      <AuthModal />
    </div>
  ),
  parameters: {
    mockStore: {
      modal: {
        isAuthModalOpen: true,
      },
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      },
    },
    docs: {
      description: {
        story:
          'BACKDROP TEST: Colorful background should be dimmed by semi-transparent black overlay when modal is open. If background is clearly visible, backdrop is broken.',
      },
    },
  },
};

// Interactive testing for all modal behaviors
export const InteractiveTesting: Story = {
  parameters: {
    mockStore: {
      modal: {
        isAuthModalOpen: true,
      },
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      },
    },
    docs: {
      description: {
        story:
          'Interactive modal for testing user flows, form submissions, and state transitions',
      },
    },
  },
};

// High contrast testing
export const HighContrast: Story = {
  parameters: {
    mockStore: {
      modal: {
        isAuthModalOpen: true,
      },
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      },
    },
    docs: {
      description: {
        story: 'High contrast mode for accessibility testing',
      },
    },
  },
  globals: {
    colorScheme: 'dark',
  },
};

// Different themes testing
export const NordTheme: Story = {
  parameters: {
    mockStore: {
      modal: {
        isAuthModalOpen: true,
      },
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      },
    },
    docs: {
      description: {
        story: 'Modal with Nord theme for theme compatibility testing',
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
      modal: {
        isAuthModalOpen: true,
      },
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      },
    },
    docs: {
      description: {
        story: 'Modal with Dracula theme for theme compatibility testing',
      },
    },
  },
  globals: {
    theme: 'dracula',
  },
};
