import { describe, it, expect, vi, beforeEach } from 'vitest';
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

import { getWords } from '@/lib/api-client';

describe('useGameStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
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
        .map((char) => ({
          char,
          status: 'default' as const,
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
    });
  });

  describe('loadWordsFromAPI', () => {
    it('should load words from API for time mode', async () => {
      const mockWords = ['test', 'words', 'from', 'api'];
      (getWords as any).mockResolvedValueOnce({
        words: mockWords,
        metadata: { list: 'english1k', count: 4, total_available: 1024 },
      });

      const { result } = renderHook(() => useGameStore());

      await act(async () => {
        await result.current.loadWordsFromAPI();
      });

      expect(getWords).toHaveBeenCalledWith('english1k', 100, true);
      expect(result.current.textToType).toBe('test words from api');
      expect(result.current.isLoadingWords).toBe(false);
      expect(result.current.wordsError).toBe(null);
    });

    it('should calculate word count based on duration for time mode', async () => {
      const mockWords = Array(100).fill('word');
      (getWords as any).mockResolvedValueOnce({
        words: mockWords,
        metadata: { list: 'english1k', count: 100, total_available: 1024 },
      });

      const { result } = renderHook(() => useGameStore());

      // Set duration to 120 seconds
      act(() => {
        result.current.setTestConfig({ duration: 120 });
      });

      await act(async () => {
        await result.current.loadWordsFromAPI();
      });

      // Should request at least 80 words (120s * 40 WPM / 60)
      expect(getWords).toHaveBeenCalledWith('english1k', 100, true);
    });

    it('should use exact word count for words mode', async () => {
      const mockWords = Array(25).fill('word');
      (getWords as any).mockResolvedValueOnce({
        words: mockWords,
        metadata: { list: 'english1k', count: 25, total_available: 1024 },
      });

      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.setTestConfig({ mode: 'words', wordCount: 25 });
      });

      await act(async () => {
        await result.current.loadWordsFromAPI();
      });

      expect(getWords).toHaveBeenCalledWith('english1k', 25, true);
    });

    it('should handle API errors gracefully', async () => {
      (getWords as any).mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(() => useGameStore());

      await act(async () => {
        await result.current.loadWordsFromAPI();
      });

      expect(result.current.isLoadingWords).toBe(false);
      expect(result.current.wordsError).toBe('API Error');
      // Should fall back to sample text
      expect(result.current.textToType).toBe(
        'the quick brown fox jumps over the lazy dog'
      );
    });

    it('should set loading state during API call', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      (getWords as any).mockReturnValueOnce(promise);

      const { result } = renderHook(() => useGameStore());

      const loadPromise = act(async () => {
        await result.current.loadWordsFromAPI();
      });

      // Check loading state is true while promise is pending
      expect(result.current.isLoadingWords).toBe(true);

      // Resolve the promise
      resolvePromise!({
        words: ['test'],
        metadata: { list: 'english1k', count: 1, total_available: 1024 },
      });

      await loadPromise;

      // Loading should be false after completion
      expect(result.current.isLoadingWords).toBe(false);
    });
  });

  describe('setTestConfig', () => {
    it('should update test configuration', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.setTestConfig({ mode: 'words', wordCount: 100 });
      });

      expect(result.current.testConfig.mode).toBe('words');
      expect(result.current.testConfig.wordCount).toBe(100);
    });

    it('should trigger word loading when text source changes', async () => {
      (getWords as any).mockResolvedValueOnce({
        words: ['python', 'code'],
        metadata: { list: 'python', count: 2, total_available: 352 },
      });

      const { result } = renderHook(() => useGameStore());

      await act(async () => {
        result.current.setTestConfig({ textSource: 'python' });
      });

      expect(getWords).toHaveBeenCalledWith('python', expect.any(Number), true);
    });
  });

  describe('handleKeyPress', () => {
    it('should start game on first key press', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.handleKeyPress('t');
      });

      expect(result.current.gameStatus).toBe('running');
      expect(result.current.userInput).toBe('t');
      expect(result.current.charStates[0].status).toBe('correct');
    });

    it('should handle correct character input', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.handleKeyPress('t');
        result.current.handleKeyPress('h');
        result.current.handleKeyPress('e');
      });

      expect(result.current.userInput).toBe('the');
      expect(result.current.charStates[0].status).toBe('correct');
      expect(result.current.charStates[1].status).toBe('correct');
      expect(result.current.charStates[2].status).toBe('correct');
    });

    it('should handle incorrect character input', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.handleKeyPress('x'); // Wrong character
      });

      expect(result.current.userInput).toBe('x');
      expect(result.current.charStates[0].status).toBe('incorrect');
    });

    it('should handle backspace', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.handleKeyPress('t');
        result.current.handleKeyPress('h');
        result.current.handleKeyPress('x'); // Wrong character
        result.current.handleKeyPress('Backspace');
      });

      expect(result.current.userInput).toBe('th');
      expect(result.current.charStates[2].status).toBe('default');
    });

    it('should complete game in Master mode on first error', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.setTestConfig({ difficulty: 'Master' });
      });

      act(() => {
        result.current.handleKeyPress('x'); // Wrong character
      });

      // Game should be completed immediately
      expect(result.current.gameStatus).toBe('finished');
    });
  });

  describe('resetGame', () => {
    it('should reset game to initial state', () => {
      const { result } = renderHook(() => useGameStore());

      // Start game and make some progress
      act(() => {
        result.current.handleKeyPress('t');
        result.current.handleKeyPress('h');
      });

      // Reset game
      act(() => {
        result.current.resetGame();
      });

      expect(result.current.userInput).toBe('');
      expect(result.current.gameStatus).toBe('ready');
      expect(result.current.stats.wpm).toBe(0);
      expect(result.current.stats.accuracy).toBe(0);
      expect(result.current.charStates[0].status).toBe('current');
      expect(result.current.charStates[1].status).toBe('default');
    });
  });
});
