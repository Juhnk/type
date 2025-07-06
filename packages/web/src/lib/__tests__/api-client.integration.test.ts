/**
 * Sprint 9: API Integration Tests
 *
 * Comprehensive integration tests for the API client with mock scenarios,
 * testing all parameter combinations, punctuation/numbers generation,
 * and error handling with fallback scenarios.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient } from '../api-client';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Client Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset any environment variables or global state if needed
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Word Source API - Parameter Combinations', () => {
    it('should fetch words with basic parameters', async () => {
      const mockResponse = {
        words: ['hello', 'world', 'test'],
        metadata: {
          list: 'english1k',
          count: 3,
          total_available: 1024,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.getWords('english1k', 50, true);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3003/api/words?list=english1k&limit=50&randomize=true',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('should fetch words with punctuation enhancement', async () => {
      const mockResponse = {
        words: ['hello', 'world', 'test'],
        metadata: {
          list: 'english1k',
          count: 3,
          total_available: 1024,
        },
        enhanced_text: 'Hello, world! This is a test.',
        punctuation_enabled: true,
        numbers_enabled: false,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.getWords('english1k', 50, true, {
        punctuation: true,
        numbers: false,
        punctuationDensity: 'medium',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(
          'punctuation=true&numbers=false&punctuation_density=medium'
        ),
        expect.any(Object)
      );

      expect(result.enhanced_text).toBe('Hello, world! This is a test.');
      expect(result.punctuation_enabled).toBe(true);
    });

    it('should fetch words with numbers enhancement', async () => {
      const mockResponse = {
        words: ['test', 'with', 'numbers'],
        metadata: {
          list: 'english1k',
          count: 3,
          total_available: 1024,
        },
        enhanced_text: 'Test 123 with numbers 456.',
        punctuation_enabled: true,
        numbers_enabled: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.getWords('english1k', 50, true, {
        punctuation: true,
        numbers: true,
        punctuationDensity: 'heavy',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(
          'punctuation=true&numbers=true&punctuation_density=heavy'
        ),
        expect.any(Object)
      );

      expect(result.enhanced_text).toContain('123');
      expect(result.numbers_enabled).toBe(true);
    });

    it('should test all punctuation density levels', async () => {
      const densities = ['light', 'medium', 'heavy'] as const;

      for (const density of densities) {
        const mockResponse = {
          words: ['test', 'density'],
          metadata: { list: 'english1k', count: 2, total_available: 1024 },
          enhanced_text: `Test ${density} density.`,
          punctuation_enabled: true,
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await apiClient.getWords('english1k', 10, true, {
          punctuation: true,
          punctuationDensity: density,
        });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining(`punctuation_density=${density}`),
          expect.any(Object)
        );

        expect(result.enhanced_text).toContain(density);
      }
    });

    it('should test different word list sources', async () => {
      const wordLists = [
        'english1k',
        'english5k',
        'python',
        'javascript',
        'quotes',
      ];

      for (const list of wordLists) {
        const mockResponse = {
          words: [`${list}-word1`, `${list}-word2`],
          metadata: { list, count: 2, total_available: 500 },
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await apiClient.getWords(list, 25, false);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining(`list=${list}&limit=25&randomize=false`),
          expect.any(Object)
        );

        expect(result.metadata.list).toBe(list);
      }
    });
  });

  describe('Punctuation and Numbers Generation Testing', () => {
    it('should generate realistic punctuation patterns', async () => {
      const mockResponse = {
        words: ['the', 'quick', 'brown', 'fox'],
        metadata: { list: 'english1k', count: 4, total_available: 1024 },
        enhanced_text: "The quick, brown fox! It's amazing.",
        punctuation_enabled: true,
        numbers_enabled: false,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.getWords('english1k', 50, true, {
        punctuation: true,
        punctuationDensity: 'medium',
      });

      const text = result.enhanced_text!;

      // Should contain various punctuation marks
      expect(text).toMatch(/[,.!?;:]/);

      // Should have contractions
      expect(text).toMatch(/\w+'\w+/);

      // Should start with capital letter
      expect(text[0]).toMatch(/[A-Z]/);
    });

    it('should generate appropriate number insertions', async () => {
      const mockResponse = {
        words: ['test', 'numbers', 'in', 'text'],
        metadata: { list: 'english1k', count: 4, total_available: 1024 },
        enhanced_text: 'Test 42 numbers in text 2024.',
        punctuation_enabled: true,
        numbers_enabled: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.getWords('english1k', 50, true, {
        punctuation: true,
        numbers: true,
        punctuationDensity: 'light',
      });

      const text = result.enhanced_text!;

      // Should contain numbers
      expect(text).toMatch(/\d+/);

      // Numbers should be realistic (not too long)
      const numbers = text.match(/\d+/g) || [];
      numbers.forEach((num) => {
        expect(num.length).toBeLessThanOrEqual(4);
      });
    });

    it('should respect punctuation density settings', async () => {
      const lightResponse = {
        words: ['light', 'punctuation', 'test'],
        enhanced_text: 'Light punctuation test.',
        punctuation_enabled: true,
      };

      const heavyResponse = {
        words: ['heavy', 'punctuation', 'test'],
        enhanced_text: "Heavy, punctuation; test! It's great: really?",
        punctuation_enabled: true,
      };

      // Test light density
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...lightResponse,
          metadata: { list: 'english1k', count: 3, total_available: 1024 },
        }),
      });

      const lightResult = await apiClient.getWords('english1k', 50, true, {
        punctuation: true,
        punctuationDensity: 'light',
      });

      // Test heavy density
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...heavyResponse,
          metadata: { list: 'english1k', count: 3, total_available: 1024 },
        }),
      });

      const heavyResult = await apiClient.getWords('english1k', 50, true, {
        punctuation: true,
        punctuationDensity: 'heavy',
      });

      // Heavy should have more punctuation marks
      const lightPunctCount = (
        lightResult.enhanced_text!.match(/[,.!?;:]/g) || []
      ).length;
      const heavyPunctCount = (
        heavyResult.enhanced_text!.match(/[,.!?;:]/g) || []
      ).length;

      expect(heavyPunctCount).toBeGreaterThan(lightPunctCount);
    });
  });

  describe('API Error Handling and Fallback Scenarios', () => {
    it('should handle network connection errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiClient.getWords('english1k')).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle HTTP error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error occurred',
      });

      await expect(apiClient.getWords('english1k')).rejects.toThrow(
        'Server returned invalid response. Status: 500'
      );
    });

    it('should handle malformed JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(apiClient.getWords('english1k')).rejects.toThrow(
        'Server returned invalid response. Status: undefined'
      );
    });

    it('should handle missing required fields in response', async () => {
      const incompleteResponse = {
        // Missing words array
        metadata: { list: 'english1k' },
        // Missing count and total_available
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => incompleteResponse,
      });

      const result = await apiClient.getWords('english1k');

      // Should still return the response, validation happens in the consuming code
      expect(result).toEqual(incompleteResponse);
    });

    it('should handle timeout scenarios', async () => {
      // Simulate a slow response
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => ({
                  words: ['timeout', 'test'],
                  metadata: {
                    list: 'english1k',
                    count: 2,
                    total_available: 1024,
                  },
                }),
              });
            }, 100); // Short timeout for testing
          })
      );

      // This should complete within reasonable time
      const startTime = Date.now();
      const result = await apiClient.getWords('english1k');
      const endTime = Date.now();

      expect(result.words).toEqual(['timeout', 'test']);
      expect(endTime - startTime).toBeLessThan(200);
    });

    it('should handle rate limiting responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Headers({
          'Retry-After': '60',
        }),
        text: async () => 'Rate limit exceeded',
      });

      await expect(apiClient.getWords('english1k')).rejects.toThrow(
        'Server returned invalid response. Status: 429'
      );
    });
  });

  describe('Authentication Integration', () => {
    it('should handle authenticated requests for saveSingleTest', async () => {
      const testResult = {
        wpm: 75,
        accuracy: 98.5,
        duration: 60,
        mode: 'time' as const,
        difficulty: 'Normal' as const,
        textSource: 'english1k',
        punctuation: true,
        timestamp: Date.now(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Test saved successfully' }),
      });

      await apiClient.saveSingleTest(testResult, 'test-jwt-token');

      const [url, config] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:3003/api/me/tests');
      expect(config.method).toBe('POST');
      expect(config.headers.Authorization).toBe('Bearer test-jwt-token');
      expect(config.body).toContain('"wpm":75');
      expect(config.body).toContain('"accuracy":98.5');
      expect(config.body).toContain('"punctuation":true');
    });

    it('should work without auth token for getWords', async () => {
      const mockResponse = {
        words: ['no', 'auth'],
        metadata: { list: 'english1k', count: 2, total_available: 1024 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await apiClient.getWords('english1k');

      // getWords doesn't require auth, so no Authorization header should be present
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3003/api/words?list=english1k&limit=100&randomize=true',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
          signal: expect.any(AbortSignal),
        })
      );
    });
  });

  describe('Save Test Results Integration', () => {
    it('should save test results with authentication', async () => {
      const testResult = {
        wpm: 75,
        accuracy: 98.5,
        duration: 60,
        mode: 'time' as const,
        difficulty: 'Normal' as const,
        textSource: 'english1k',
        punctuation: true,
        timestamp: Date.now(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Test saved successfully' }),
      });

      const result = await apiClient.saveSingleTest(testResult, 'valid-token');

      const [url, config] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:3003/api/me/tests');
      expect(config.method).toBe('POST');
      expect(config.headers.Authorization).toBe('Bearer valid-token');
      expect(config.body).toContain('"wpm":75');
      expect(config.body).toContain('"accuracy":98.5');
      expect(config.body).toContain('"punctuation":true');

      expect(result).toEqual({ message: 'Test saved successfully' });
    });

    it('should handle save errors gracefully', async () => {
      const testResult = {
        wpm: 75,
        accuracy: 98.5,
        duration: 60,
        mode: 'time' as const,
        difficulty: 'Normal' as const,
        textSource: 'english1k',
        punctuation: false,
        timestamp: Date.now(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ error: 'Invalid token' }),
      });

      await expect(
        apiClient.saveSingleTest(testResult, 'invalid-token')
      ).rejects.toThrow(
        'Invalid credentials. Please check your email and password.'
      );
    });
  });

  describe('Cross-Browser Compatibility', () => {
    it('should work with different fetch implementations', async () => {
      // Test with a minimal fetch mock
      const minimalFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            words: ['cross', 'browser'],
            metadata: { list: 'english1k', count: 2, total_available: 1024 },
          }),
      });

      const originalFetch = global.fetch;
      global.fetch = minimalFetch;

      const result = await apiClient.getWords('english1k');

      expect(result.words).toEqual(['cross', 'browser']);

      global.fetch = originalFetch;
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle concurrent API requests', async () => {
      const mockResponse = {
        words: ['concurrent', 'test'],
        metadata: { list: 'english1k', count: 2, total_available: 1024 },
      };

      // Mock multiple responses
      for (let i = 0; i < 5; i++) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            ...mockResponse,
            words: [`concurrent-${i}`, 'test'],
          }),
        });
      }

      // Make concurrent requests
      const promises = Array(5)
        .fill(null)
        .map((_, i) => apiClient.getWords('english1k', 10 + i));

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach((result, i) => {
        expect(result.words[0]).toBe(`concurrent-${i}`);
      });
    });

    it('should handle large word lists efficiently', async () => {
      const largeWordList = Array(1000)
        .fill(null)
        .map((_, i) => `word${i}`);
      const mockResponse = {
        words: largeWordList,
        metadata: { list: 'english1k', count: 1000, total_available: 1024 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const startTime = performance.now();
      const result = await apiClient.getWords('english1k', 1000);
      const endTime = performance.now();

      expect(result.words).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });
  });
});
