import type { Meta, StoryObj } from '@storybook/react';
import { ResultsCard } from '@/components/game/ResultsCard';

const meta = {
  title: 'Components/Game/ResultsCard',
  component: ResultsCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Displays test results after completing a typing session, including WPM, accuracy, and detailed statistics.',
      },
    },
  },
  tags: ['game', 'results', 'autodocs'],
} satisfies Meta<typeof ResultsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Keep Practicing performance (< 40 WPM)
export const KeepPracticing: Story = {
  parameters: {
    mockStore: {
      game: {
        stats: {
          wpm: 35,
          rawWpm: 38,
          accuracy: 85.5,
          correctChars: 150,
          incorrectChars: 26,
          totalChars: 176,
          elapsedTime: 60000,
        },
        testFailed: false,
        failureReason: null,
        testConfig: {
          mode: 'time',
          duration: 60,
          difficulty: 'Normal',
        },
      },
      auth: {
        token: null,
      },
    },
    docs: {
      description: {
        story: 'Beginner-level performance with room for improvement',
      },
    },
  },
};

// Great Job performance (40-59 WPM)
export const GreatJob: Story = {
  parameters: {
    mockStore: {
      game: {
        stats: {
          wpm: 52,
          rawWpm: 55,
          accuracy: 92.3,
          correctChars: 260,
          incorrectChars: 22,
          totalChars: 282,
          elapsedTime: 60000,
        },
        testFailed: false,
        failureReason: null,
        testConfig: {
          mode: 'time',
          duration: 60,
          difficulty: 'Normal',
        },
      },
      auth: {
        token: null,
      },
    },
    docs: {
      description: {
        story: 'Average typing performance',
      },
    },
  },
};

// Excellent Typing performance (60-79 WPM)
export const ExcellentTyping: Story = {
  parameters: {
    mockStore: {
      game: {
        stats: {
          wpm: 72,
          rawWpm: 75,
          accuracy: 96.8,
          correctChars: 360,
          incorrectChars: 12,
          totalChars: 372,
          elapsedTime: 60000,
        },
        testFailed: false,
        failureReason: null,
        testConfig: {
          mode: 'time',
          duration: 60,
          difficulty: 'Normal',
        },
      },
      auth: {
        token: null,
      },
    },
    docs: {
      description: {
        story: 'Above average typing performance',
      },
    },
  },
};

// Outstanding Performance (80+ WPM)
export const OutstandingPerformance: Story = {
  parameters: {
    mockStore: {
      game: {
        stats: {
          wpm: 95,
          rawWpm: 98,
          accuracy: 98.5,
          correctChars: 475,
          incorrectChars: 7,
          totalChars: 482,
          elapsedTime: 60000,
        },
        testFailed: false,
        failureReason: null,
        testConfig: {
          mode: 'time',
          duration: 60,
          difficulty: 'Normal',
        },
      },
      auth: {
        token: null,
      },
    },
    docs: {
      description: {
        story: 'Professional-level typing performance',
      },
    },
  },
};

// Perfect accuracy
export const PerfectAccuracy: Story = {
  parameters: {
    mockStore: {
      game: {
        stats: {
          wpm: 65,
          rawWpm: 65,
          accuracy: 100,
          correctChars: 325,
          incorrectChars: 0,
          totalChars: 325,
          elapsedTime: 60000,
        },
        testFailed: false,
        failureReason: null,
        testConfig: {
          mode: 'time',
          duration: 60,
          difficulty: 'Normal',
        },
      },
      auth: {
        token: null,
      },
    },
    docs: {
      description: {
        story: 'Perfect 100% accuracy result',
      },
    },
  },
};

// Poor accuracy
export const PoorAccuracy: Story = {
  parameters: {
    mockStore: {
      game: {
        stats: {
          wpm: 45,
          rawWpm: 60,
          accuracy: 75.0,
          correctChars: 225,
          incorrectChars: 75,
          totalChars: 300,
          elapsedTime: 60000,
        },
        testFailed: false,
        failureReason: null,
        testConfig: {
          mode: 'time',
          duration: 60,
          difficulty: 'Normal',
        },
      },
      auth: {
        token: null,
      },
    },
    docs: {
      description: {
        story: 'Low accuracy with many errors',
      },
    },
  },
};

