import type { Meta, StoryObj } from '@storybook/react';
import { LiveStats } from '@/components/game/LiveStats';

const meta = {
  title: 'Components/Game/LiveStats',
  component: LiveStats,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Displays live statistics during typing sessions including WPM, accuracy, and elapsed time.',
      },
    },
  },
  tags: ['game', 'stats', 'autodocs'],
} satisfies Meta<typeof LiveStats>;

export default meta;
type Story = StoryObj<typeof meta>;

// Hidden when not running
export const NotRunning: Story = {
  parameters: {
    mockStore: {
      game: {
        gameStatus: 'ready',
        stats: {
          wpm: 0,
          accuracy: 100,
          elapsedTime: 0,
        },
      },
    },
    docs: {
      description: {
        story: 'Component is hidden when game is not running',
      },
    },
  },
};

// Running with low stats
export const RunningLowStats: Story = {
  parameters: {
    mockStore: {
      game: {
        gameStatus: 'running',
        stats: {
          wpm: 35,
          rawWpm: 38,
          accuracy: 85.5,
          correctChars: 42,
          incorrectChars: 8,
          totalChars: 50,
          elapsedTime: 15000,
        },
        testConfig: {
          mode: 'time',
          duration: 60,
        },
      },
    },
    docs: {
      description: {
        story: 'Running game with below-average performance',
      },
    },
  },
};

// Running with medium stats
export const RunningMediumStats: Story = {
  parameters: {
    mockStore: {
      game: {
        gameStatus: 'running',
        stats: {
          wpm: 52,
          rawWpm: 55,
          accuracy: 92.3,
          correctChars: 120,
          incorrectChars: 10,
          totalChars: 130,
          elapsedTime: 30000,
        },
        testConfig: {
          mode: 'time',
          duration: 60,
        },
      },
    },
    docs: {
      description: {
        story: 'Running game with average performance',
      },
    },
  },
};

// Running with high stats
export const RunningHighStats: Story = {
  parameters: {
    mockStore: {
      game: {
        gameStatus: 'running',
        stats: {
          wpm: 85,
          rawWpm: 88,
          accuracy: 98.5,
          correctChars: 250,
          incorrectChars: 4,
          totalChars: 254,
          elapsedTime: 45000,
        },
        testConfig: {
          mode: 'time',
          duration: 60,
        },
      },
    },
    docs: {
      description: {
        story: 'Running game with excellent performance',
      },
    },
  },
};

// Exceptional performance
export const ExceptionalPerformance: Story = {
  parameters: {
    mockStore: {
      game: {
        gameStatus: 'running',
        stats: {
          wpm: 120,
          rawWpm: 125,
          accuracy: 99.8,
          correctChars: 500,
          incorrectChars: 1,
          totalChars: 501,
          elapsedTime: 60000,
        },
        testConfig: {
          mode: 'time',
          duration: 120,
        },
      },
    },
    docs: {
      description: {
        story: 'Professional-level typing performance',
      },
    },
  },
};

// Words mode
export const WordsMode: Story = {
  parameters: {
    mockStore: {
      game: {
        gameStatus: 'running',
        stats: {
          wpm: 65,
          rawWpm: 68,
          accuracy: 95.5,
          correctChars: 150,
          incorrectChars: 7,
          totalChars: 157,
          elapsedTime: 25000,
        },
        testConfig: {
          mode: 'words',
          wordCount: 50,
        },
      },
    },
    docs: {
      description: {
        story: 'Words mode shows elapsed time instead of remaining time',
      },
    },
  },
};

// Just started
export const JustStarted: Story = {
  parameters: {
    mockStore: {
      game: {
        gameStatus: 'running',
        stats: {
          wpm: 0,
          rawWpm: 0,
          accuracy: 100,
          correctChars: 3,
          incorrectChars: 0,
          totalChars: 3,
          elapsedTime: 1000,
        },
        testConfig: {
          mode: 'time',
          duration: 60,
        },
      },
    },
    docs: {
      description: {
        story: 'Game just started with minimal stats',
      },
    },
  },
};

// Finished state
export const Finished: Story = {
  parameters: {
    mockStore: {
      game: {
        gameStatus: 'finished',
        stats: {
          wpm: 72,
          rawWpm: 75,
          accuracy: 96.8,
          correctChars: 360,
          incorrectChars: 12,
          totalChars: 372,
          elapsedTime: 60000,
          duration: 60000,
        },
        testConfig: {
          mode: 'time',
          duration: 60,
        },
      },
    },
    docs: {
      description: {
        story: 'Shows final stats when test is completed',
      },
    },
  },
};

// Perfect accuracy
export const PerfectAccuracy: Story = {
  parameters: {
    mockStore: {
      game: {
        gameStatus: 'running',
        stats: {
          wpm: 60,
          rawWpm: 60,
          accuracy: 100,
          correctChars: 100,
          incorrectChars: 0,
          totalChars: 100,
          elapsedTime: 20000,
        },
        testConfig: {
          mode: 'time',
          duration: 60,
        },
      },
    },
    docs: {
      description: {
        story: 'Perfect 100% accuracy with green highlighting',
      },
    },
  },
};

// Poor accuracy
export const PoorAccuracy: Story = {
  parameters: {
    mockStore: {
      game: {
        gameStatus: 'running',
        stats: {
          wpm: 45,
          rawWpm: 60,
          accuracy: 75.0,
          correctChars: 75,
          incorrectChars: 25,
          totalChars: 100,
          elapsedTime: 20000,
        },
        testConfig: {
          mode: 'time',
          duration: 60,
        },
      },
    },
    docs: {
      description: {
        story: 'Poor accuracy highlighted in red',
      },
    },
  },
};

// Dark mode
export const DarkMode: Story = {
  parameters: {
    mockStore: {
      game: {
        gameStatus: 'running',
        stats: {
          wpm: 65,
          rawWpm: 68,
          accuracy: 94.5,
          correctChars: 150,
          incorrectChars: 8,
          totalChars: 158,
          elapsedTime: 30000,
        },
        testConfig: {
          mode: 'time',
          duration: 60,
        },
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
      game: {
        gameStatus: 'running',
        stats: {
          wpm: 70,
          rawWpm: 73,
          accuracy: 96.0,
          correctChars: 200,
          incorrectChars: 8,
          totalChars: 208,
          elapsedTime: 35000,
        },
        testConfig: {
          mode: 'time',
          duration: 60,
        },
      },
    },
  },
  globals: {
    theme: 'nord',
  },
};

// Mobile view
export const MobileView: Story = {
  parameters: {
    mockStore: {
      game: {
        gameStatus: 'running',
        stats: {
          wpm: 55,
          rawWpm: 58,
          accuracy: 93.5,
          correctChars: 120,
          incorrectChars: 8,
          totalChars: 128,
          elapsedTime: 25000,
        },
        testConfig: {
          mode: 'time',
          duration: 60,
        },
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
