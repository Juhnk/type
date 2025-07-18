/**
 * Sprint 8: Punctuation & Numbers Enhancement Tests
 *
 * These tests verify that the enhanced text generation with punctuation
 * and numbers works correctly across all game modes and difficulty levels.
 */

import { describe, it, expect } from 'vitest';
import { generateTextFromWords } from '../lib/textGenerator';
import { TestConfig } from '../store/useGameStore';

describe('Sprint 8: Punctuation & Numbers Enhancement', () => {
  const sampleWords = [
    'the',
    'quick',
    'brown',
    'fox',
    'jumps',
    'over',
    'lazy',
    'dog',
    'and',
    'runs',
    'through',
    'forest',
    'with',
    'great',
    'speed',
    'while',
    'birds',
    'sing',
    'above',
    'trees',
  ];

  describe('Enhanced Text Generation', () => {
    it('generates text with punctuation when enabled', () => {
      const config: TestConfig = {
        mode: 'words',
        duration: 60,
        wordCount: 25,
        difficulty: 'Normal',
        textSource: 'english1k',
        punctuation: true,
      };

      const result = generateTextFromWords(sampleWords, config);

      // Should contain punctuation marks
      expect(result).toMatch(/[.!?]/);
      // Should have proper capitalization
      expect(result.charAt(0)).toMatch(/[A-Z]/);
      // Should be longer than just words joined with spaces
      expect(result.length).toBeGreaterThan(
        sampleWords.slice(0, 10).join(' ').length
      );
    });

    it('generates plain text when punctuation is disabled', () => {
      const config: TestConfig = {
        mode: 'words',
        duration: 60,
        wordCount: 25,
        difficulty: 'Normal',
        textSource: 'english1k',
        punctuation: false,
      };

      const result = generateTextFromWords(sampleWords, config);

      // Should not contain sentence-ending punctuation
      expect(result).not.toMatch(/[.!?]/);
      // Should be just words joined with spaces
      expect(result).toBe(sampleWords.slice(0, 25).join(' '));
    });

    it('generates appropriate length text for time mode', () => {
      const config: TestConfig = {
        mode: 'time',
        duration: 60,
        wordCount: 25,
        difficulty: 'Normal',
        textSource: 'english1k',
        punctuation: true,
      };

      const result = generateTextFromWords(sampleWords, config);

      // Should generate enough text for 60 seconds (estimate ~40 WPM)
      const wordCount = result.split(' ').length;
      expect(wordCount).toBeGreaterThan(40); // At least 40 words
    });

    it('generates quote-style text for quote mode', () => {
      const config: TestConfig = {
        mode: 'quote',
        duration: 60,
        wordCount: 25,
        difficulty: 'Normal',
        textSource: 'english1k',
        punctuation: true,
      };

      const result = generateTextFromWords(sampleWords, config);

      // Should have multiple sentences
      expect(result.split(/[.!?]/).length).toBeGreaterThan(2);
      // Should start with capital letter
      expect(result.charAt(0)).toMatch(/[A-Z]/);
    });
  });

  describe('Punctuation Patterns', () => {
    const config: TestConfig = {
      mode: 'words',
      duration: 60,
      wordCount: 50,
      difficulty: 'Normal',
      textSource: 'english1k',
      punctuation: true,
    };

    it('includes proper sentence structure', () => {
      const result = generateTextFromWords(sampleWords, config);

      // Should end sentences properly
      expect(result).toMatch(/[.!?](\s|$)/);
      // Should capitalize after periods
      expect(result).toMatch(/\.\s+[A-Z]/);
    });

    it('includes contractions when punctuation is enabled', () => {
      // Run multiple times to increase chance of getting contractions
      let foundContraction = false;

      for (let i = 0; i < 10; i++) {
        const result = generateTextFromWords(sampleWords, config);
        if (result.includes("'")) {
          foundContraction = true;
          break;
        }
      }

      // At least one attempt should produce contractions
      // Note: This is probabilistic, so we can't guarantee it every time
      expect(foundContraction).toBe(true);
    });

    it('maintains word boundaries correctly with punctuation', () => {
      const result = generateTextFromWords(sampleWords, config);

      // Should not have double spaces
      expect(result).not.toMatch(/\s{2,}/);
      // Should have spaces around words
      expect(result).toMatch(/\w\s+\w/);
    });
  });

  describe('Difficulty Mode Compatibility', () => {
    it('generates compatible text for Expert mode', () => {
      const config: TestConfig = {
        mode: 'words',
        duration: 60,
        wordCount: 25,
        difficulty: 'Expert',
        textSource: 'english1k',
        punctuation: true,
      };

      const result = generateTextFromWords(sampleWords, config);

      // Should still work with word boundaries
      expect(result.length).toBeGreaterThan(0);
      expect(result.trim()).toBeTruthy();
    });

    it('generates compatible text for Master mode', () => {
      const config: TestConfig = {
        mode: 'words',
        duration: 60,
        wordCount: 25,
        difficulty: 'Master',
        textSource: 'english1k',
        punctuation: true,
      };

      const result = generateTextFromWords(sampleWords, config);

      // Should work character-by-character
      expect(result.length).toBeGreaterThan(0);
      expect(result.trim()).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty word arrays gracefully', () => {
      const config: TestConfig = {
        mode: 'words',
        duration: 60,
        wordCount: 25,
        difficulty: 'Normal',
        textSource: 'english1k',
        punctuation: true,
      };

      expect(() => generateTextFromWords([], config)).toThrow();
    });

    it('handles single word arrays', () => {
      const config: TestConfig = {
        mode: 'words',
        duration: 60,
        wordCount: 10,
        difficulty: 'Normal',
        textSource: 'english1k',
        punctuation: true,
      };

      const result = generateTextFromWords(['hello'], config);

      expect(result).toBeTruthy();
      expect(result.trim().length).toBeGreaterThan(0);
    });

    it('handles very long word requests', () => {
      const config: TestConfig = {
        mode: 'words',
        duration: 60,
        wordCount: 100,
        difficulty: 'Normal',
        textSource: 'english1k',
        punctuation: true,
      };

      const result = generateTextFromWords(sampleWords, config);

      // Should repeat words to reach target count
      const wordCount = result.split(/\s+/).length;
      expect(wordCount).toBeGreaterThanOrEqual(90); // Allow some variation due to punctuation
    });
  });

  describe('Performance', () => {
    it('generates text efficiently for large requests', () => {
      const config: TestConfig = {
        mode: 'time',
        duration: 300, // 5 minutes
        wordCount: 50,
        difficulty: 'Normal',
        textSource: 'english1k',
        punctuation: true,
      };

      const startTime = performance.now();
      const result = generateTextFromWords(sampleWords, config);
      const endTime = performance.now();

      // Should complete within reasonable time (100ms)
      expect(endTime - startTime).toBeLessThan(100);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
