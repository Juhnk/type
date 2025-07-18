import { describe, it, expect, vi } from 'vitest';
import { getWords, getWordLists } from '../api-client';

// Mock fetch for testing
global.fetch = vi.fn();

describe('Word Source API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getWords', () => {
    it('should fetch words with default parameters', async () => {
      const mockResponse = {
        words: ['test', 'word', 'list'],
        metadata: {
          list: 'english1k',
          count: 3,
          total_available: 1024,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getWords();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3003/api/words?list=english1k&limit=100&randomize=true',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('should fetch words with custom parameters', async () => {
      const mockResponse = {
        words: ['python', 'code', 'function'],
        metadata: {
          list: 'python',
          count: 3,
          total_available: 352,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getWords('python', 50, false);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3003/api/words?list=python&limit=50&randomize=false',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      });

      await expect(getWords()).rejects.toThrow(
        'Server is currently unavailable'
      );
    });
  });

  describe('getWordLists', () => {
    it('should fetch available word lists', async () => {
      const mockResponse = {
        lists: [
          {
            id: 'english1k',
            name: 'English 1K',
            description: 'Most common 1,000 English words',
            total_words: 1024,
          },
          {
            id: 'english10k',
            name: 'English 10K',
            description: 'Most common 10,000 English words',
            total_words: 10000,
          },
          {
            id: 'javascript',
            name: 'JavaScript',
            description: 'JavaScript keywords and terms',
            total_words: 225,
          },
          {
            id: 'python',
            name: 'Python',
            description: 'Python keywords and terms',
            total_words: 352,
          },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getWordLists();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3003/api/words/lists',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });
});
