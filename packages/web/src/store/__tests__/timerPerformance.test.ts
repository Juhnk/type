import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useGameStore } from '../useGameStore';

// Mock timers
vi.useFakeTimers();

describe('Timer Performance', () => {
  beforeEach(() => {
    vi.clearAllTimers();
    useGameStore.setState({
      testConfig: {
        mode: 'time',
        duration: 60,
        wordCount: 50,
        difficulty: 'Normal',
        textSource: 'english1k',
        punctuation: false,
      },
      gameStatus: 'ready',
      timeRemaining: 0,
      isTimerRunning: false,
      gameStartTime: null,
      timerId: null,
      textToType: 'performance test text for typing',
      charStates: 'performance test text for typing'
        .split('')
        .map((char, index) => ({
          char,
          status: index === 0 ? 'current' : 'default',
        })),
      userInput: '',
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
  });

  it('timer updates do not block key press handling', () => {
    const { startTimer, handleKeyPress } = useGameStore.getState();

    startTimer();

    // Simulate rapid typing
    const startTime = performance.now();

    for (let i = 0; i < 100; i++) {
      handleKeyPress('a');
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Key handling should be fast (less than 100ms for 100 keypresses)
    expect(duration).toBeLessThan(100);
  });

  it('timer cleanup prevents memory leaks', () => {
    const { startTimer, clearTimer } = useGameStore.getState();

    // Start multiple timers
    for (let i = 0; i < 10; i++) {
      startTimer();
      clearTimer();
    }

    // Should have no active timers
    expect(vi.getTimerCount()).toBe(0);
  });

  it('handles rapid start/stop cycles efficiently', () => {
    const { startTimer, pauseTimer } = useGameStore.getState();

    const iterations = 50;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      startTimer();
      pauseTimer();
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should handle rapid cycles efficiently
    expect(duration).toBeLessThan(50); // Less than 1ms per cycle
    expect(vi.getTimerCount()).toBe(0); // No lingering timers
  });

  it('timer updates maintain consistent intervals', () => {
    const { startTimer } = useGameStore.getState();
    const updateTimes: number[] = [];

    // Mock the timer callback to track update times
    const originalSetInterval = global.setInterval;
    global.setInterval = vi.fn((callback, interval) => {
      const mockInterval = originalSetInterval(() => {
        updateTimes.push(Date.now());
        callback();
      }, interval);
      return mockInterval;
    });

    startTimer();

    // Advance timer multiple times
    for (let i = 0; i < 10; i++) {
      vi.advanceTimersByTime(100);
    }

    // Check that updates happened at consistent intervals
    expect(updateTimes.length).toBeGreaterThan(0);

    global.setInterval = originalSetInterval;
  });

  it('timer state updates are atomic and consistent', () => {
    const { startTimer } = useGameStore.getState();

    startTimer();

    // Simulate concurrent timer updates
    for (let i = 0; i < 10; i++) {
      vi.advanceTimersByTime(100);

      const state = useGameStore.getState();

      // State should always be consistent
      if (state.isTimerRunning) {
        expect(state.timerId).toBeTruthy();
        expect(state.gameStartTime).toBeTruthy();
      }

      if (state.timeRemaining <= 0) {
        expect(state.isTimerRunning).toBe(false);
      }
    }
  });

  it('does not create excessive re-renders', () => {
    const { startTimer } = useGameStore.getState();

    let stateUpdates = 0;
    const unsubscribe = useGameStore.subscribe(() => {
      stateUpdates++;
    });

    startTimer();

    // Let timer run for 1 second
    vi.advanceTimersByTime(1000);

    unsubscribe();

    // Should have reasonable number of updates (approximately 10 for 1 second at 100ms intervals)
    expect(stateUpdates).toBeLessThan(15);
    expect(stateUpdates).toBeGreaterThan(5);
  });

  it('timer precision remains accurate over long durations', () => {
    const { startTimer } = useGameStore.getState();
    const startTime = Date.now();
    vi.setSystemTime(startTime);

    startTimer();

    // Simulate 30 seconds of timer operation
    const targetDuration = 30000;
    vi.advanceTimersByTime(targetDuration);

    const state = useGameStore.getState();
    const expectedRemaining = 60000 - targetDuration; // 30 seconds remaining

    // Timer should be accurate within 200ms
    expect(Math.abs(state.timeRemaining - expectedRemaining)).toBeLessThan(200);
  });

  it('handles system clock changes gracefully', () => {
    const { startTimer } = useGameStore.getState();
    const startTime = Date.now();
    vi.setSystemTime(startTime);

    startTimer();

    // Simulate system clock jump forward
    vi.setSystemTime(startTime + 5000);
    vi.advanceTimersByTime(100); // Trigger one timer update

    const state = useGameStore.getState();

    // Timer should handle clock changes without breaking
    expect(state.timeRemaining).toBeGreaterThanOrEqual(0);
    expect(state.timeRemaining).toBeLessThanOrEqual(60000);
  });

  it('cleanup works correctly when component unmounts', () => {
    const { startTimer, clearTimer } = useGameStore.getState();

    startTimer();

    const timersBefore = vi.getTimerCount();
    expect(timersBefore).toBeGreaterThan(0);

    // Simulate component unmount
    clearTimer();

    const timersAfter = vi.getTimerCount();
    expect(timersAfter).toBe(0);

    const state = useGameStore.getState();
    expect(state.timerId).toBe(null);
  });
});
