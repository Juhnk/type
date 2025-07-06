import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useGameStore } from '../useGameStore';

// Mock timers
vi.useFakeTimers();

describe('Timer functionality', () => {
  beforeEach(() => {
    vi.clearAllTimers();
    // Reset store to initial state
    useGameStore.setState({
      testConfig: {
        mode: 'time',
        duration: 30,
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
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Timer state initialization', () => {
    it('initializes timer state correctly for time mode', () => {
      const store = useGameStore.getState();

      expect(store.timeRemaining).toBe(0);
      expect(store.isTimerRunning).toBe(false);
      expect(store.gameStartTime).toBe(null);
      expect(store.timerId).toBe(null);
    });

    it('sets timeRemaining when config changes to time mode', () => {
      const { setTestConfig } = useGameStore.getState();

      setTestConfig({ mode: 'time', duration: 60 });

      const state = useGameStore.getState();
      expect(state.timeRemaining).toBe(60000); // 60 seconds in ms
    });
  });

  describe('Timer lifecycle', () => {
    it('starts timer when game starts in time mode', () => {
      const { startTimer } = useGameStore.getState();
      const startTime = Date.now();
      vi.setSystemTime(startTime);

      startTimer();

      const state = useGameStore.getState();
      expect(state.isTimerRunning).toBe(true);
      expect(state.gameStartTime).toBe(startTime);
      expect(state.timeRemaining).toBe(30000); // 30 seconds
      expect(state.timerId).toBeTruthy();
    });

    it('does not start timer for non-time modes', () => {
      useGameStore.setState({
        testConfig: { ...useGameStore.getState().testConfig, mode: 'words' },
      });

      const { startTimer } = useGameStore.getState();
      startTimer();

      const state = useGameStore.getState();
      expect(state.isTimerRunning).toBe(false);
      expect(state.timerId).toBe(null);
    });

    it('pauses timer correctly', () => {
      const { startTimer, pauseTimer } = useGameStore.getState();

      startTimer();
      pauseTimer();

      const state = useGameStore.getState();
      expect(state.isTimerRunning).toBe(false);
      expect(state.timerId).toBe(null);
    });

    it('resets timer correctly', () => {
      const { startTimer, resetTimer } = useGameStore.getState();

      startTimer();
      resetTimer();

      const state = useGameStore.getState();
      expect(state.isTimerRunning).toBe(false);
      expect(state.timerId).toBe(null);
      expect(state.gameStartTime).toBe(null);
      expect(state.timeRemaining).toBe(30000); // Reset to original duration
    });

    it('clears timer on cleanup', () => {
      const { startTimer, clearTimer } = useGameStore.getState();

      startTimer();
      clearTimer();

      const state = useGameStore.getState();
      expect(state.timerId).toBe(null);
    });
  });

  describe('Timer countdown', () => {
    it('updates timeRemaining as timer runs', () => {
      const { startTimer } = useGameStore.getState();
      const startTime = Date.now();
      vi.setSystemTime(startTime);

      startTimer();

      // Advance time by 1 second
      vi.advanceTimersByTime(1000);

      const state = useGameStore.getState();
      expect(state.timeRemaining).toBeLessThan(30000);
      expect(state.timeRemaining).toBeGreaterThanOrEqual(29000);
    });

    it('completes game when timer reaches zero', () => {
      const { startTimer } = useGameStore.getState();
      const startTime = Date.now();
      vi.setSystemTime(startTime);

      // Mock completeGame to avoid async complications
      const completeGameSpy = vi.fn();
      useGameStore.setState({ completeGame: completeGameSpy });

      startTimer();

      // Advance time by full duration
      vi.advanceTimersByTime(30000);

      expect(completeGameSpy).toHaveBeenCalled();
    });

    it('does not go below zero timeRemaining', () => {
      const { startTimer } = useGameStore.getState();
      const startTime = Date.now();
      vi.setSystemTime(startTime);

      startTimer();

      // Advance time beyond duration
      vi.advanceTimersByTime(35000);

      const state = useGameStore.getState();
      expect(state.timeRemaining).toBe(0);
    });
  });

  describe('Timer integration with game lifecycle', () => {
    it('starts timer when game starts via startGame', () => {
      const { startGame } = useGameStore.getState();
      const startTime = Date.now();
      vi.setSystemTime(startTime);

      startGame();

      const state = useGameStore.getState();
      expect(state.gameStatus).toBe('running');
      expect(state.isTimerRunning).toBe(true);
      expect(state.stats.startTime).toBe(startTime);
    });

    it('pauses timer when game is paused', () => {
      const { startGame, pauseGame } = useGameStore.getState();

      startGame();
      pauseGame();

      const state = useGameStore.getState();
      expect(state.gameStatus).toBe('paused');
      expect(state.isTimerRunning).toBe(false);
    });

    it('resumes timer when game is resumed', () => {
      const { startGame, pauseGame, resumeGame } = useGameStore.getState();

      startGame();
      pauseGame();
      resumeGame();

      const state = useGameStore.getState();
      expect(state.gameStatus).toBe('running');
      // Timer should restart with remaining time
    });

    it('resets timer when game is reset', () => {
      const { startGame, resetGame } = useGameStore.getState();

      startGame();
      vi.advanceTimersByTime(5000); // Let some time pass
      resetGame();

      const state = useGameStore.getState();
      expect(state.gameStatus).toBe('ready');
      expect(state.isTimerRunning).toBe(false);
      expect(state.timeRemaining).toBe(30000); // Reset to full duration
    });

    it('clears timer when game completes', () => {
      const { startGame, completeGame } = useGameStore.getState();

      startGame();
      completeGame();

      // Timer should be cleared after completion
      const state = useGameStore.getState();
      expect(state.timerId).toBe(null);
    });
  });

  describe('Timer precision and performance', () => {
    it('updates timer at 100ms intervals', () => {
      const { startTimer } = useGameStore.getState();

      startTimer();

      // Check that timer updates occur every 100ms
      vi.advanceTimersByTime(100);
      // Timer should have updated at least once
      expect(vi.getTimerCount()).toBeGreaterThan(0);
    });

    it('handles rapid start/stop cycles', () => {
      const { startTimer, pauseTimer } = useGameStore.getState();

      // Rapid start/stop
      for (let i = 0; i < 5; i++) {
        startTimer();
        pauseTimer();
      }

      const state = useGameStore.getState();
      expect(state.isTimerRunning).toBe(false);
      expect(state.timerId).toBe(null);
    });
  });

  describe('Different time durations', () => {
    const durations = [15, 30, 60, 120];

    durations.forEach((duration) => {
      it(`works correctly with ${duration} second duration`, () => {
        useGameStore.setState({
          testConfig: { ...useGameStore.getState().testConfig, duration },
        });

        const { setTestConfig, startTimer } = useGameStore.getState();
        setTestConfig({ duration });

        startTimer();

        const state = useGameStore.getState();
        expect(state.timeRemaining).toBe(duration * 1000);
      });
    });
  });
});