// Authenticated user (score saved)
export const AuthenticatedUser: Story = {
  parameters: {
    mockStore: {
      game: {
        stats: {
          wpm: 68,
          rawWpm: 71,
          accuracy: 94.5,
          correctChars: 340,
          incorrectChars: 20,
          totalChars: 360,
          elapsedTime: 60000,
        },
        testFailed: false,
        failureReason: null,
        testConfig: {
          mode: 'time',
          duration: 60,
          difficulty: 'Normal',
        },
      },
      auth: {
        token: 'mock-token',
        user: {
          id: '1',
          username: 'speedtyper',
          email: 'user@example.com',
        },
      },
    },
    docs: {
      description: {
        story: 'Shows "Saved!" button for authenticated users',
      },
    },
  },
};

// Failed test - Expert mode
export const FailedTestExpert: Story = {
  parameters: {
    mockStore: {
      game: {
        stats: {
          wpm: 28,
          rawWpm: 35,
          accuracy: 82.0,
          correctChars: 140,
          incorrectChars: 31,
          totalChars: 171,
          elapsedTime: 45000,
        },
        testFailed: true,
        failureReason: 'Too many errors! Accuracy dropped below 85%.',
        testConfig: {
          mode: 'time',
          duration: 60,
          difficulty: 'Expert',
        },
      },
      auth: {
        token: null,
      },
    },
    docs: {
      description: {
        story: 'Failed test in Expert mode due to low accuracy',
      },
    },
  },
};

// Failed test - Master mode
export const FailedTestMaster: Story = {
  parameters: {
    mockStore: {
      game: {
        stats: {
          wpm: 45,
          rawWpm: 50,
          accuracy: 88.0,
          correctChars: 225,
          incorrectChars: 31,
          totalChars: 256,
          elapsedTime: 30000,
        },
        testFailed: true,
        failureReason: 'Too many errors! Accuracy dropped below 90%.',
        testConfig: {
          mode: 'time',
          duration: 60,
          difficulty: 'Master',
        },
      },
      auth: {
        token: null,
      },
    },
    docs: {
      description: {
        story: 'Failed test in Master mode due to accuracy threshold',
      },
    },
  },
};

// Words mode result
export const WordsMode: Story = {
  parameters: {
    mockStore: {
      game: {
        stats: {
          wpm: 58,
          rawWpm: 61,
          accuracy: 93.5,
          correctChars: 250,
          incorrectChars: 17,
          totalChars: 267,
          elapsedTime: 52000,
        },
        testFailed: false,
        failureReason: null,
        testConfig: {
          mode: 'words',
          wordCount: 50,
          difficulty: 'Normal',
        },
      },
      auth: {
        token: null,
      },
    },
    docs: {
      description: {
        story: 'Results from words mode test',
      },
    },
  },
};

// Short duration test
export const ShortDuration: Story = {
  parameters: {
    mockStore: {
      game: {
        stats: {
          wpm: 82,
          rawWpm: 85,
          accuracy: 96.5,
          correctChars: 68,
          incorrectChars: 3,
          totalChars: 71,
          elapsedTime: 15000,
        },
        testFailed: false,
        failureReason: null,
        testConfig: {
          mode: 'time',
          duration: 15,
          difficulty: 'Normal',
        },
      },
      auth: {
        token: null,
      },
    },
    docs: {
      description: {
        story: '15-second quick test results',
      },
    },
  },
};

// Dark mode
export const DarkMode: Story = {
  parameters: {
    mockStore: {
      game: {
        stats: {
          wpm: 65,
          rawWpm: 68,
          accuracy: 94.5,
          correctChars: 325,
          incorrectChars: 19,
          totalChars: 344,
          elapsedTime: 60000,
        },
        testFailed: false,
        failureReason: null,
        testConfig: {
          mode: 'time',
          duration: 60,
          difficulty: 'Normal',
        },
      },
      auth: {
        token: null,
      },
    },
  },
  globals: {
    colorScheme: 'dark',
  },
};

// Different themes
export const DraculaTheme: Story = {
  parameters: {
    mockStore: {
      game: {
        stats: {
          wpm: 70,
          rawWpm: 73,
          accuracy: 95.8,
          correctChars: 350,
          incorrectChars: 15,
          totalChars: 365,
          elapsedTime: 60000,
        },
        testFailed: false,
        failureReason: null,
        testConfig: {
          mode: 'time',
          duration: 60,
          difficulty: 'Normal',
        },
      },
      auth: {
        token: null,
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
      game: {
        stats: {
          wpm: 55,
          rawWpm: 58,
          accuracy: 91.5,
          correctChars: 275,
          incorrectChars: 26,
          totalChars: 301,
          elapsedTime: 60000,
        },
        testFailed: false,
        failureReason: null,
        testConfig: {
          mode: 'time',
          duration: 60,
          difficulty: 'Normal',
        },
      },
      auth: {
        token: null,
      },
    },
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'Responsive design for mobile devices',
      },
    },
  },
};
