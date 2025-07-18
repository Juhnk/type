import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TypingArea } from '../TypingArea';
import { useGameStore } from '@/store/useGameStore';

// Mock the api-client
vi.mock('@/lib/api-client', () => ({
  getWords: vi.fn(),
}));

import { getWords } from '@/lib/api-client';

describe('TypingArea Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store to initial state
    useGameStore.setState({
      textToType: 'test words',
      charStates: 'test words'.split('').map((char) => ({
        char,
        status: 'default' as const,
      })),
      userInput: '',
      gameStatus: 'ready',
      isLoadingWords: false,
      wordsError: null,
    });
  });

  it('should display loading state while fetching words', async () => {
    // Set loading state
    useGameStore.setState({ isLoadingWords: true });

    render(<TypingArea />);

    expect(screen.getByText('Loading words...')).toBeInTheDocument();
  });

  it('should display error state with retry button', async () => {
    // Set error state
    useGameStore.setState({
      wordsError: 'Network error',
      isLoadingWords: false,
    });

    render(<TypingArea />);

    expect(
      screen.getByText('Failed to load words: Network error')
    ).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
  });

  it('should load words on mount', async () => {
    (getWords as any).mockResolvedValueOnce({
      words: ['loaded', 'from', 'api'],
      metadata: { list: 'english1k', count: 3, total_available: 1024 },
    });

    render(<TypingArea />);

    await waitFor(() => {
      expect(getWords).toHaveBeenCalled();
    });
  });

  it('should display typing interface when words are loaded', () => {
    render(<TypingArea />);

    // Check for the typing prompt
    expect(
      screen.getByText('Start typing to begin the test...')
    ).toBeInTheDocument();

    // Check that characters are displayed
    const charElements = screen.getByText('test words', { selector: 'div' });
    expect(charElements).toBeInTheDocument();
  });

  it('should start game when user types', async () => {
    const user = userEvent.setup();
    render(<TypingArea />);

    // Type the first character
    await user.keyboard('t');

    const state = useGameStore.getState();
    expect(state.gameStatus).toBe('running');
    expect(state.userInput).toBe('t');
  });

  it('should highlight correct and incorrect characters', async () => {
    const user = userEvent.setup();
    render(<TypingArea />);

    // Type correct character
    await user.keyboard('t');

    let state = useGameStore.getState();
    expect(state.charStates[0].status).toBe('correct');

    // Type incorrect character
    await user.keyboard('x');

    state = useGameStore.getState();
    expect(state.charStates[1].status).toBe('incorrect');
  });

  it('should show results when game is finished', () => {
    useGameStore.setState({
      gameStatus: 'finished',
      stats: {
        wpm: 65,
        accuracy: 95,
        startTime: Date.now() - 60000,
        endTime: Date.now(),
        totalChars: 50,
        correctChars: 47,
        incorrectChars: 3,
        elapsedTime: 60000,
      },
    });

    render(<TypingArea />);

    // Results card should be displayed
    expect(screen.getByText(/Results/i)).toBeInTheDocument();
  });

  it('should handle keyboard shortcuts', async () => {
    const user = userEvent.setup();
    render(<TypingArea />);

    // Test that Tab is prevented (no default browser behavior)
    await user.keyboard('{Tab}');

    // Test Escape key
    await user.keyboard('{Escape}');

    // These keys should be prevented from default behavior
    // but the test verifies they don't cause errors
  });

  it('should retry loading words when retry button is clicked', async () => {
    (getWords as any).mockResolvedValueOnce({
      words: ['retry', 'success'],
      metadata: { list: 'english1k', count: 2, total_available: 1024 },
    });

    // Set error state
    useGameStore.setState({
      wordsError: 'Network error',
      isLoadingWords: false,
    });

    const user = userEvent.setup();
    render(<TypingArea />);

    const retryButton = screen.getByText('Try again');
    await user.click(retryButton);

    await waitFor(() => {
      expect(getWords).toHaveBeenCalled();
    });
  });
});
