/**
 * Sprint 9: Complex Integration Flow Tests
 *
 * End-to-end integration tests for complete game workflows including:
 * - Complete typing test workflows (time and words mode)
 * - Configuration changes during gameplay
 * - Authentication flow integration
 * - Error handling and recovery scenarios
 * - Multi-user session simulation
 * - Cross-component state consistency
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useGameStore } from '@/store/useGameStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useModalStore } from '@/store/useModalStore';

// Mock API client
vi.mock('@/lib/api-client', () => ({
  getWords: vi.fn(),
  saveSingleTest: vi.fn(),
  registerUser: vi.fn(),
  loginUser: vi.fn(),
  syncLocalHistory: vi.fn(),
}));

// Mock history
vi.mock('@/lib/history', () => ({
  saveTestResult: vi.fn(),
  getTestHistory: vi.fn(() => []),
  clearTestHistory: vi.fn(),
}));

// Mock text generator
vi.mock('@/lib/textGenerator', () => ({
  generateTextFromWords: vi.fn((words) => words.join(' ')),
  generateFallbackText: vi.fn(
    () => 'fallback test text for integration testing'
  ),
}));

import { getWords, saveSingleTest } from '@/lib/api-client';
import { saveTestResult } from '@/lib/history';

const mockGetWords = getWords as any;
const mockSaveSingleTest = saveSingleTest as any;
const mockSaveTestResult = saveTestResult as any;

// Test Component that simulates the main app
function TestApp({ children }: { children: React.ReactNode }) {
  return <div data-testid="test-app">{children}</div>;
}

describe('Game Flow Integration Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Reset all stores to clean state
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
      timeRemaining: 60000,
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

    useAuthStore.setState({
      user: null,
      token: null,
    });

    useModalStore.setState({
      isAuthModalOpen: false,
    });

    // Default API mock
    mockGetWords.mockResolvedValue({
      words: ['the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog'],
      metadata: { list: 'english1k', count: 8, total_available: 1024 },
      enhanced_text: 'The quick brown fox jumps over the lazy dog.',
      punctuation_enabled: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Complete Time Mode Workflow', () => {
    it('should complete a full time mode typing test workflow', async () => {
      const store = useGameStore.getState();

      // 1. Prepare game
      await act(async () => {
        await store.prepareGame();
      });

      expect(store.gameStatus).toBe('ready');
      expect(store.textToType).toBeTruthy();

      // 2. Start typing
      act(() => {
        store.handleKeyPress('t');
      });

      expect(store.gameStatus).toBe('running');
      expect(store.isTimerRunning).toBe(true);
      expect(store.stats.startTime).toBeGreaterThan(0);

      // 3. Continue typing sequence
      const testText = 'the quick';
      for (let i = 1; i < testText.length; i++) {
        act(() => {
          store.handleKeyPress(testText[i]);
        });
      }

      expect(store.userInput).toBe(testText);
      expect(store.stats.correctChars).toBe(testText.length);

      // 4. Simulate timer progression
      act(() => {
        vi.advanceTimersByTime(30000); // 30 seconds
      });

      // 5. Complete the timer
      act(() => {
        vi.advanceTimersByTime(30000); // Complete 60 seconds
      });

      // Wait for timer completion
      await waitFor(() => {
        expect(useGameStore.getState().gameStatus).toBe('finished');
      });

      const finalStats = useGameStore.getState().stats;
      expect(finalStats.wpm).toBeGreaterThan(0);
      expect(finalStats.accuracy).toBeGreaterThan(0);
      expect(finalStats.elapsedTime).toBeGreaterThan(0);
    });

    it('should handle mid-game configuration changes', async () => {
      const store = useGameStore.getState();

      await act(async () => {
        await store.prepareGame();
      });

      // Start typing
      act(() => {
        store.handleKeyPress('t');
      });

      expect(store.gameStatus).toBe('running');

      // Try to change difficulty during game
      act(() => {
        store.setTestConfig({ difficulty: 'Expert' });
      });

      // Game should continue with original settings
      expect(store.gameStatus).toBe('running');
      expect(store.testConfig.difficulty).toBe('Expert'); // Config updates but game continues
    });

    it('should handle pause and resume correctly', async () => {
      const store = useGameStore.getState();

      await act(async () => {
        await store.prepareGame();
      });

      // Start typing
      act(() => {
        store.handleKeyPress('t');
      });

      const timeAfterStart = store.timeRemaining;

      // Pause the game
      act(() => {
        store.pauseTimer();
      });

      expect(store.isTimerRunning).toBe(false);

      // Advance time while paused
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      // Time should not have decreased
      expect(store.timeRemaining).toBe(timeAfterStart);

      // Resume the game
      act(() => {
        store.resumeGame();
      });

      expect(store.isTimerRunning).toBe(true);
    });
  });

  describe('Complete Words Mode Workflow', () => {
    it('should complete a full words mode typing test workflow', async () => {
      const store = useGameStore.getState();

      // Set to words mode
      act(() => {
        store.setTestConfig({ mode: 'words', wordCount: 10 });
      });

      await act(async () => {
        await store.prepareGame();
      });

      expect(store.targetWordCount).toBe(10);
      expect(store.gameStatus).toBe('ready');

      // Type first word "the"
      act(() => {
        store.handleKeyPress('t');
        store.handleKeyPress('h');
        store.handleKeyPress('e');
        store.handleKeyPress(' '); // Complete word
      });

      expect(store.wordsCompleted).toBe(1);
      expect(store.wordsProgress).toBeCloseTo(10, 1);

      // Type second word "quick"
      'quick '.split('').forEach((char) => {
        act(() => {
          store.handleKeyPress(char);
        });
      });

      expect(store.wordsCompleted).toBe(2);
      expect(store.wordsProgress).toBeCloseTo(20, 1);

      // Type third word "brown"
      'brown'.split('').forEach((char) => {
        act(() => {
          store.handleKeyPress(char);
        });
      });

      // After 3 words, game should still be running (target is 10)
      expect(store.wordsCompleted).toBe(3);
      expect(store.gameStatus).toBe('running');
    });

    it('should track words progress accurately with punctuation', async () => {
      const store = useGameStore.getState();

      mockGetWords.mockResolvedValue({
        words: ['hello', 'world', 'test'],
        metadata: { list: 'english1k', count: 3, total_available: 1024 },
        enhanced_text: 'Hello, world! Test.',
        punctuation_enabled: true,
      });

      act(() => {
        store.setTestConfig({
          mode: 'words',
          wordCount: 10,
          punctuation: true,
        });
      });

      await act(async () => {
        await store.prepareGame();
      });

      expect(store.textToType).toBe('Hello, world! Test.');

      // Type first word with punctuation
      'Hello, '.split('').forEach((char) => {
        act(() => {
          store.handleKeyPress(char);
        });
      });

      expect(store.wordsCompleted).toBe(1);
    });
  });

  describe('Authentication Integration Workflows', () => {
    it('should save test results after authentication', async () => {
      const store = useGameStore.getState();
      const authStore = useAuthStore.getState();

      mockSaveSingleTest.mockResolvedValue({
        message: 'Test saved successfully',
      });

      // Complete a test first
      await act(async () => {
        await store.prepareGame();
      });

      act(() => {
        store.handleKeyPress('t');
        store.handleKeyPress('h');
        store.handleKeyPress('e');
      });

      // Simulate timer completion
      act(() => {
        vi.advanceTimersByTime(60000);
      });

      await waitFor(() => {
        expect(store.gameStatus).toBe('finished');
      });

      // Simulate user authentication
      act(() => {
        authStore.login(
          {
            id: '1',
            email: 'test@example.com',
            createdAt: new Date().toISOString(),
          },
          'test-jwt-token'
        );
      });

      // Test result should be automatically saved
      expect(mockSaveTestResult).toHaveBeenCalled();
    });

    it('should handle authentication errors gracefully', async () => {
      const store = useGameStore.getState();
      const modalStore = useModalStore.getState();

      // Complete a test
      await act(async () => {
        await store.prepareGame();
      });

      act(() => {
        store.handleKeyPress('t');
        vi.advanceTimersByTime(60000);
      });

      await waitFor(() => {
        expect(store.gameStatus).toBe('finished');
      });

      // Try to save without authentication
      act(() => {
        modalStore.openAuthModal();
      });

      expect(modalStore.isAuthModalOpen).toBe(true);
    });
  });

  describe('Difficulty Mode Integration', () => {
    it('should fail in Expert mode with word errors', async () => {
      const store = useGameStore.getState();

      act(() => {
        store.setTestConfig({ difficulty: 'Expert' });
      });

      await act(async () => {
        await store.prepareGame();
      });

      // Type incorrectly and submit word
      act(() => {
        store.handleKeyPress('t');
        store.handleKeyPress('h');
        store.handleKeyPress('x'); // Wrong character
        store.handleKeyPress(' '); // Submit incorrect word
      });

      expect(store.gameStatus).toBe('finished');
      expect(store.testFailed).toBe(true);
      expect(store.failureReason).toContain('Expert Mode');
    });

    it('should fail in Master mode on first error', async () => {
      const store = useGameStore.getState();

      act(() => {
        store.setTestConfig({ difficulty: 'Master' });
      });

      await act(async () => {
        await store.prepareGame();
      });

      // Type one correct character then one wrong
      act(() => {
        store.handleKeyPress('t'); // Correct
      });

      expect(store.gameStatus).toBe('running');

      act(() => {
        store.handleKeyPress('x'); // Wrong - should fail immediately
      });

      expect(store.gameStatus).toBe('finished');
      expect(store.testFailed).toBe(true);
      expect(store.failureReason).toContain('Master Mode');
    });

    it('should allow error correction in Expert mode before word submission', async () => {
      const store = useGameStore.getState();

      act(() => {
        store.setTestConfig({ difficulty: 'Expert' });
      });

      await act(async () => {
        await store.prepareGame();
      });

      // Type with error then correct it
      act(() => {
        store.handleKeyPress('t');
        store.handleKeyPress('h');
        store.handleKeyPress('x'); // Wrong
        store.handleKeyPress('Backspace'); // Correct
        store.handleKeyPress('e'); // Right character
        store.handleKeyPress(' '); // Submit corrected word
      });

      // Should not fail since word was corrected
      expect(store.gameStatus).toBe('running');
      expect(store.testFailed).toBe(false);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle API failures gracefully', async () => {
      const store = useGameStore.getState();

      mockGetWords.mockRejectedValue(new Error('Network error'));

      await act(async () => {
        await store.prepareGame();
      });

      // Should fall back to default text
      expect(store.gamePreparationError).toBe('Network error');
      expect(store.textToType).toBeTruthy(); // Fallback text should be used
      expect(store.gameStatus).toBe('ready'); // Game should still be ready
    });

    it('should handle malformed API responses', async () => {
      const store = useGameStore.getState();

      mockGetWords.mockResolvedValue({
        // Missing required fields
        metadata: { list: 'english1k' },
      });

      await act(async () => {
        await store.prepareGame();
      });

      expect(store.gamePreparationError).toBeTruthy();
      expect(store.textToType).toBeTruthy(); // Should use fallback
    });

    it('should recover from failed state with game reset', async () => {
      const store = useGameStore.getState();

      // Trigger failure in Master mode
      act(() => {
        store.setTestConfig({ difficulty: 'Master' });
      });

      await act(async () => {
        await store.prepareGame();
      });

      act(() => {
        store.handleKeyPress('x'); // Wrong character - should fail
      });

      expect(store.testFailed).toBe(true);
      expect(store.gameStatus).toBe('finished');

      // Reset game
      act(() => {
        store.resetGame();
      });

      expect(store.testFailed).toBe(false);
      expect(store.failureReason).toBeNull();
      expect(store.gameStatus).toBe('ready');
      expect(store.userInput).toBe('');
    });
  });

  describe('Performance and Stress Testing', () => {
    it('should handle rapid key presses without dropping inputs', async () => {
      const store = useGameStore.getState();

      await act(async () => {
        await store.prepareGame();
      });

      const rapidText = 'the quick brown fox';
      const startTime = performance.now();

      // Simulate very rapid typing
      rapidText.split('').forEach((char) => {
        act(() => {
          store.handleKeyPress(char);
        });
      });

      const endTime = performance.now();

      expect(store.userInput).toBe(rapidText);
      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
    });

    it('should handle long text content efficiently', async () => {
      const store = useGameStore.getState();

      const longWordList = Array(500)
        .fill(null)
        .map((_, i) => `word${i}`);
      mockGetWords.mockResolvedValue({
        words: longWordList,
        metadata: { list: 'english1k', count: 500, total_available: 1024 },
        enhanced_text: longWordList.join(' '),
      });

      const startTime = performance.now();

      await act(async () => {
        await store.prepareGame();
      });

      const endTime = performance.now();

      expect(store.textToType.length).toBeGreaterThan(2000);
      expect(endTime - startTime).toBeLessThan(200); // Should prepare efficiently
    });

    it('should maintain performance with many character state updates', async () => {
      const store = useGameStore.getState();

      await act(async () => {
        await store.prepareGame();
      });

      const longText = 'a'.repeat(200); // 200 characters
      const startTime = performance.now();

      longText.split('').forEach((char) => {
        act(() => {
          store.handleKeyPress(char);
        });
      });

      const endTime = performance.now();

      expect(store.charStates.length).toBeGreaterThan(200);
      expect(endTime - startTime).toBeLessThan(500); // Should remain performant
    });
  });

  describe('Multi-Session Simulation', () => {
    it('should handle multiple games in sequence', async () => {
      const store = useGameStore.getState();

      // First game
      await act(async () => {
        await store.prepareGame();
      });

      act(() => {
        store.handleKeyPress('t');
        vi.advanceTimersByTime(60000);
      });

      await waitFor(() => {
        expect(store.gameStatus).toBe('finished');
      });

      const firstGameStats = { ...store.stats };

      // Reset and start second game
      act(() => {
        store.resetGame();
      });

      await act(async () => {
        await store.prepareGame();
      });

      act(() => {
        store.handleKeyPress('t');
        store.handleKeyPress('h');
        store.handleKeyPress('e');
        vi.advanceTimersByTime(60000);
      });

      await waitFor(() => {
        expect(store.gameStatus).toBe('finished');
      });

      // Second game should have different stats
      expect(store.stats.totalChars).not.toBe(firstGameStats.totalChars);
      expect(store.stats.correctChars).not.toBe(firstGameStats.correctChars);
    });

    it('should maintain configuration between games', async () => {
      const store = useGameStore.getState();

      // Set specific configuration
      act(() => {
        store.setTestConfig({
          mode: 'words',
          wordCount: 25,
          difficulty: 'Expert',
          punctuation: true,
        });
      });

      await act(async () => {
        await store.prepareGame();
      });

      // Complete game
      act(() => {
        store.handleKeyPress('t');
        // Simulate word mode completion
        useGameStore.setState({ wordsCompleted: 25, gameStatus: 'finished' });
      });

      // Reset game
      act(() => {
        store.resetGame();
      });

      // Configuration should persist
      expect(store.testConfig.mode).toBe('words');
      expect(store.testConfig.wordCount).toBe(25);
      expect(store.testConfig.difficulty).toBe('Expert');
      expect(store.testConfig.punctuation).toBe(true);
    });
  });

  describe('State Consistency Across Components', () => {
    it('should maintain consistent state between stores', async () => {
      const gameStore = useGameStore.getState();
      const authStore = useAuthStore.getState();
      const modalStore = useModalStore.getState();

      // Test cross-store state consistency
      act(() => {
        authStore.login(
          {
            id: '1',
            email: 'test@example.com',
            createdAt: new Date().toISOString(),
          },
          'test-token'
        );
      });

      expect(authStore.token).toBe('test-token');
      expect(authStore.user?.id).toBe('1');

      // Modal should remain closed when authenticated
      expect(modalStore.isAuthModalOpen).toBe(false);

      // Game state should remain independent
      expect(gameStore.gameStatus).toBe('ready');
    });

    it('should handle concurrent store updates correctly', async () => {
      const gameStore = useGameStore.getState();
      const authStore = useAuthStore.getState();

      // Simulate concurrent updates
      act(() => {
        gameStore.setTestConfig({ difficulty: 'Master' });
        authStore.login(
          {
            id: '1',
            email: 'test@example.com',
            createdAt: new Date().toISOString(),
          },
          'test-token'
        );
        gameStore.handleKeyPress('t');
      });

      expect(gameStore.testConfig.difficulty).toBe('Master');
      expect(authStore.token).toBe('test-token');
      expect(gameStore.userInput).toBe('t');
    });
  });
});
