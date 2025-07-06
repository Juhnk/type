import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import { TypingArea } from '../TypingArea';
import { WordsProgress } from '../WordsProgress';
import { useGameStore } from '@/store/useGameStore';
import { vi } from 'vitest';

// Mock the API client
vi.mock('@/lib/api-client', () => ({
  getWords: vi.fn().mockResolvedValue({
    words: [
      'the',
      'quick',
      'brown',
      'fox',
      'jumps',
      'over',
      'the',
      'lazy',
      'dog',
      'and',
      'runs',
    ],
  }),
}));

// Mock the text generator
vi.mock('@/lib/textGenerator', () => ({
  generateTextFromWords: vi.fn((words) => words.slice(0, 10).join(' ')),
  generateFallbackText: vi.fn(() => 'fallback test text for words'),
}));

describe('Words Mode Integration', () => {
  beforeEach(() => {
    // Reset store to words mode
    useGameStore.setState({
      testConfig: {
        mode: 'words',
        duration: 60,
        wordCount: 10,
        difficulty: 'Normal',
        textSource: 'english1k',
        punctuation: false,
      },
      gameStatus: 'ready',
      textToType: 'the quick brown fox jumps over the lazy dog and',
      charStates: 'the quick brown fox jumps over the lazy dog and'
        .split('')
        .map((char, index) => ({
          char,
          status: index === 0 ? 'current' : 'default',
        })),
      userInput: '',
      wordsCompleted: 0,
      wordsProgress: 0,
      currentWordIndex: 0,
      targetWordCount: 10,
      wordBoundaries: [0, 4, 10, 16, 20, 26, 31, 35, 40, 44],
      isPreparingGame: false,
      gamePreparationError: null,
    });
  });

  it('displays words progress indicator for words mode', () => {
    render(<WordsProgress />);

    // Should not show initially when game is ready
    expect(screen.queryByText('Progress')).not.toBeInTheDocument();

    // Start game
    act(() => {
      useGameStore.setState({ gameStatus: 'running' });
    });

    // Should show progress
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('0/10 words')).toBeInTheDocument();
    expect(screen.getByText('0% complete')).toBeInTheDocument();
  });

  it('updates word count as user types correctly', async () => {
    render(<TypingArea />);
    render(<WordsProgress />);

    // Start typing the first word

    act(() => {
      // Type "the "
      fireEvent.keyDown(document, { key: 't' });
      fireEvent.keyDown(document, { key: 'h' });
      fireEvent.keyDown(document, { key: 'e' });
      fireEvent.keyDown(document, { key: ' ' });
    });

    // Wait for state updates
    await waitFor(() => {
      const state = useGameStore.getState();
      expect(state.wordsCompleted).toBe(1);
    });

    expect(screen.getByText('1/10 words')).toBeInTheDocument();
  });

  it('automatically completes game when word count is reached', async () => {
    render(<TypingArea />);

    // Set up a scenario where we're one word away from completion
    useGameStore.setState({
      wordsCompleted: 9,
      wordsProgress: 90,
      userInput: 'the quick brown fox jumps over the lazy dog',
      charStates: Array(44)
        .fill(null)
        .map((_, i) => ({
          char: useGameStore.getState().textToType[i],
          status: 'correct' as const,
        }))
        .concat(
          Array(3)
            .fill(null)
            .map((_, i) => ({
              char: useGameStore.getState().textToType[44 + i],
              status: 'default' as const,
            }))
        ),
    });

    // Type the last word
    act(() => {
      fireEvent.keyDown(document, { key: ' ' });
      fireEvent.keyDown(document, { key: 'a' });
      fireEvent.keyDown(document, { key: 'n' });
      fireEvent.keyDown(document, { key: 'd' });
    });

    // Game should complete
    await waitFor(() => {
      const state = useGameStore.getState();
      expect(state.gameStatus).toBe('finished');
    });
  });

  it('does not count incorrect words', async () => {
    render(<TypingArea />);
    render(<WordsProgress />);

    // Start game and type incorrectly
    act(() => {
      fireEvent.keyDown(document, { key: 't' });
      fireEvent.keyDown(document, { key: 'e' }); // Wrong: should be 'h'
      fireEvent.keyDown(document, { key: 'h' }); // Wrong position
      fireEvent.keyDown(document, { key: ' ' });
    });

    await waitFor(() => {
      const state = useGameStore.getState();
      expect(state.wordsCompleted).toBe(0); // No words completed due to errors
    });

    expect(screen.getByText('0/10 words')).toBeInTheDocument();
  });

  it('handles backspace corrections affecting word completion', async () => {
    render(<TypingArea />);
    render(<WordsProgress />);

    // Type first word correctly
    act(() => {
      'the '.split('').forEach((char) => {
        fireEvent.keyDown(document, { key: char });
      });
    });

    await waitFor(() => {
      expect(useGameStore.getState().wordsCompleted).toBe(1);
    });

    // Backspace to uncomplete the word
    act(() => {
      fireEvent.keyDown(document, { key: 'Backspace' });
      fireEvent.keyDown(document, { key: 'Backspace' });
    });

    await waitFor(() => {
      expect(useGameStore.getState().wordsCompleted).toBe(0);
    });
  });

  it('shows visual progress indicators', async () => {
    render(<WordsProgress />);

    // Start game
    act(() => {
      useGameStore.setState({ gameStatus: 'running' });
    });

    // Set different progress levels
    act(() => {
      useGameStore.setState({
        wordsCompleted: 5,
        wordsProgress: 50,
      });
    });

    expect(screen.getByText('5/10 words')).toBeInTheDocument();
    expect(screen.getByText('50% complete')).toBeInTheDocument();

    // Near completion
    act(() => {
      useGameStore.setState({
        wordsCompleted: 9,
        wordsProgress: 90,
      });
    });

    expect(screen.getByText('9/10 words')).toBeInTheDocument();
    expect(screen.getByText('90% complete')).toBeInTheDocument();

    // Check for special styling at high progress
    const progressText = screen.getByText('9/10 words');
    expect(progressText).toHaveClass('text-green-600');
  });

  it('works with different word count configurations', async () => {
    const wordCounts = [10, 25, 50, 100] as const;

    for (const count of wordCounts) {
      useGameStore.setState({
        testConfig: {
          ...useGameStore.getState().testConfig,
          wordCount: count,
        },
        targetWordCount: count,
        wordsCompleted: 0,
        wordsProgress: 0,
        gameStatus: 'running',
      });

      render(<WordsProgress />);

      expect(screen.getByText(`0/${count} words`)).toBeInTheDocument();

      // Cleanup for next iteration
      screen.getByText(`0/${count} words`).remove();
    }
  });

  it('integrates with LiveStats component', async () => {
    const { LiveStats } = await import('../LiveStats');

    render(<LiveStats />);

    // Should show words count in words mode
    act(() => {
      useGameStore.setState({
        gameStatus: 'running',
        wordsCompleted: 5,
      });
    });

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Words')).toBeInTheDocument();
  });

  it('resets word progress on game reset', async () => {
    render(<WordsProgress />);

    // Set some progress
    act(() => {
      useGameStore.setState({
        gameStatus: 'running',
        wordsCompleted: 5,
        wordsProgress: 50,
      });
    });

    expect(screen.getByText('5/10 words')).toBeInTheDocument();

    // Reset game
    act(() => {
      useGameStore.getState().resetGame();
    });

    const state = useGameStore.getState();
    expect(state.wordsCompleted).toBe(0);
    expect(state.wordsProgress).toBe(0);
    expect(state.currentWordIndex).toBe(0);
  });
});
