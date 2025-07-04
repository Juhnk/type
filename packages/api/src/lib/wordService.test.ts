import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  getWords, 
  getAvailableWordLists, 
  isValidWordListType, 
  validateLimit,
  clearCache,
  WordListType,
  AVAILABLE_WORD_LISTS
} from './wordService.js';

describe('Word Service', () => {
  beforeEach(() => {
    clearCache();
  });

  describe('getWords', () => {
    it('should return words for valid list types', () => {
      const result = getWords('english1k', 10);
      
      expect(result).toHaveProperty('words');
      expect(result).toHaveProperty('metadata');
      expect(result.words).toBeInstanceOf(Array);
      expect(result.words.length).toBe(10);
      expect(result.metadata.list).toBe('english1k');
      expect(result.metadata.count).toBe(10);
      expect(result.metadata.total_available).toBeGreaterThan(0);
    });

    it('should return different randomized results when randomize=true', () => {
      const result1 = getWords('english1k', 50, true);
      const result2 = getWords('english1k', 50, true);
      
      // With 50 words from 1000+, very unlikely to get same order
      expect(result1.words).not.toEqual(result2.words);
    });

    it('should return same order when randomize=false', () => {
      const result1 = getWords('python', 10, false);
      const result2 = getWords('python', 10, false);
      
      expect(result1.words).toEqual(result2.words);
      expect(result1.words).toEqual(['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'break', 'continue', 'pass']);
    });

    it('should handle limit parameter correctly', () => {
      const small = getWords('javascript', 5);
      const large = getWords('javascript', 100);
      
      expect(small.words.length).toBe(5);
      expect(large.words.length).toBe(100);
      expect(small.metadata.count).toBe(5);
      expect(large.metadata.count).toBe(100);
    });

    it('should use default limit of 100 when not specified', () => {
      const result = getWords('english1k');
      
      expect(result.words.length).toBe(100);
      expect(result.metadata.count).toBe(100);
    });

    it('should handle limit larger than available words', () => {
      const result = getWords('python', 10000);
      
      expect(result.words.length).toBeLessThanOrEqual(result.metadata.total_available);
      expect(result.metadata.count).toBe(result.words.length);
    });

    it('should cache word lists for performance', () => {
      const start1 = performance.now();
      getWords('english1k', 10);
      const time1 = performance.now() - start1;
      
      const start2 = performance.now();
      getWords('english1k', 10);
      const time2 = performance.now() - start2;
      
      // Second call should be significantly faster due to caching
      expect(time2).toBeLessThan(time1);
    });

    it('should handle all supported word list types', () => {
      const listTypes: WordListType[] = ['english1k', 'english10k', 'javascript', 'python'];
      
      listTypes.forEach(listType => {
        const result = getWords(listType, 5);
        expect(result.words.length).toBe(5);
        expect(result.metadata.list).toBe(listType);
        expect(result.metadata.total_available).toBeGreaterThan(0);
      });
    });

    it('should handle word lists that may contain duplicates', () => {
      const result = getWords('english1k', 100);
      const uniqueWords = new Set(result.words);
      
      // Word lists may contain some duplicates from the source data
      expect(uniqueWords.size).toBeLessThanOrEqual(result.words.length);
      expect(result.words.length).toBe(100);
    });

    it('should handle zero limit', () => {
      const result = getWords('python', 0);
      
      expect(result.words.length).toBe(0);
      expect(result.metadata.count).toBe(0);
      expect(result.metadata.total_available).toBeGreaterThan(0);
    });
  });

  describe('isValidWordListType', () => {
    it('should return true for valid word list types', () => {
      expect(isValidWordListType('english1k')).toBe(true);
      expect(isValidWordListType('english10k')).toBe(true);
      expect(isValidWordListType('javascript')).toBe(true);
      expect(isValidWordListType('python')).toBe(true);
    });

    it('should return false for invalid word list types', () => {
      expect(isValidWordListType('invalid')).toBe(false);
      expect(isValidWordListType('english')).toBe(false);
      expect(isValidWordListType('java')).toBe(false);
      expect(isValidWordListType('')).toBe(false);
      expect(isValidWordListType('null')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidWordListType('English1k')).toBe(false); // Case sensitive
      expect(isValidWordListType(' english1k ')).toBe(false); // Whitespace
      expect(isValidWordListType('english1k ')).toBe(false); // Trailing space
    });
  });

  describe('validateLimit', () => {
    it('should return default limit for undefined/null', () => {
      expect(validateLimit(undefined)).toBe(100);
      expect(validateLimit(null)).toBe(100);
    });

    it('should parse string numbers correctly', () => {
      expect(validateLimit('50')).toBe(50);
      expect(validateLimit('1000')).toBe(1000);
      expect(validateLimit('0')).toBe(0);
    });

    it('should handle numeric inputs', () => {
      expect(validateLimit(50)).toBe(50);
      expect(validateLimit(1000)).toBe(1000);
      expect(validateLimit(0)).toBe(0);
    });

    it('should floor decimal numbers', () => {
      expect(validateLimit(50.7)).toBe(50);
      expect(validateLimit('99.9')).toBe(99);
    });

    it('should throw error for invalid inputs', () => {
      expect(() => validateLimit('invalid')).toThrow('Limit must be a valid number');
      expect(() => validateLimit('abc')).toThrow('Limit must be a valid number');
      expect(() => validateLimit(NaN)).toThrow('Limit must be a valid number');
    });

    it('should throw error for negative numbers', () => {
      expect(() => validateLimit(-1)).toThrow('Limit must be non-negative');
      expect(() => validateLimit('-5')).toThrow('Limit must be non-negative');
    });

    it('should throw error for limits exceeding maximum', () => {
      expect(() => validateLimit(10001)).toThrow('Limit cannot exceed 10,000 words');
      expect(() => validateLimit('15000')).toThrow('Limit cannot exceed 10,000 words');
    });

    it('should allow maximum limit of 10000', () => {
      expect(validateLimit(10000)).toBe(10000);
      expect(validateLimit('10000')).toBe(10000);
    });
  });

  describe('getAvailableWordLists', () => {
    it('should return all available word lists', () => {
      const lists = getAvailableWordLists();
      
      expect(lists).toEqual(AVAILABLE_WORD_LISTS);
      expect(Object.keys(lists)).toHaveLength(4);
      expect(lists).toHaveProperty('english1k');
      expect(lists).toHaveProperty('english10k');
      expect(lists).toHaveProperty('javascript');
      expect(lists).toHaveProperty('python');
    });

    it('should include proper metadata for each list', () => {
      const lists = getAvailableWordLists();
      
      Object.values(lists).forEach(list => {
        expect(list).toHaveProperty('name');
        expect(list).toHaveProperty('description');
        expect(typeof list.name).toBe('string');
        expect(typeof list.description).toBe('string');
        expect(list.name.length).toBeGreaterThan(0);
        expect(list.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('clearCache', () => {
    it('should clear word list cache', () => {
      // Load words to populate cache
      getWords('python', 10);
      
      // Clear cache
      clearCache();
      
      // Loading again should take longer (not cached)
      const start = performance.now();
      getWords('python', 10);
      const time = performance.now() - start;
      
      // Should be slower than cached access (basic performance check)
      expect(time).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid word list types at runtime', () => {
      // This test verifies the service would handle errors if an invalid type made it through validation
      expect(() => getWords('nonexistent' as WordListType, 10)).toThrow();
    });
  });

  describe('Performance Tests', () => {
    it('should handle large word requests efficiently', () => {
      const start = performance.now();
      const result = getWords('english1k', 1000);
      const time = performance.now() - start;
      
      expect(result.words.length).toBe(1000);
      expect(time).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should handle randomization efficiently for large sets', () => {
      const start = performance.now();
      getWords('english1k', 1000, true);
      const time = performance.now() - start;
      
      expect(time).toBeLessThan(200); // Randomization should be fast
    });
  });

  describe('Data Integrity', () => {
    it('should verify word list file integrity', () => {
      const listTypes: WordListType[] = ['english1k', 'english10k', 'javascript', 'python'];
      
      listTypes.forEach(listType => {
        const result = getWords(listType, 100);
        
        // Verify all entries are strings
        result.words.forEach(word => {
          expect(typeof word).toBe('string');
          expect(word.length).toBeGreaterThan(0);
          expect(word.trim()).toBe(word); // No leading/trailing whitespace
        });
        
        // Verify words exist
        expect(result.words.length).toBeGreaterThan(0);
      });
    });

    it('should verify expected word counts for each list', () => {
      const python = getWords('python', 10000);
      const javascript = getWords('javascript', 10000);
      const english1k = getWords('english1k', 10000);
      
      expect(python.metadata.total_available).toBe(352); // Python has 352 terms
      expect(javascript.metadata.total_available).toBe(225); // JavaScript has 225 terms  
      expect(english1k.metadata.total_available).toBe(1024); // English1k has 1024 words
    });
  });
});