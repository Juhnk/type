import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCompetitiveStore } from '@/store/useCompetitiveStore';
import { useAuthStore } from '@/store/useAuthStore';
import { apiClient } from '@/lib/api-client';

// Mock the API client
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    patch: vi.fn(),
  },
}));

describe('Trophy Synchronization', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Reset stores
    useCompetitiveStore.setState({ trophies: 1000 });
    useAuthStore.setState({
      user: null,
      token: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should sync trophies when user is authenticated', async () => {
    // Set up authenticated state
    useAuthStore.setState({
      user: { id: 'test-user', email: 'test@example.com' },
      token: 'test-token',
    });

    const { result } = renderHook(() => useCompetitiveStore());

    // Mock successful API response
    vi.mocked(apiClient.patch).mockResolvedValueOnce({ trophies: 1095 });

    // Add trophies (winning a match gives +25)
    await act(async () => {
      await result.current.addTrophies(25);
    });

    // Verify local state updated
    expect(result.current.trophies).toBe(1025);

    // Verify API was called with correct parameters
    expect(apiClient.patch).toHaveBeenCalledWith(
      '/api/me/trophies',
      { trophies: 1025 },
      'test-token'
    );
  });

  it('should not sync trophies when user is not authenticated', async () => {
    // No user/token set
    const { result } = renderHook(() => useCompetitiveStore());

    // Add trophies
    await act(async () => {
      await result.current.addTrophies(25);
    });

    // Verify local state updated
    expect(result.current.trophies).toBe(1025);

    // Verify API was NOT called
    expect(apiClient.patch).not.toHaveBeenCalled();
  });

  it('should handle sync errors gracefully', async () => {
    // Set up authenticated state
    useAuthStore.setState({
      user: { id: 'test-user', email: 'test@example.com' },
      token: 'test-token',
    });

    const { result } = renderHook(() => useCompetitiveStore());

    // Mock API error on first attempt, then success
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    vi.mocked(apiClient.patch)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ trophies: 1025 });

    // Add trophies
    await act(async () => {
      await result.current.addTrophies(25);
    });

    // Verify local state still updated despite initial error
    expect(result.current.trophies).toBe(1025);

    // Verify error was logged with new format
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Trophy Sync] Attempt 1 failed:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('should sync after winning a competitive match', async () => {
    // Set up authenticated state with initial trophies
    useAuthStore.setState({
      user: { id: 'test-user', email: 'test@example.com' },
      token: 'test-token',
    });
    useCompetitiveStore.setState({
      trophies: 1070,
      opponent: {
        name: 'Bot Player',
        targetWpm: 50,
        actualWpm: 48,
        accuracy: 95,
        currentPosition: 0,
        targetPosition: 0,
        typingBuffer: '',
        mistakePosition: -1,
        isBackspacing: false,
        wordsCompleted: 45,
        totalWordsTyped: 45,
        correctWords: 43,
        incorrectWords: 2,
        isTyping: false,
        lastTypingTime: Date.now(),
        nextCharTime: Date.now(),
        trophies: 1000,
      },
    });

    const { result } = renderHook(() => useCompetitiveStore());

    // Mock successful API response
    vi.mocked(apiClient.patch).mockResolvedValueOnce({ trophies: 1074 });

    // Finish match with a win
    await act(async () => {
      result.current.finishMatch(60000, 55, 96.5, 50, 48);
    });

    // Verify trophies increased (using ELO calculation)
    expect(result.current.trophies).toBe(1074);

    // Wait for async sync to complete
    await waitFor(() => {
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/api/me/trophies',
        { trophies: 1074 },
        'test-token'
      );
    });
  });

  it('should sync after losing a competitive match', async () => {
    // Set up authenticated state
    useAuthStore.setState({
      user: { id: 'test-user', email: 'test@example.com' },
      token: 'test-token',
    });
    useCompetitiveStore.setState({
      trophies: 1095,
      opponent: {
        name: 'Bot Player',
        targetWpm: 70,
        actualWpm: 70,
        accuracy: 98,
        currentPosition: 0,
        targetPosition: 0,
        typingBuffer: '',
        mistakePosition: -1,
        isBackspacing: false,
        wordsCompleted: 50,
        totalWordsTyped: 50,
        correctWords: 49,
        incorrectWords: 1,
        isTyping: false,
        lastTypingTime: Date.now(),
        nextCharTime: Date.now(),
        trophies: 1200,
      },
    });

    const { result } = renderHook(() => useCompetitiveStore());

    // Mock successful API response
    vi.mocked(apiClient.patch).mockResolvedValueOnce({ trophies: 1091 });

    // Finish match with a loss
    await act(async () => {
      result.current.finishMatch(65000, 45, 90, 48, 43);
    });

    // Verify trophies decreased (using ELO calculation)
    expect(result.current.trophies).toBe(1091);

    // Wait for async sync to complete
    await waitFor(() => {
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/api/me/trophies',
        { trophies: 1091 },
        'test-token'
      );
    });
  });
});
