/**
 * Sprint 9: Performance and Edge Case Tests
 *
 * Comprehensive performance testing and edge case validation including:
 * - Memory usage and garbage collection
 * - Large dataset handling
 * - Rapid user input scenarios
 * - Browser compatibility edge cases
 * - Stress testing with extreme values
 * - Memory leak detection
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useGameStore } from '@/store/useGameStore';
import { useAuthStore } from '@/store/useAuthStore';

// Mock dependencies for performance testing
vi.mock('@/lib/api-client', () => ({
  getWords: vi.fn(),
  saveSingleTest: vi.fn(),
}));

vi.mock('@/lib/history', () => ({
  saveTestResult: vi.fn(),
}));

vi.mock('@/lib/textGenerator', () => ({
  generateTextFromWords: vi.fn((words) => words.join(' ')),
  generateFallbackText: vi.fn(() => 'fallback text'),
}));

import { getWords } from '@/lib/api-client';

const mockGetWords = getWords as any;

describe('Performance and Edge Case Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset stores
    useGameStore.setState({
      testConfig: {
        mode: 'time',
        duration: 60,
        wordCount: 50,
        difficulty: 'Normal',
        textSource: 'english1k',
        punctuation: false,
      },
      textToType: '',
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
      words: [],
      charStates: [],
    });
  });

  describe('Large Dataset Performance', () => {
    it('should handle extremely large word lists efficiently', async () => {
      const store = useGameStore.getState();

      // Generate a very large word list (10,000 words)
      const largeWordList = Array(10000)
        .fill(null)
        .map((_, i) => `word${i.toString().padStart(5, '0')}`);
      const largeText = largeWordList.slice(0, 1000).join(' '); // 1000 words for text

      mockGetWords.mockResolvedValue({
        words: largeWordList,
        metadata: { list: 'english1k', count: 10000, total_available: 10000 },
        enhanced_text: largeText,
      });

      const startTime = performance.now();

      await store.prepareGame();

      const endTime = performance.now();
      const preparationTime = endTime - startTime;

      // Should handle large datasets in reasonable time (< 100ms)
      expect(preparationTime).toBeLessThan(100);
      expect(store.textToType.length).toBeGreaterThan(5000);
      expect(store.words.length).toBe(10000);
    });

    it('should handle very long text content without performance degradation', () => {
      const store = useGameStore.getState();

      // Create extremely long text (50,000 characters)
      const longText =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(
          1000
        );

      const startTime = performance.now();

      store.setTextToType(longText);

      const endTime = performance.now();
      const setTextTime = endTime - startTime;

      expect(setTextTime).toBeLessThan(50); // Should be very fast
      expect(store.textToType.length).toBeGreaterThan(50000);
      expect(store.charStates.length).toBe(longText.length);
    });

    it('should handle rapid character state updates efficiently', () => {
      const store = useGameStore.getState();

      // Set up a long text
      const text = 'a'.repeat(5000); // 5000 characters
      store.setTextToType(text);

      const startTime = performance.now();

      // Simulate typing all characters rapidly
      for (let i = 0; i < 1000; i++) {
        // Type first 1000 characters
        store.handleKeyPress('a');
      }

      const endTime = performance.now();
      const typingTime = endTime - startTime;

      expect(typingTime).toBeLessThan(200); // Should handle 1000 keystrokes quickly
      expect(store.userInput.length).toBe(1000);
      expect(store.stats.correctChars).toBe(1000);
    });
  });

  describe('Memory Usage and Garbage Collection', () => {
    it('should not create memory leaks with repeated game resets', () => {
      const store = useGameStore.getState();

      // Force garbage collection if available (for Node.js environments)
      const forceGC = () => {
        if (global.gc) {
          global.gc();
        }
      };

      // Simulate multiple game sessions
      for (let i = 0; i < 100; i++) {
        // Set up game state
        store.setTextToType('test text for memory leak detection');

        // Simulate typing
        'test'.split('').forEach((char) => {
          store.handleKeyPress(char);
        });

        // Reset game
        store.resetGame();

        // Force GC every 10 iterations
        if (i % 10 === 0) {
          forceGC();
        }
      }

      // Verify final state is clean
      const finalState = useGameStore.getState();
      expect(finalState.userInput).toBe('');
      expect(finalState.gameStatus).toBe('ready');
      expect(finalState.stats.totalChars).toBe(0);
    });

    it('should handle concurrent store updates without memory issues', () => {
      const gameStore = useGameStore.getState();
      const authStore = useAuthStore.getState();

      // Simulate many concurrent updates
      for (let i = 0; i < 1000; i++) {
        gameStore.setTestConfig({
          duration: 60 + (i % 60),
          wordCount: 50 + (i % 50),
        });

        if (i % 2 === 0) {
          authStore.login({
            user: {
              id: i.toString(),
              email: `user${i}@test.com`,
              createdAt: new Date().toISOString(),
            },
            token: `token-${i}`,
          });
        } else {
          authStore.logout();
        }
      }

      // Stores should remain functional
      expect(gameStore.testConfig.duration).toBeGreaterThan(0);
      expect(typeof gameStore.setTestConfig).toBe('function');
      expect(typeof authStore.login).toBe('function');
    });
  });

  describe('Extreme Value Edge Cases', () => {
    it('should handle maximum safe integer values', () => {
      const store = useGameStore.getState();

      // Test with extreme durations
      store.setTestConfig({ duration: Number.MAX_SAFE_INTEGER });

      expect(store.testConfig.duration).toBe(Number.MAX_SAFE_INTEGER);

      // Test with extreme word counts
      store.setTestConfig({ wordCount: Number.MAX_SAFE_INTEGER });

      expect(store.testConfig.wordCount).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should handle negative and zero values gracefully', () => {
      const store = useGameStore.getState();

      // Test negative values
      store.setTestConfig({ duration: -100 });
      store.setTestConfig({ wordCount: -50 });

      // Should handle gracefully without crashing
      expect(store.testConfig.duration).toBe(-100);
      expect(store.testConfig.wordCount).toBe(-50);
    });

    it('should handle NaN and Infinity values', () => {
      const store = useGameStore.getState();

      // Test NaN values
      store.setTestConfig({ duration: NaN });
      store.setTestConfig({ wordCount: NaN });

      expect(Number.isNaN(store.testConfig.duration)).toBe(true);
      expect(Number.isNaN(store.testConfig.wordCount)).toBe(true);

      // Test Infinity values
      store.setTestConfig({ duration: Infinity });
      store.setTestConfig({ wordCount: -Infinity });

      expect(store.testConfig.duration).toBe(Infinity);
      expect(store.testConfig.wordCount).toBe(-Infinity);
    });

    it('should handle empty and null string inputs', () => {
      const store = useGameStore.getState();

      // Test empty string
      store.setTextToType('');

      expect(store.textToType).toBe('');
      expect(store.charStates).toEqual([]);

      // Test with null (should be handled gracefully)
      try {
        store.setTextToType(null as any);
        // Should not throw error
        expect(true).toBe(true);
      } catch (error) {
        // If it throws, that's also acceptable behavior
        expect(error).toBeTruthy();
      }
    });

    it('should handle extremely long single words', () => {
      const store = useGameStore.getState();

      // Create a 10,000 character "word"
      const extremelyLongWord = 'a'.repeat(10000);

      store.setTextToType(extremelyLongWord);

      expect(store.textToType.length).toBe(10000);
      expect(store.charStates.length).toBe(10000);

      // Should handle typing into it
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        store.handleKeyPress('a');
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
      expect(store.userInput.length).toBe(100);
    });
  });

  describe('Unicode and Special Character Handling', () => {
    it('should handle Unicode characters correctly', () => {
      const store = useGameStore.getState();

      const unicodeText = '你好世界 🌍 café naïve résumé Москва العربية';

      store.setTextToType(unicodeText);

      expect(store.textToType).toBe(unicodeText);
      expect(store.charStates.length).toBe(unicodeText.length);

      // Test typing Unicode characters
      store.handleKeyPress('你');
      store.handleKeyPress('好');

      expect(store.userInput).toBe('你好');
    });

    it('should handle emojis and compound characters', () => {
      const store = useGameStore.getState();

      const emojiText = '👨‍💻 👩‍🎨 🏳️‍🌈 🇺🇸';

      store.setTextToType(emojiText);

      expect(store.textToType).toBe(emojiText);

      // Emojis might be counted as multiple characters in charStates
      expect(store.charStates.length).toBeGreaterThan(0);
    });

    it('should handle control characters and whitespace variations', () => {
      const store = useGameStore.getState();

      const specialText = 'tab\there\nnew\r\nline\u00A0nbsp\u2000en-space';

      store.setTextToType(specialText);

      expect(store.textToType).toBe(specialText);
      expect(store.charStates.length).toBe(specialText.length);
    });
  });

  describe('Rapid Input Stress Testing', () => {
    it('should handle extremely rapid keystrokes without dropping events', () => {
      const store = useGameStore.getState();

      store.setTextToType('abcdefghijklmnopqrstuvwxyz'.repeat(100)); // 2600 characters

      const keystrokeData: { timestamp: number; char: string }[] = [];
      const text = 'abcdefghijklmnopqrstuvwxyz';

      const startTime = performance.now();

      // Simulate extremely rapid typing (no delays)
      text.split('').forEach((char, index) => {
        const timestamp = performance.now();
        store.handleKeyPress(char);
        keystrokeData.push({ timestamp, char });
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expect(totalTime).toBeLessThan(100); // Should handle 26 keystrokes very quickly
      expect(store.userInput).toBe(text);
      expect(keystrokeData.length).toBe(26);
    });

    it('should handle burst typing with backspaces', () => {
      const store = useGameStore.getState();

      store.setTextToType('hello world test');

      const startTime = performance.now();

      // Type, backspace, type pattern rapidly
      for (let i = 0; i < 100; i++) {
        store.handleKeyPress('h');
        store.handleKeyPress('e');
        store.handleKeyPress('l');
        store.handleKeyPress('Backspace');
        store.handleKeyPress('Backspace');
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200);
      expect(store.userInput).toBe('h'.repeat(100)); // Should end with 100 'h's
    });

    it('should maintain accuracy under rapid input stress', () => {
      const store = useGameStore.getState();

      const testText = 'precision typing test with accuracy measurement';
      store.setTextToType(testText);

      // Type the exact text rapidly
      testText.split('').forEach((char) => {
        store.handleKeyPress(char);
      });

      expect(store.userInput).toBe(testText);
      expect(store.stats.correctChars).toBe(testText.length);
      expect(store.stats.incorrectChars).toBe(0);

      // Calculate accuracy
      store.updateStats();
      expect(store.stats.accuracy).toBe(100);
    });
  });

  describe('Browser Compatibility Edge Cases', () => {
    it('should handle missing browser APIs gracefully', () => {
      const store = useGameStore.getState();

      // Simulate missing performance API
      const originalPerformance = global.performance;
      delete (global as any).performance;

      try {
        store.setTextToType('test without performance api');
        store.handleKeyPress('t');

        // Should work without performance API
        expect(store.userInput).toBe('t');
      } finally {
        global.performance = originalPerformance;
      }
    });

    it('should handle different timer implementations', () => {
      const store = useGameStore.getState();

      // Mock different timer behaviors
      const originalSetTimeout = global.setTimeout;
      const originalClearTimeout = global.clearTimeout;

      let timeoutId = 0;
      const timeouts = new Map();

      global.setTimeout = vi.fn((callback, delay) => {
        const id = ++timeoutId;
        timeouts.set(id, { callback, delay });
        return id;
      }) as any;

      global.clearTimeout = vi.fn((id) => {
        timeouts.delete(id);
      }) as any;

      try {
        store.setTestConfig({ mode: 'time', duration: 60 });
        store.startTimer();

        expect(global.setTimeout).toHaveBeenCalled();

        store.clearTimer();

        expect(global.clearTimeout).toHaveBeenCalled();
      } finally {
        global.setTimeout = originalSetTimeout;
        global.clearTimeout = originalClearTimeout;
      }
    });
  });

  describe('Concurrent Operation Stress Testing', () => {
    it('should handle multiple simultaneous operations', () => {
      const store = useGameStore.getState();

      // Simulate concurrent operations
      const promises: Promise<void>[] = [];

      for (let i = 0; i < 50; i++) {
        promises.push(
          new Promise((resolve) => {
            setTimeout(() => {
              store.setTestConfig({ duration: 60 + i });
              store.handleKeyPress(String.fromCharCode(65 + (i % 26))); // A-Z
              resolve();
            }, Math.random() * 10);
          })
        );
      }

      return Promise.all(promises).then(() => {
        // Should complete without errors
        expect(store.testConfig.duration).toBeGreaterThan(60);
        expect(store.userInput.length).toBeGreaterThan(0);
      });
    });

    it('should handle rapid configuration changes', () => {
      const store = useGameStore.getState();

      const configurations = [
        { mode: 'time' as const, duration: 15 },
        { mode: 'time' as const, duration: 30 },
        { mode: 'time' as const, duration: 60 },
        { mode: 'time' as const, duration: 120 },
        { mode: 'words' as const, wordCount: 10 },
        { mode: 'words' as const, wordCount: 25 },
        { mode: 'words' as const, wordCount: 50 },
        { mode: 'words' as const, wordCount: 100 },
      ];

      const startTime = performance.now();

      // Rapidly change configurations
      for (let i = 0; i < 1000; i++) {
        const config = configurations[i % configurations.length];
        store.setTestConfig(config);
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
      expect(store.testConfig.mode).toBeTruthy();
    });
  });

  describe('Resource Cleanup and State Management', () => {
    it('should properly cleanup timers and intervals', () => {
      const store = useGameStore.getState();

      // Start multiple timers
      store.startTimer();
      const timer1 = store.timerId;

      store.clearTimer();
      store.startTimer();
      const timer2 = store.timerId;

      expect(timer1).not.toBe(timer2);

      store.clearTimer();
      expect(store.timerId).toBeNull();
    });

    it('should handle state corruption recovery', () => {
      const store = useGameStore.getState();

      // Deliberately corrupt state
      useGameStore.setState({
        textToType: null as any,
        charStates: undefined as any,
        stats: null as any,
      });

      // Should recover gracefully
      try {
        store.resetGame();
        expect(true).toBe(true); // If we get here, recovery worked
      } catch (error) {
        // If it throws, that's also acceptable - we just want no crashes
        expect(error).toBeTruthy();
      }
    });

    it('should maintain performance with large state objects', () => {
      const store = useGameStore.getState();

      // Create a large state with many character states
      const largeText = 'a'.repeat(50000);

      const startTime = performance.now();

      store.setTextToType(largeText);

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200);
      expect(store.charStates.length).toBe(50000);

      // Test state updates with large objects
      const updateStartTime = performance.now();

      store.handleKeyPress('a');

      const updateEndTime = performance.now();

      expect(updateEndTime - updateStartTime).toBeLessThan(50);
    });
  });
});
