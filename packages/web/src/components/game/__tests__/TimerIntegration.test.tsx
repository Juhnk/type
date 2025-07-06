import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import { TypingArea } from '../TypingArea';
import { useGameStore } from '@/store/useGameStore';
import { vi } from 'vitest';

// Mock the API client
vi.mock('@/lib/api-client', () => ({
  getWords: vi.fn().mockResolvedValue({
    words: ['test', 'words', 'for', 'timer', 'integration'],
  }),
}));

// Mock the text generator
vi.mock('@/lib/textGenerator', () => ({
  generateTextFromWords: vi.fn((words) => words.join(' ')),
  generateFallbackText: vi.fn(() => 'fallback test text'),
}));

// Use fake timers
vi.useFakeTimers();

describe('Timer Integration', () => {
  beforeEach(() => {
    vi.clearAllTimers();

    // Reset store to clean state
    useGameStore.setState({
      testConfig: {
        mode: 'time',
        duration: 10, // Short duration for testing
        wordCount: 50,
        difficulty: 'Normal',
        textSource: 'english1k',
        punctuation: false,
      },
      gameStatus: 'ready',
      textToType: 'test words for timer integration',
      charStates: 'test words for timer integration'
        .split('')
        .map((char, index) => ({
          char,
          status: index === 0 ? 'current' : 'default',
        })),
      userInput: '',
      timeRemaining: 10000,
      isTimerRunning: false,
      gameStartTime: null,
      timerId: null,
      isPreparingGame: false,
      gamePreparationError: null,
      stats: {
        wpm: 0,
        accuracy: 0,
        startTime: 0,
        totalChars: 0,
        correctChars: 0,
        incorrectChars: 0,
        elapsedTime: 0,
      },
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.runOnlyPendingTimers();
  });

  it('starts timer when typing begins in time mode', async () => {
    render(<TypingArea />);

    // Verify timer display shows initial time
    expect(screen.getByText('10s')).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();

    // Start typing
    act(() => {
      fireEvent.keyDown(document, { key: 't' });
    });

    // Timer should now be running
    const state = useGameStore.getState();
    expect(state.gameStatus).toBe('running');
    expect(state.isTimerRunning).toBe(true);
    expect(screen.getByText('Running')).toBeInTheDocument();
  });

  it('counts down timer during typing', async () => {
    render(<TypingArea />);

    // Start typing
    act(() => {
      fireEvent.keyDown(document, { key: 't' });
    });

    // Advance timer by 3 seconds
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Timer should show reduced time
    const state = useGameStore.getState();
    expect(state.timeRemaining).toBeLessThan(10000);
    expect(state.timeRemaining).toBeGreaterThanOrEqual(7000);
  });

  it('automatically completes game when timer reaches zero', async () => {
    render(<TypingArea />);

    // Start typing
    act(() => {
      fireEvent.keyDown(document, { key: 't' });
    });

    // Fast forward to timer completion
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    // Game should be completed
    await waitFor(() => {
      const state = useGameStore.getState();
      expect(state.gameStatus).toBe('finished');
      expect(state.isTimerRunning).toBe(false);
    });
  });

  it('shows timer urgency styling as time runs low', async () => {
    render(<TypingArea />);

    // Start typing
    act(() => {
      fireEvent.keyDown(document, { key: 't' });
    });

    // Advance to 5 seconds remaining (very low time)
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Timer should show urgency styling
    const timerElement = screen.getByText('5s');
    expect(timerElement).toHaveClass('animate-bounce');
  });

  it('pauses and resumes timer correctly', async () => {
    render(<TypingArea />);

    // Start typing
    act(() => {
      fireEvent.keyDown(document, { key: 't' });
    });

    const initialState = useGameStore.getState();
    expect(initialState.isTimerRunning).toBe(true);

    // Pause game
    act(() => {
      useGameStore.getState().pauseGame();
    });

    const pausedState = useGameStore.getState();
    expect(pausedState.gameStatus).toBe('paused');
    expect(pausedState.isTimerRunning).toBe(false);

    // Resume game
    act(() => {
      useGameStore.getState().resumeGame();
    });

    const resumedState = useGameStore.getState();
    expect(resumedState.gameStatus).toBe('running');
    expect(resumedState.isTimerRunning).toBe(true);
  });

  it('resets timer when game is reset', async () => {
    render(<TypingArea />);

    // Start typing and let some time pass
    act(() => {
      fireEvent.keyDown(document, { key: 't' });
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Reset game
    act(() => {
      useGameStore.getState().resetGame();
    });

    const state = useGameStore.getState();
    expect(state.gameStatus).toBe('ready');
    expect(state.isTimerRunning).toBe(false);
    expect(state.timeRemaining).toBe(10000); // Back to full duration
    expect(state.timerId).toBe(null);
  });

  it('updates live stats during timer countdown', async () => {
    render(<TypingArea />);

    // Start typing
    act(() => {
      fireEvent.keyDown(document, { key: 't' });
    });

    // Type a few more characters
    act(() => {
      fireEvent.keyDown(document, { key: 'e' });
      fireEvent.keyDown(document, { key: 's' });
      fireEvent.keyDown(document, { key: 't' });
    });

    // Advance time to allow stats calculation
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Should show live stats
    expect(screen.getByText('WPM')).toBeInTheDocument();
    expect(screen.getByText('Accuracy')).toBeInTheDocument();
    expect(screen.getByText('Elapsed')).toBeInTheDocument();
  });

  it('handles configuration changes during timer operation', async () => {
    render(<TypingArea />);

    // Start typing
    act(() => {
      fireEvent.keyDown(document, { key: 't' });
    });

    // Change duration
    act(() => {
      useGameStore.getState().setTestConfig({ duration: 20 });
    });

    const state = useGameStore.getState();
    expect(state.timeRemaining).toBe(20000); // Should reset to new duration
  });

  it('preserves timer accuracy across multiple intervals', async () => {
    render(<TypingArea />);

    const startTime = Date.now();
    vi.setSystemTime(startTime);

    // Start typing
    act(() => {
      fireEvent.keyDown(document, { key: 't' });
    });

    // Advance in small increments to test precision
    for (let i = 0; i < 10; i++) {
      act(() => {
        vi.advanceTimersByTime(100);
      });
    }

    const state = useGameStore.getState();
    // Should have advanced approximately 1 second
    expect(state.timeRemaining).toBeLessThan(10000);
    expect(state.timeRemaining).toBeGreaterThanOrEqual(9000);
  });
});
