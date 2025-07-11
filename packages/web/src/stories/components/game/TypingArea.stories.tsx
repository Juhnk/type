import type { Meta, StoryObj } from '@storybook/react';
import { TypingArea } from '@/components/game/TypingArea';
import { useGameStore } from '@/store/useGameStore';

const meta = {
  title: 'Components/Game/TypingArea',
  component: TypingArea,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The main typing interface where users practice their typing skills.',
      },
    },
  },
  tags: ['game', 'interactive', 'autodocs'],
} satisfies Meta<typeof TypingArea>;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper to set up game state
const setupGameState = (overrides = {}) => {
  const text = 'The quick brown fox jumps over the lazy dog';
  const charStates = text.split('').map((char, index) => ({
    char,
    status: 'default' as const,
    index,
  }));

  return {
    textToType: text,
    charStates,
    wordBoundaries: [0, 4, 10, 16, 20, 26, 31, 35, 40],
    ...overrides,
  };
};

// Ready state
export const Ready: Story = {
  parameters: {
    mockStore: {
      game: {
        ...setupGameState(),
        gameStatus: 'ready',
        testConfig: {
          mode: 'time',
          duration: 60,
          wordCount: 50,
          difficulty: 'Normal',
          textSource: 'english1k',
          punctuation: false,
        },
      },
    },
  },
};

// Active typing - time mode
export const ActiveTypingTimeMode: Story = {
  parameters: {
    mockStore: {
      game: {
        ...setupGameState({
          charStates: [
            { char: 'T', status: 'correct', index: 0 },
            { char: 'h', status: 'correct', index: 1 },
            { char: 'e', status: 'correct', index: 2 },
            { char: ' ', status: 'correct', index: 3 },
            { char: 'q', status: 'correct', index: 4 },
            { char: 'u', status: 'current', index: 5 },
            { char: 'i', status: 'default', index: 6 },
            { char: 'c', status: 'default', index: 7 },
            { char: 'k', status: 'default', index: 8 },
            ...Array(34)
              .fill(null)
              .map((_, i) => ({
                char: 'The quick brown fox jumps over the lazy dog'.charAt(
                  i + 9
                ),
                status: 'default' as const,
                index: i + 9,
              })),
          ],
          currentWordIndex: 1,
          userInput: 'The q',
        }),
        gameStatus: 'running',
        timeRemaining: 45000,
        stats: {
          wpm: 42,
          rawWpm: 45,
          accuracy: 96.5,
          correctChars: 5,
          incorrectChars: 0,
          totalChars: 5,
        },
        testConfig: {
          mode: 'time',
          duration: 60,
        },
      },
    },
    docs: {
      description: {
        story: 'Active typing session in time mode with live statistics',
      },
    },
  },
};

// Words mode
export const WordsMode: Story = {
  parameters: {
    mockStore: {
      game: {
        ...setupGameState(),
        gameStatus: 'running',
        wordsCompleted: 3,
        targetWordCount: 25,
        wordsProgress: 12,
        testConfig: {
          mode: 'words',
          wordCount: 25,
        },
      },
    },
    docs: {
      description: {
        story: 'Words mode with progress indicator',
      },
    },
  },
};

// With errors
export const WithErrors: Story = {
  parameters: {
    mockStore: {
      game: {
        ...setupGameState({
          charStates: [
            { char: 'T', status: 'correct', index: 0 },
            { char: 'h', status: 'correct', index: 1 },
            { char: 'e', status: 'correct', index: 2 },
            { char: ' ', status: 'correct', index: 3 },
            { char: 'q', status: 'incorrect', index: 4 },
            { char: 'u', status: 'incorrect', index: 5 },
            { char: 'i', status: 'current', index: 6 },
            ...Array(36)
              .fill(null)
              .map((_, i) => ({
                char: 'The quick brown fox jumps over the lazy dog'.charAt(
                  i + 7
                ),
                status: 'default' as const,
                index: i + 7,
              })),
          ],
        }),
        gameStatus: 'running',
        stats: {
          wpm: 38,
          rawWpm: 42,
          accuracy: 85.7,
          correctChars: 4,
          incorrectChars: 2,
          totalChars: 6,
        },
      },
    },
    docs: {
      description: {
        story: 'Typing with some errors highlighted in red',
      },
    },
  },
};

// Completed test
export const Completed: Story = {
  parameters: {
    mockStore: {
      game: {
        ...setupGameState({
          charStates: Array(43)
            .fill(null)
            .map((_, i) => ({
              char: 'The quick brown fox jumps over the lazy dog'.charAt(i),
              status: 'correct' as const,
              index: i,
            })),
        }),
        gameStatus: 'finished',
        stats: {
          wpm: 72,
          rawWpm: 75,
          accuracy: 98.5,
          correctChars: 43,
          incorrectChars: 1,
          totalChars: 44,
          duration: 30000,
        },
      },
    },
    docs: {
      description: {
        story: 'Completed typing test showing results',
      },
    },
  },
};

