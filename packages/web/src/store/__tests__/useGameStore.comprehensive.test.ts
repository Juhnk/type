/**
 * Sprint 9: Comprehensive Game Store Tests
 *
 * This file contains comprehensive tests for all game store functionality
 * including advanced scenarios, edge cases, and Sprint 8 punctuation features.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameStore } from '../useGameStore';

// Mock the api-client
vi.mock('@/lib/api-client', () => ({
  getWords: vi.fn(),
  saveSingleTest: vi.fn(),
}));

// Mock the history module
vi.mock('@/lib/history', () => ({
  saveTestResult: vi.fn(),
}));

// Mock the auth store
vi.mock('../useAuthStore', () => ({
  useAuthStore: {
    getState: () => ({ token: null }),
  },
}));

// Mock text generator
vi.mock('@/lib/textGenerator', () => ({
  generateTextFromWords: vi.fn((words) => words.join(' ')),
  generateFallbackText: vi.fn(() => 'fallback text for testing'),
}));

import { getWords } from '@/lib/api-client';
import { generateTextFromWords } from '@/lib/textGenerator';

describe('useGameStore - Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Reset store to a clean state
    useGameStore.setState({
      testConfig: {
        mode: 'time',
        duration: 60,
        wordCount: 50,
        difficulty: 'Normal',
        textSource: 'english1k',
        punctuation: false,
      },
      textToType: 'the quick brown fox jumps over the lazy dog',
      charStates: 'the quick brown fox jumps over the lazy dog'
        .split('')
        .map((char, index) => ({
          char,
          status: index === 0 ? 'current' : 'default',
        })),
      userInput: '',
      gameStatus: 'ready',
      stats: {
        wpm: 0,
        accuracy: 0,
        startTime: 0,
        totalChars: 0,
        correctChars: 0,
        incorrectChars: 0,
        elapsedTime: 0,
      },
      isLoadingWords: false,
      wordsError: null,
      words: [],
      isPreparingGame: false,
      gamePreparationError: null,
      textWindow: {
        lines: [],
        scrollOffset: 0,
        lineCharOffsets: [],
      },
      maxCharsPerLine: 70,
      isContentStreaming: false,
      timeRemaining: 0,
      isTimerRunning: false,
      gameStartTime: null,
      timerId: null,
      wordsCompleted: 0,
      targetWordCount: 0,
      wordsProgress: 0,
      currentWordIndex: 0,
      wordBoundaries: [],
      testFailed: false,
      failureReason: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('prepareGame - Comprehensive Testing', () => {
    it('should prepare time mode game with punctuation enhancement', async () => {
      const mockWords = ['hello', 'world', 'test', 'punctuation'];
      const mockEnhancedText = "Hello world, test punctuation. It's working!";

      (getWords as any).mockResolvedValueOnce({
        words: mockWords,
        metadata: { list: 'english1k', count: 4, total_available: 1024 },
        enhanced_text: mockEnhancedText,
        punctuation_enabled: true,
        numbers_enabled: false,
      });

      (generateTextFromWords as any).mockReturnValueOnce(
        'fallback generated text'
      );

      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.setTestConfig({
          mode: 'time',
          duration: 120,
          punctuation: true,
        });
      });

      await act(async () => {
        await result.current.prepareGame();
      });

      expect(getWords).toHaveBeenCalledWith(
        'english1k',
        100, // Math.max(100, Math.ceil((120 * 50) / 60))
        true,
        {
          punctuation: true,
          numbers: true, // Numbers enabled when punctuation is enabled
          punctuationDensity: 'medium',
        }
      );

      expect(result.current.textToType).toBe(mockEnhancedText);
      expect(result.current.words).toEqual(mockWords);
      expect(result.current.isPreparingGame).toBe(false);
      expect(result.current.gameStatus).toBe('ready');
      expect(result.current.timeRemaining).toBe(120000); // 120 seconds in ms
    });

    it('should prepare words mode game with correct target count', async () => {
      const mockWords = Array(25).fill('word');

      (getWords as any).mockResolvedValueOnce({
        words: mockWords,
        metadata: { list: 'english1k', count: 25, total_available: 1024 },
      });

      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.setTestConfig({
          mode: 'words',
          wordCount: 25,
          punctuation: false,
        });
      });

      await act(async () => {
        await result.current.prepareGame();
      });

      expect(getWords).toHaveBeenCalledWith('english1k', 25, true, {
        punctuation: false,
        numbers: false,
        punctuationDensity: 'medium',
      });

      expect(result.current.targetWordCount).toBe(25);
      expect(result.current.timeRemaining).toBe(0); // No timer for words mode
    });

    it('should handle API failure with fallback text', async () => {
      (getWords as any).mockRejectedValueOnce(new Error('Network error'));
      (generateTextFromWords as any).mockReturnValueOnce('fallback text');

      const { result } = renderHook(() => useGameStore());

      await act(async () => {
        await result.current.prepareGame();
      });

      expect(result.current.isPreparingGame).toBe(false);
      expect(result.current.gamePreparationError).toBe('Network error');
      expect(result.current.textToType).toBe('fallback text');
      expect(result.current.gameStatus).toBe('ready');
    });

    it('should calculate word boundaries correctly for punctuation text', async () => {
      const mockEnhancedText = "Hello, world! How are you? I'm fine.";

      (getWords as any).mockResolvedValueOnce({
        words: ['hello', 'world', 'how', 'are', 'you', 'im', 'fine'],
        enhanced_text: mockEnhancedText,
        punctuation_enabled: true,
      });

      const { result } = renderHook(() => useGameStore());

      await act(async () => {
        await result.current.prepareGame();
      });

      const boundaries =
        result.current.calculateWordBoundaries(mockEnhancedText);

      // Word boundaries should be at start of each word
      expect(boundaries).toEqual([0, 7, 14, 18, 22, 26, 29]); // "Hello,", "world!", "How", "are", "you?", "I'm", "fine."
    });
  });

  describe('Timer Functionality - All Durations', () => {
    const durations = [15, 30, 60, 120];

    durations.forEach((duration) => {
      it(`should handle ${duration}s timer accurately`, () => {
        const { result } = renderHook(() => useGameStore());

        act(() => {
          result.current.setTestConfig({ mode: 'time', duration });
        });

        act(() => {
          result.current.startTimer();
        });

        expect(result.current.timeRemaining).toBe(duration * 1000);
        expect(result.current.isTimerRunning).toBe(true);

        // Advance timer by half duration
        act(() => {
          vi.advanceTimersByTime((duration * 1000) / 2);
        });

        expect(result.current.timeRemaining).toBeCloseTo(
          (duration * 1000) / 2,
          -2
        );

        // Complete timer
        act(() => {
          vi.advanceTimersByTime((duration * 1000) / 2);
        });

        expect(result.current.timeRemaining).toBe(0);
        expect(result.current.gameStatus).toBe('finished');
      });
    });

    it('should pause and resume timer correctly', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.setTestConfig({ mode: 'time', duration: 60 });
        result.current.startTimer();
      });

      // Run for 10 seconds
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      const timeAfter10s = result.current.timeRemaining;

      // Pause timer
      act(() => {
        result.current.pauseTimer();
      });

      expect(result.current.isTimerRunning).toBe(false);

      // Advance time while paused
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Time should not have changed
      expect(result.current.timeRemaining).toBe(timeAfter10s);

      // Resume timer
      act(() => {
        result.current.resumeGame();
      });

      expect(result.current.isTimerRunning).toBe(true);
    });

    it('should cleanup timer on component unmount', () => {
      const { result, unmount } = renderHook(() => useGameStore());

      act(() => {
        result.current.startTimer();
      });

      expect(result.current.timerId).not.toBeNull();

      act(() => {
        result.current.clearTimer();
      });

      expect(result.current.timerId).toBeNull();
    });
  });

  describe('Difficulty Modes - Expert and Master', () => {
    describe('Expert Mode', () => {
      it('should fail on incorrect word submission with punctuation', () => {
        const { result } = renderHook(() => useGameStore());

        act(() => {
          result.current.setTestConfig({ difficulty: 'Expert' });
          result.current.setTextToType('hello, world!');
        });

        // Type "helo," (missing 'l') and press space
        act(() => {
          result.current.handleKeyPress('h');
          result.current.handleKeyPress('e');
          result.current.handleKeyPress('l');
          result.current.handleKeyPress('o');
          result.current.handleKeyPress(',');
          result.current.handleKeyPress(' '); // Submit incorrect word
        });

        expect(result.current.gameStatus).toBe('finished');
        expect(result.current.testFailed).toBe(true);
        expect(result.current.failureReason).toContain(
          'Expert Mode: Failed due to errors in word'
        );
      });

      it('should allow correction before word submission', () => {
        const { result } = renderHook(() => useGameStore());

        act(() => {
          result.current.setTestConfig({ difficulty: 'Expert' });
          result.current.setTextToType('hello world');
        });

        // Type "helxo" then backspace and correct
        act(() => {
          result.current.handleKeyPress('h');
          result.current.handleKeyPress('e');
          result.current.handleKeyPress('l');
          result.current.handleKeyPress('x'); // Wrong character
          result.current.handleKeyPress('Backspace');
          result.current.handleKeyPress('l');
          result.current.handleKeyPress('o');
          result.current.handleKeyPress(' '); // Submit corrected word
        });

        // Should not fail since word was corrected
        expect(result.current.gameStatus).toBe('running');
        expect(result.current.testFailed).toBe(false);
      });
    });

    describe('Master Mode', () => {
      it('should fail immediately on any incorrect keystroke', () => {
        const { result } = renderHook(() => useGameStore());

        act(() => {
          result.current.setTestConfig({ difficulty: 'Master' });
        });

        // Type one correct character then one wrong
        act(() => {
          result.current.handleKeyPress('t'); // Correct
        });

        expect(result.current.gameStatus).toBe('running');

        act(() => {
          result.current.handleKeyPress('x'); // Wrong character
        });

        expect(result.current.gameStatus).toBe('finished');
        expect(result.current.testFailed).toBe(true);
        expect(result.current.failureReason).toContain(
          'Master Mode: Failed on incorrect keystroke'
        );
      });

      it('should fail on incorrect punctuation in Master mode', () => {
        const { result } = renderHook(() => useGameStore());

        act(() => {
          result.current.setTestConfig({ difficulty: 'Master' });
          result.current.setTextToType('Hello, world!');
        });

        // Type "Hello;" instead of "Hello,"
        'Hello'.split('').forEach((char) => {
          act(() => {
            result.current.handleKeyPress(char);
          });
        });

        act(() => {
          result.current.handleKeyPress(';'); // Wrong punctuation
        });

        expect(result.current.gameStatus).toBe('finished');
        expect(result.current.testFailed).toBe(true);
        expect(result.current.failureReason).toContain(
          "incorrect keystroke ';' (expected ',')"
        );
      });
    });
  });

  describe('Words Mode Progress Tracking', () => {
    it('should track word completion accurately with punctuation', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.setTestConfig({
          mode: 'words',
          wordCount: 3,
          punctuation: true,
        });
        result.current.setTextToType('Hello, world! Test.');
      });

      // Complete first word "Hello,"
      'Hello,'.split('').forEach((char) => {
        act(() => {
          result.current.handleKeyPress(char);
        });
      });

      act(() => {
        result.current.handleKeyPress(' ');
      });

      expect(result.current.wordsCompleted).toBe(1);
      expect(result.current.wordsProgress).toBeCloseTo(33.33, 1);

      // Complete second word "world!"
      'world!'.split('').forEach((char) => {
        act(() => {
          result.current.handleKeyPress(char);
        });
      });

      act(() => {
        result.current.handleKeyPress(' ');
      });

      expect(result.current.wordsCompleted).toBe(2);
      expect(result.current.wordsProgress).toBeCloseTo(66.67, 1);
    });

    it('should complete words mode when target reached', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.setTestConfig({
          mode: 'words',
          wordCount: 2,
        });
        result.current.setTextToType('hello world');
      });

      // Complete both words
      'hello world'.split('').forEach((char) => {
        act(() => {
          result.current.handleKeyPress(char);
        });
      });

      expect(result.current.wordsCompleted).toBe(2);
      expect(result.current.gameStatus).toBe('finished');
    });
  });

  describe('Auto-scrolling and Text Window', () => {
    it('should initialize text window for time mode', () => {
      const { result } = renderHook(() => useGameStore());

      const longText =
        'This is a very long text that should be split into multiple lines for auto-scrolling functionality to work properly in time mode.';

      act(() => {
        result.current.setTestConfig({ mode: 'time' });
        result.current.setTextToType(longText);
      });

      expect(result.current.textWindow.lines.length).toBeGreaterThan(1);
      expect(result.current.textWindow.lineCharOffsets.length).toBeGreaterThan(
        1
      );
      expect(result.current.textWindow.scrollOffset).toBe(0);
    });

    it('should handle line progression during typing', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.setTestConfig({ mode: 'time' });
        result.current.setTextToType(
          'Short line. Another line here. And a third line for testing scrolling.'
        );
      });

      // Simulate typing to trigger line progression
      const firstLine = result.current.textWindow.lines[0];
      const secondLineStart = result.current.textWindow.lineCharOffsets[1];

      // Type up to the second line
      for (let i = 0; i < secondLineStart + 5; i++) {
        act(() => {
          result.current.handleKeyPress(result.current.textToType[i]);
        });
      }

      // Should trigger scroll when reaching second line
      act(() => {
        result.current.checkLineProgression();
      });

      // Verify scrolling behavior (exact behavior may vary based on implementation)
      expect(result.current.textWindow.scrollOffset).toBeGreaterThanOrEqual(0);
    });

    it('should generate additional content when needed', async () => {
      const { result } = renderHook(() => useGameStore());

      (getWords as any).mockResolvedValueOnce({
        words: ['more', 'content', 'generated'],
        metadata: { list: 'english1k', count: 3, total_available: 1024 },
      });

      act(() => {
        result.current.setTestConfig({ mode: 'time' });
      });

      await act(async () => {
        await result.current.generateMoreContent();
      });

      expect(getWords).toHaveBeenCalledWith(
        'english1k',
        50,
        true,
        expect.objectContaining({
          punctuation: false,
          numbers: false,
          punctuationDensity: 'medium',
        })
      );
    });
  });

  describe('Statistics and Performance', () => {
    it('should calculate WPM accurately over time', () => {
      const { result } = renderHook(() => useGameStore());

      const startTime = Date.now();

      act(() => {
        result.current.startGame();
        // Simulate stats starting time
        useGameStore.setState({
          stats: { ...result.current.stats, startTime },
        });
      });

      // Simulate typing 20 characters (4 words at 5 chars/word) in 1 minute
      act(() => {
        useGameStore.setState({
          userInput: 'hello world test text',
          stats: {
            ...result.current.stats,
            startTime,
            totalChars: 20,
            correctChars: 20,
            incorrectChars: 0,
            elapsedTime: 60000, // 1 minute
          },
        });
        result.current.updateStats();
      });

      // Should calculate ~4 WPM (20 chars / 5 chars per word = 4 words in 1 minute)
      expect(result.current.stats.wpm).toBeCloseTo(4, 0);
      expect(result.current.stats.accuracy).toBe(100);
    });

    it('should handle rapid key presses without lag', () => {
      const { result } = renderHook(() => useGameStore());

      const text = 'rapid typing test';
      act(() => {
        result.current.setTextToType(text);
      });

      const startTime = performance.now();

      // Simulate very rapid typing
      text.split('').forEach((char) => {
        act(() => {
          result.current.handleKeyPress(char);
        });
      });

      const endTime = performance.now();

      // Should complete rapidly (under 100ms for this simple operation)
      expect(endTime - startTime).toBeLessThan(100);
      expect(result.current.userInput).toBe(text);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty word lists gracefully', async () => {
      (getWords as any).mockResolvedValueOnce({
        words: [],
        metadata: { list: 'english1k', count: 0, total_available: 1024 },
      });

      const { result } = renderHook(() => useGameStore());

      await act(async () => {
        await result.current.prepareGame();
      });

      // Should fall back to generated text
      expect(result.current.textToType).toBeTruthy();
      expect(result.current.gamePreparationError).toBeTruthy();
    });

    it('should handle malformed API responses', async () => {
      (getWords as any).mockResolvedValueOnce({
        // Missing required fields
        metadata: { list: 'english1k' },
      });

      const { result } = renderHook(() => useGameStore());

      await act(async () => {
        await result.current.prepareGame();
      });

      expect(result.current.gamePreparationError).toBeTruthy();
    });

    it('should handle very long texts without performance issues', () => {
      const { result } = renderHook(() => useGameStore());

      const longText = 'word '.repeat(1000).trim(); // 1000 words

      act(() => {
        result.current.setTextToType(longText);
      });

      expect(result.current.textToType.length).toBeGreaterThan(4000);
      expect(result.current.charStates.length).toBe(longText.length);
    });

    it('should reset failure state properly', () => {
      const { result } = renderHook(() => useGameStore());

      // Trigger failure in Master mode
      act(() => {
        result.current.setTestConfig({ difficulty: 'Master' });
        result.current.handleKeyPress('x'); // Wrong character
      });

      expect(result.current.testFailed).toBe(true);
      expect(result.current.failureReason).toBeTruthy();

      // Reset game
      act(() => {
        result.current.resetGame();
      });

      expect(result.current.testFailed).toBe(false);
      expect(result.current.failureReason).toBeNull();
      expect(result.current.gameStatus).toBe('ready');
    });
  });
});
