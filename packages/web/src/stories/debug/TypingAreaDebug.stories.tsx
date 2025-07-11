import type { Meta, StoryObj } from '@storybook/react';
import { TypingArea } from '@/components/game/TypingArea';

const meta = {
  title: 'Debug/TypingArea Bug Tests',
  component: TypingArea,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Debug stories specifically for testing TypingArea visual bugs and character state issues.',
      },
    },
  },
  tags: ['debug', 'bug-testing'],
} satisfies Meta<typeof TypingArea>;

export default meta;
type Story = StoryObj<typeof meta>;

// Simple test to verify character styling
export const SimpleCharacterStates: Story = {
  parameters: {
    mockStore: {
      game: {
        textToType: 'Test characters',
        charStates: [
          { char: 'T', status: 'correct', index: 0 },
          { char: 'e', status: 'correct', index: 1 },
          { char: 's', status: 'incorrect', index: 2 },
          { char: 't', status: 'current', index: 3 },
          { char: ' ', status: 'default', index: 4 },
          { char: 'c', status: 'default', index: 5 },
          { char: 'h', status: 'default', index: 6 },
          { char: 'a', status: 'default', index: 7 },
          { char: 'r', status: 'default', index: 8 },
          { char: 'a', status: 'default', index: 9 },
          { char: 'c', status: 'default', index: 10 },
          { char: 't', status: 'default', index: 11 },
          { char: 'e', status: 'default', index: 12 },
          { char: 'r', status: 'default', index: 13 },
          { char: 's', status: 'default', index: 14 },
        ],
        wordBoundaries: [0, 5, 15],
        currentWordIndex: 0,
        gameStatus: 'running',
        testConfig: {
          mode: 'time',
          duration: 60,
          wordCount: 50,
          difficulty: 'Normal',
          textSource: 'english1k',
          punctuation: false,
        },
        textWindow: {
          lines: ['Test characters'],
          scrollOffset: 0,
          lineCharOffsets: [0],
        },
        isPreparingGame: false,
        gamePreparationError: null,
        stats: {
          wpm: 45,
          accuracy: 85.7,
          elapsedTime: 5000,
          correctChars: 2,
          incorrectChars: 1,
          totalChars: 3,
        },
      },
    },
    docs: {
      description: {
        story:
          'Simple test showing different character states: green (correct), red (incorrect), highlighted (current), muted (default)',
      },
    },
  },
};