// Dark mode
export const DarkMode: Story = {
  ...Ready,
  globals: {
    theme: 'dark',
  },
};

// Different caret styles
export const BlockCaret: Story = {
  parameters: {
    mockStore: {
      game: setupGameState(),
      settings: {
        settings: {
          appearance: {
            caretStyle: 'block',
          },
        },
      },
    },
  },
};

export const UnderlineCaret: Story = {
  parameters: {
    mockStore: {
      game: setupGameState(),
      settings: {
        settings: {
          appearance: {
            caretStyle: 'underline',
          },
        },
      },
    },
  },
};

// === BUG REPRODUCTION STORIES ===
// These stories are specifically designed to isolate and reproduce visual bugs

// Bug Test: Character styling for correct/incorrect states
export const CharacterStateBugs: Story = {
  parameters: {
    mockStore: {
      game: {
        ...setupGameState({
          charStates: [
            { char: 'T', status: 'correct', index: 0 }, // Should be green
            { char: 'h', status: 'correct', index: 1 }, // Should be green
            { char: 'e', status: 'incorrect', index: 2 }, // Should be red
            { char: ' ', status: 'incorrect', index: 3 }, // Should be red
            { char: 'q', status: 'correct', index: 4 }, // Should be green
            { char: 'u', status: 'incorrect', index: 5 }, // Should be red
            { char: 'i', status: 'current', index: 6 }, // Should be highlighted
            { char: 'c', status: 'default', index: 7 }, // Should be muted
            { char: 'k', status: 'default', index: 8 }, // Should be muted
            ...Array(34)
              .fill(null)
              .map((_, i) => ({
                char: 'The quick brown fox jumps over the lazy dog'.charAt(
                  i + 9
                ),
                status: 'default' as const,
                index: i + 9,
              })),
          ],
        }),
        gameStatus: 'running',
        testConfig: {
          mode: 'time',
          duration: 60,
          wordCount: 50,
          difficulty: 'Normal',
          textSource: 'english1k',
          punctuation: false,
        },
      },
    },
    docs: {
      description: {
        story:
          'Bug test: Mixed correct/incorrect character states should display with proper colors. Green for correct, red for incorrect, highlighted for current.',
      },
    },
  },
};

// Bug Test: Backspace artifacts and state reset issues
export const BackspaceArtifacts: Story = {
  parameters: {
    mockStore: {
      game: {
        ...setupGameState({
          charStates: [
            { char: 'T', status: 'correct', index: 0 },
            { char: 'h', status: 'correct', index: 1 },
            { char: 'e', status: 'correct', index: 2 },
            { char: ' ', status: 'correct', index: 3 },
            { char: 'q', status: 'incorrect', index: 4 }, // User typed wrong, then backspaced
            { char: 'u', status: 'current', index: 5 }, // Should be current after backspace
            { char: 'i', status: 'default', index: 6 }, // Should be clean default
            { char: 'c', status: 'default', index: 7 },
            { char: 'k', status: 'default', index: 8 },
            ...Array(34)
              .fill(null)
              .map((_, i) => ({
                char: 'The quick brown fox jumps over the lazy dog'.charAt(
                  i + 9
                ),
                status: 'default' as const,
                index: i + 9,
              })),
          ],
          userInput: 'The x', // Shows that user typed 'x' instead of 'q', then backspaced
        }),
        gameStatus: 'running',
        testConfig: {
          mode: 'time',
          duration: 60,
        },
      },
    },
    docs: {
      description: {
        story:
          'Bug test: After backspace, character states should reset properly. Index 4 shows incorrect state (from wrong typing), index 5 should be current position after backspace.',
      },
    },
  },
};

