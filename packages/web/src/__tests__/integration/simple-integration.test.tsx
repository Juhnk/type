/**
 * Sprint 9: Simplified Integration Tests
 *
 * Focused integration tests for key workflows with proper mocking:
 * - Game preparation and state management
 * - API integration with error handling
 * - Cross-component state consistency
 * - Configuration changes and persistence
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGameStore } from '@/store/useGameStore';
import { useAuthStore } from '@/store/useAuthStore';

// Mock dependencies
vi.mock('@/lib/api-client', () => ({
  getWords: vi.fn(),
  saveSingleTest: vi.fn(),
}));

vi.mock('@/lib/history', () => ({
  saveTestResult: vi.fn(),
}));

vi.mock('@/lib/textGenerator', () => ({
  generateTextFromWords: vi.fn((words) => words.join(' ')),
  generateFallbackText: vi.fn(() => 'fallback test text'),
}));

import { getWords } from '@/lib/api-client';
import {
  generateTextFromWords,
  generateFallbackText,
} from '@/lib/textGenerator';

const mockGetWords = getWords as any;
const mockGenerateTextFromWords = generateTextFromWords as any;
const mockGenerateFallbackText = generateFallbackText as any;

describe('Simplified Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset stores to clean state
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
      wordsError: null,
      isPreparingGame: false,
      gamePreparationError: null,
      testFailed: false,
      failureReason: null,
    });

    useAuthStore.setState({
      user: null,
      token: null,
      isLoading: false,
      error: null,
    });

    // Setup default API response
    mockGetWords.mockResolvedValue({
      words: ['the', 'quick', 'brown', 'fox'],
      metadata: { list: 'english1k', count: 4, total_available: 1024 },
      enhanced_text: 'The quick brown fox.',
      punctuation_enabled: false,
    });
  });

  describe('Game Preparation Integration', () => {
    it('should prepare game with API response', async () => {
      const store = useGameStore.getState();

      await store.prepareGame();

      expect(mockGetWords).toHaveBeenCalledWith(
        'english1k',
        100, // Math.max(100, Math.ceil((60 * 50) / 60))
        true,
        {
          punctuation: false,
          numbers: false,
          punctuationDensity: 'medium',
        }
      );

      const currentState = useGameStore.getState();
      expect(currentState.textToType).toBe('The quick brown fox.');
      expect(currentState.words).toEqual(['the', 'quick', 'brown', 'fox']);
      expect(currentState.gameStatus).toBe('ready');
    });

    it('should handle API failure with fallback', async () => {
      const store = useGameStore.getState();

      mockGetWords.mockRejectedValue(new Error('Network error'));

      await store.prepareGame();

      const currentState = useGameStore.getState();
      expect(currentState.gamePreparationError).toBe('Network error');
      expect(currentState.textToType).toBe('fallback test text');
      expect(mockGenerateFallbackText).toHaveBeenCalled();
    });

    it('should prepare game with punctuation options', async () => {
      const store = useGameStore.getState();

      store.setTestConfig({ punctuation: true });

      await store.prepareGame();

      expect(mockGetWords).toHaveBeenCalledWith('english1k', 100, true, {
        punctuation: true,
        numbers: true, // Should be enabled when punctuation is enabled
        punctuationDensity: 'medium',
      });
    });
  });

  describe('Configuration Management', () => {
    it('should handle configuration changes', () => {
      const store = useGameStore.getState();

      store.setTestConfig({
        mode: 'words',
        wordCount: 25,
        difficulty: 'Expert',
        punctuation: true,
      });

      const currentState = useGameStore.getState();
      expect(currentState.testConfig.mode).toBe('words');
      expect(currentState.testConfig.wordCount).toBe(25);
      expect(currentState.testConfig.difficulty).toBe('Expert');
      expect(currentState.testConfig.punctuation).toBe(true);
    });

    it('should calculate correct word limits for different modes', async () => {
      const store = useGameStore.getState();

      // Test time mode
      store.setTestConfig({ mode: 'time', duration: 120 });
      await store.prepareGame();

      expect(mockGetWords).toHaveBeenCalledWith(
        'english1k',
        100, // Math.max(100, Math.ceil((120 * 50) / 60))
        true,
        expect.any(Object)
      );

      vi.clearAllMocks();

      // Test words mode
      store.setTestConfig({ mode: 'words', wordCount: 30 });
      await store.prepareGame();

      expect(mockGetWords).toHaveBeenCalledWith(
        'english1k',
        30, // Exact word count
        true,
        expect.any(Object)
      );
    });
  });

  describe('Typing Logic Integration', () => {
    it('should handle basic typing workflow', () => {
      const store = useGameStore.getState();

      store.setTextToType('hello world');

      // Start typing
      store.handleKeyPress('h');

      let currentState = useGameStore.getState();
      expect(currentState.gameStatus).toBe('running');
      expect(currentState.userInput).toBe('h');

      // Continue typing
      store.handleKeyPress('e');
      store.handleKeyPress('l');
      store.handleKeyPress('l');
      store.handleKeyPress('o');

      currentState = useGameStore.getState();
      expect(currentState.userInput).toBe('hello');
      expect(currentState.stats.correctChars).toBe(5);
    });

    it('should handle incorrect typing', () => {
      const store = useGameStore.getState();

      store.setTextToType('hello');

      // Type incorrect character
      store.handleKeyPress('x');

      const currentState = useGameStore.getState();
      expect(currentState.userInput).toBe('x');
      expect(currentState.stats.incorrectChars).toBe(1);
      expect(currentState.stats.correctChars).toBe(0);
    });

    it('should handle backspace correctly', () => {
      const store = useGameStore.getState();

      store.setTextToType('hello');

      // Type and then backspace
      store.handleKeyPress('h');
      store.handleKeyPress('e');
      store.handleKeyPress('Backspace');

      const currentState = useGameStore.getState();
      expect(currentState.userInput).toBe('h');
    });
  });

  describe('Difficulty Mode Integration', () => {
    it('should fail in Master mode on incorrect keystroke', () => {
      const store = useGameStore.getState();

      store.setTestConfig({ difficulty: 'Master' });
      store.setTextToType('hello');

      // Type correct then incorrect
      store.handleKeyPress('h');
      store.handleKeyPress('x'); // Wrong character

      const currentState = useGameStore.getState();
      expect(currentState.gameStatus).toBe('finished');
      expect(currentState.testFailed).toBe(true);
      expect(currentState.failureReason).toContain('Master Mode');
    });

    it('should allow correction in Expert mode', () => {
      const store = useGameStore.getState();

      store.setTestConfig({ difficulty: 'Expert' });
      store.setTextToType('hello world');

      // Type word with error then correct it
      store.handleKeyPress('h');
      store.handleKeyPress('e');
      store.handleKeyPress('x'); // Wrong
      store.handleKeyPress('Backspace'); // Correct
      store.handleKeyPress('l');
      store.handleKeyPress('l');
      store.handleKeyPress('o');
      store.handleKeyPress(' '); // Submit word

      const currentState = useGameStore.getState();
      expect(currentState.gameStatus).toBe('running'); // Should continue
      expect(currentState.testFailed).toBe(false);
    });
  });

  describe('Statistics Integration', () => {
    it('should calculate statistics correctly', () => {
      const store = useGameStore.getState();

      // Manually set some stats to test calculation
      useGameStore.setState({
        stats: {
          wpm: 0,
          accuracy: 0,
          startTime: Date.now() - 60000, // 1 minute ago
          totalChars: 20,
          correctChars: 18,
          incorrectChars: 2,
          elapsedTime: 60000, // 1 minute
        },
      });

      store.updateStats();

      const currentState = useGameStore.getState();
      expect(currentState.stats.accuracy).toBeCloseTo(90, 0); // 18/20 = 90%
      expect(currentState.stats.wpm).toBeGreaterThan(0);
    });

    it('should handle zero division in statistics', () => {
      const store = useGameStore.getState();

      useGameStore.setState({
        stats: {
          wpm: 0,
          accuracy: 0,
          startTime: Date.now(),
          totalChars: 0,
          correctChars: 0,
          incorrectChars: 0,
          elapsedTime: 0,
        },
      });

      store.updateStats();

      const currentState = useGameStore.getState();
      expect(currentState.stats.accuracy).toBe(0);
      expect(currentState.stats.wpm).toBe(0);
    });
  });

  describe('Game Reset Integration', () => {
    it('should reset game state completely', () => {
      const store = useGameStore.getState();

      // Set up some game state
      useGameStore.setState({
        userInput: 'hello world',
        gameStatus: 'finished',
        testFailed: true,
        failureReason: 'Test failed',
        stats: {
          wpm: 50,
          accuracy: 85,
          startTime: Date.now(),
          totalChars: 100,
          correctChars: 85,
          incorrectChars: 15,
          elapsedTime: 60000,
        },
      });

      store.resetGame();

      const currentState = useGameStore.getState();
      expect(currentState.userInput).toBe('');
      expect(currentState.gameStatus).toBe('ready');
      expect(currentState.testFailed).toBe(false);
      expect(currentState.failureReason).toBeNull();
      expect(currentState.stats.wpm).toBe(0);
      expect(currentState.stats.totalChars).toBe(0);
    });

    it('should preserve configuration after reset', () => {
      const store = useGameStore.getState();

      // Set configuration
      store.setTestConfig({
        mode: 'words',
        wordCount: 25,
        difficulty: 'Expert',
        punctuation: true,
      });

      // Simulate game completion
      useGameStore.setState({
        gameStatus: 'finished',
        userInput: 'some text',
      });

      store.resetGame();

      const currentState = useGameStore.getState();
      expect(currentState.testConfig.mode).toBe('words');
      expect(currentState.testConfig.wordCount).toBe(25);
      expect(currentState.testConfig.difficulty).toBe('Expert');
      expect(currentState.testConfig.punctuation).toBe(true);
      expect(currentState.userInput).toBe(''); // Should be reset
    });
  });

  describe('Authentication Integration', () => {
    it('should handle authentication state changes', () => {
      const authStore = useAuthStore.getState();

      authStore.login({
        user: {
          id: '1',
          email: 'test@example.com',
          createdAt: new Date().toISOString(),
        },
        token: 'test-jwt-token',
      });

      const currentState = useAuthStore.getState();
      expect(currentState.token).toBe('test-jwt-token');
      expect(currentState.user?.id).toBe('1');
      expect(currentState.user?.email).toBe('test@example.com');
    });

    it('should handle logout correctly', () => {
      const authStore = useAuthStore.getState();

      // First login
      authStore.login({
        user: {
          id: '1',
          email: 'test@example.com',
          createdAt: new Date().toISOString(),
        },
        token: 'test-jwt-token',
      });

      // Then logout
      authStore.logout();

      const currentState = useAuthStore.getState();
      expect(currentState.token).toBeNull();
      expect(currentState.user).toBeNull();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle various API error scenarios', async () => {
      const store = useGameStore.getState();

      // Test network error
      mockGetWords.mockRejectedValue(new Error('Network error'));

      await store.prepareGame();

      let currentState = useGameStore.getState();
      expect(currentState.gamePreparationError).toBe('Network error');

      // Test invalid response
      mockGetWords.mockResolvedValue({
        // Missing required fields
        metadata: { list: 'english1k' },
      });

      await store.prepareGame();

      currentState = useGameStore.getState();
      expect(currentState.gamePreparationError).toBeTruthy();
    });

    it('should recover from error states', async () => {
      const store = useGameStore.getState();

      // Trigger error
      mockGetWords.mockRejectedValue(new Error('API Error'));
      await store.prepareGame();

      expect(useGameStore.getState().gamePreparationError).toBe('API Error');

      // Fix API and retry
      mockGetWords.mockResolvedValue({
        words: ['test', 'recovery'],
        metadata: { list: 'english1k', count: 2, total_available: 1024 },
        enhanced_text: 'Test recovery.',
      });

      await store.prepareGame();

      const currentState = useGameStore.getState();
      expect(currentState.gamePreparationError).toBeNull();
      expect(currentState.textToType).toBe('Test recovery.');
    });
  });

  describe('Performance Integration', () => {
    it('should handle rapid operations efficiently', () => {
      const store = useGameStore.getState();

      store.setTextToType('abcdefghijklmnopqrstuvwxyz');

      const startTime = performance.now();

      // Rapid typing
      'abcdefghijklmnopqrstuvwxyz'.split('').forEach((char) => {
        store.handleKeyPress(char);
      });

      const endTime = performance.now();

      const currentState = useGameStore.getState();
      expect(currentState.userInput).toBe('abcdefghijklmnopqrstuvwxyz');
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });

    it('should handle large text efficiently', () => {
      const store = useGameStore.getState();

      const largeText = 'word '.repeat(200).trim(); // 200 words

      const startTime = performance.now();
      store.setTextToType(largeText);
      const endTime = performance.now();

      expect(useGameStore.getState().textToType).toBe(largeText);
      expect(endTime - startTime).toBeLessThan(50); // Should be very fast
    });
  });
});
