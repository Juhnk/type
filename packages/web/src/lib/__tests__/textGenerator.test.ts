import { describe, it, expect } from 'vitest';
import { generateTextFromWords, generateFallbackText } from '../textGenerator';
import { TestConfig } from '@/store/useGameStore';

describe('textGenerator', () => {
  const mockWords = ['hello', 'world', 'test', 'words', 'for', 'typing'];

  const baseConfig: TestConfig = {
    mode: 'time',
    duration: 60,
    wordCount: 25,
    difficulty: 'Normal',
    textSource: 'english1k',
    punctuation: false,
  };

  describe('generateTextFromWords', () => {
    it('throws error when no words provided', () => {
      expect(() => generateTextFromWords([], baseConfig)).toThrow(
        'No words provided for text generation'
      );
    });

    it('generates text for time mode', () => {
      const config = { ...baseConfig, mode: 'time' as const, duration: 30 };
      const result = generateTextFromWords(mockWords, config);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.split(' ').length).toBeGreaterThan(10);
    });

    it('generates text for words mode', () => {
      const config = {
        ...baseConfig,
        mode: 'words' as const,
        wordCount: 10 as const,
      };
      const result = generateTextFromWords(mockWords, config);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.split(' ').length).toBe(10);
    });

    it('generates text for quote mode', () => {
      const config = { ...baseConfig, mode: 'quote' as const };
      const result = generateTextFromWords(mockWords, config);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.split(' ').length).toBeGreaterThan(5);
    });

    it('includes punctuation when enabled', () => {
      const config = { ...baseConfig, punctuation: true };
      const result = generateTextFromWords(mockWords, config);

      expect(result).toBeTruthy();
      expect(result).toMatch(/[.!?]/);
    });

    it('excludes punctuation when disabled', () => {
      const config = { ...baseConfig, punctuation: false };
      const result = generateTextFromWords(mockWords, config);

      expect(result).toBeTruthy();
      expect(result).not.toMatch(/[.!?]/);
    });

    it('repeats words when needed', () => {
      const shortWords = ['a', 'b'];
      const config = {
        ...baseConfig,
        mode: 'words' as const,
        wordCount: 10 as const,
      };
      const result = generateTextFromWords(shortWords, config);

      expect(result.split(' ').length).toBe(10);
      expect(result).toContain('a');
      expect(result).toContain('b');
    });
  });

  describe('generateFallbackText', () => {
    it('generates fallback text for time mode', () => {
      const config = { ...baseConfig, mode: 'time' as const };
      const result = generateFallbackText(config);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.split(' ').length).toBeGreaterThan(10);
    });

    it('generates fallback text for words mode', () => {
      const config = {
        ...baseConfig,
        mode: 'words' as const,
        wordCount: 25 as const,
      };
      const result = generateFallbackText(config);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.split(' ').length).toBe(25);
    });

    it('generates fallback text for quote mode', () => {
      const config = { ...baseConfig, mode: 'quote' as const };
      const result = generateFallbackText(config);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.split(' ').length).toBeGreaterThan(5);
    });
  });
});
