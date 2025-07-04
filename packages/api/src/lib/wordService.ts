import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define available word list types
export type WordListType = 'english1k' | 'english10k' | 'javascript' | 'python';

// Response interface for the words API
export interface WordsResponse {
  words: string[];
  metadata: {
    list: WordListType;
    count: number;
    total_available: number;
  };
}

// Error response interface
export interface WordsError {
  error: string;
  available_lists: WordListType[];
}

// Available word lists configuration
export const AVAILABLE_WORD_LISTS: Record<WordListType, { name: string; description: string }> = {
  english1k: {
    name: 'English 1K',
    description: 'Most common 1,000 English words'
  },
  english10k: {
    name: 'English 10K',
    description: 'Most common 10,000 English words'
  },
  javascript: {
    name: 'JavaScript',
    description: 'JavaScript keywords, functions, and programming terms'
  },
  python: {
    name: 'Python',
    description: 'Python keywords, functions, and programming terms'
  }
};

// In-memory cache for word lists
const wordListCache = new Map<WordListType, string[]>();

/**
 * Load word list from file system
 */
function loadWordListFromFile(listType: WordListType): string[] {
  try {
    const filePath = join(__dirname, '..', 'data', 'wordlists', `${listType}.json`);
    const fileContent = readFileSync(filePath, 'utf-8');
    const words = JSON.parse(fileContent) as string[];
    
    if (!Array.isArray(words)) {
      throw new Error(`Invalid word list format for ${listType}`);
    }
    
    return words;
  } catch (error) {
    throw new Error(`Failed to load word list ${listType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get word list with caching
 */
function getWordList(listType: WordListType): string[] {
  // Check cache first
  if (wordListCache.has(listType)) {
    return wordListCache.get(listType)!;
  }
  
  // Load from file and cache
  const words = loadWordListFromFile(listType);
  wordListCache.set(listType, words);
  
  return words;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Validate word list type
 */
export function isValidWordListType(listType: string): listType is WordListType {
  return Object.keys(AVAILABLE_WORD_LISTS).includes(listType as WordListType);
}

/**
 * Get words from specified list with optional limit and randomization
 */
export function getWords(
  listType: WordListType, 
  limit: number = 100, 
  randomize: boolean = true
): WordsResponse {
  try {
    const allWords = getWordList(listType);
    
    // Shuffle words if randomize is true
    const wordsToProcess = randomize ? shuffleArray(allWords) : allWords;
    
    // Apply limit
    const limitedWords = limit === 0 ? [] : wordsToProcess.slice(0, limit);
    
    return {
      words: limitedWords,
      metadata: {
        list: listType,
        count: limitedWords.length,
        total_available: allWords.length
      }
    };
  } catch (error) {
    throw new Error(`Failed to get words: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get available word list information
 */
export function getAvailableWordLists(): typeof AVAILABLE_WORD_LISTS {
  return AVAILABLE_WORD_LISTS;
}

/**
 * Validate limit parameter
 */
export function validateLimit(limit: unknown): number {
  if (limit === undefined || limit === null) {
    return 100; // default
  }
  
  const numLimit = Number(limit);
  
  if (isNaN(numLimit)) {
    throw new Error('Limit must be a valid number');
  }
  
  if (numLimit < 0) {
    throw new Error('Limit must be non-negative');
  }
  
  if (numLimit > 10000) {
    throw new Error('Limit cannot exceed 10,000 words');
  }
  
  return Math.floor(numLimit);
}

/**
 * Clear word list cache (useful for testing)
 */
export function clearCache(): void {
  wordListCache.clear();
}