// Bug Test: All character states in sequence for visual verification
export const VisualRegressionTest: Story = {
  parameters: {
    mockStore: {
      game: {
        ...setupGameState({
          charStates: [
            // Correct sequence
            { char: 'C', status: 'correct', index: 0 },
            { char: 'o', status: 'correct', index: 1 },
            { char: 'r', status: 'correct', index: 2 },
            { char: 'r', status: 'correct', index: 3 },
            { char: 'e', status: 'correct', index: 4 },
            { char: 'c', status: 'correct', index: 5 },
            { char: 't', status: 'correct', index: 6 },
            { char: ' ', status: 'correct', index: 7 },
            // Incorrect sequence
            { char: 'I', status: 'incorrect', index: 8 },
            { char: 'n', status: 'incorrect', index: 9 },
            { char: 'c', status: 'incorrect', index: 10 },
            { char: 'o', status: 'incorrect', index: 11 },
            { char: 'r', status: 'incorrect', index: 12 },
            { char: 'r', status: 'incorrect', index: 13 },
            { char: 'e', status: 'incorrect', index: 14 },
            { char: 'c', status: 'incorrect', index: 15 },
            { char: 't', status: 'incorrect', index: 16 },
            { char: ' ', status: 'incorrect', index: 17 },
            // Current position
            { char: 'C', status: 'current', index: 18 },
            // Default/untyped
            { char: 'u', status: 'default', index: 19 },
            { char: 'r', status: 'default', index: 20 },
            { char: 'r', status: 'default', index: 21 },
            { char: 'e', status: 'default', index: 22 },
            { char: 'n', status: 'default', index: 23 },
            { char: 't', status: 'default', index: 24 },
          ],
        }),
        gameStatus: 'running',
        testConfig: {
          mode: 'words',
          wordCount: 25,
        },
      },
    },
    docs: {
      description: {
        story:
          'Visual regression test: All character states displayed in sequence. Use this to verify styling consistency across all states.',
      },
    },
  },
};

// Bug Test: Edge case with rapid state transitions
export const EdgeCaseStates: Story = {
  parameters: {
    mockStore: {
      game: {
        ...setupGameState({
          charStates: [
            // Mix of states that might cause rendering issues
            { char: 'E', status: 'correct', index: 0 },
            { char: 'd', status: 'incorrect', index: 1 },
            { char: 'g', status: 'correct', index: 2 },
            { char: 'e', status: 'incorrect', index: 3 },
            { char: ' ', status: 'current', index: 4 }, // Current on space
            { char: 'c', status: 'default', index: 5 },
            { char: 'a', status: 'correct', index: 6 }, // Correct after current
            { char: 's', status: 'incorrect', index: 7 }, // Incorrect after correct
            { char: 'e', status: 'current', index: 8 }, // Another current (should not happen)
            { char: 's', status: 'default', index: 9 },
            ...Array(33)
              .fill(null)
              .map((_, i) => ({
                char: 'The quick brown fox jumps over the lazy dog'.charAt(
                  i + 10
                ),
                status: 'default' as const,
                index: i + 10,
              })),
          ],
        }),
        gameStatus: 'running',
        testConfig: {
          mode: 'time',
          duration: 30,
        },
      },
    },
    docs: {
      description: {
        story:
          'Edge case test: Unusual state combinations that might cause visual glitches. Tests rapid transitions and potentially invalid state combinations.',
      },
    },
  },
};

// Bug Test: Invisible correct characters issue
export const InvisibleCorrectCharacters: Story = {
  parameters: {
    mockStore: {
      game: {
        ...setupGameState({
          charStates: [
            // These should be clearly visible with green styling
            { char: 'T', status: 'correct', index: 0 },
            { char: 'h', status: 'correct', index: 1 },
            { char: 'e', status: 'correct', index: 2 },
            { char: 's', status: 'correct', index: 3 },
            { char: 'e', status: 'correct', index: 4 },
            { char: ' ', status: 'correct', index: 5 },
            { char: 's', status: 'correct', index: 6 },
            { char: 'h', status: 'correct', index: 7 },
            { char: 'o', status: 'correct', index: 8 },
            { char: 'u', status: 'correct', index: 9 },
            { char: 'l', status: 'correct', index: 10 },
            { char: 'd', status: 'correct', index: 11 },
            { char: ' ', status: 'correct', index: 12 },
            { char: 'b', status: 'correct', index: 13 },
            { char: 'e', status: 'correct', index: 14 },
            { char: ' ', status: 'correct', index: 15 },
            { char: 'g', status: 'correct', index: 16 },
            { char: 'r', status: 'correct', index: 17 },
            { char: 'e', status: 'correct', index: 18 },
            { char: 'e', status: 'correct', index: 19 },
            { char: 'n', status: 'current', index: 20 },
            ...Array(22)
              .fill(null)
              .map((_, i) => ({
                char: 'The quick brown fox jumps over the lazy dog'.charAt(
                  i + 21
                ),
                status: 'default' as const,
                index: i + 21,
              })),
          ],
        }),
        gameStatus: 'running',
        testConfig: {
          mode: 'time',
          duration: 60,
        },
      },
    },
    docs: {
      description: {
        story:
          'Bug test: Many consecutive correct characters. If styling is broken, these may appear unstyled/invisible instead of green.',
      },
    },
  },
};
