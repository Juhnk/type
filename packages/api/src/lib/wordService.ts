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
  enhanced_text?: string; // Generated text with punctuation when requested
  punctuation_enabled?: boolean;
  numbers_enabled?: boolean;
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

// Configuration for enhanced text generation
interface TextEnhancementOptions {
  punctuation?: boolean;
  numbers?: boolean;
  punctuationDensity?: 'light' | 'medium' | 'heavy';
  numberFrequency?: number; // 0.0 to 1.0
}

/**
 * Get words from specified list with optional limit and randomization
 */
export function getWords(
  listType: WordListType, 
  limit: number = 100, 
  randomize: boolean = true,
  options: TextEnhancementOptions = {}
): WordsResponse {
  try {
    const allWords = getWordList(listType);
    
    // Shuffle words if randomize is true
    const wordsToProcess = randomize ? shuffleArray(allWords) : allWords;
    
    // Apply limit
    const limitedWords = limit === 0 ? [] : wordsToProcess.slice(0, limit);
    
    const response: WordsResponse = {
      words: limitedWords,
      metadata: {
        list: listType,
        count: limitedWords.length,
        total_available: allWords.length
      }
    };

    // Add enhanced text generation if punctuation is requested
    if (options.punctuation || options.numbers) {
      response.enhanced_text = generateEnhancedText(limitedWords, options);
      response.punctuation_enabled = options.punctuation || false;
      response.numbers_enabled = options.numbers || false;
    }
    
    return response;
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
 * Generate enhanced text with punctuation and numbers
 */
function generateEnhancedText(words: string[], options: TextEnhancementOptions): string {
  if (!words.length) return '';

  const {
    punctuation = false,
    numbers = false,
    punctuationDensity = 'medium',
    numberFrequency = 0.08
  } = options;

  if (!punctuation && !numbers) {
    return words.join(' ');
  }

  // Punctuation configuration based on density
  const densityConfig = {
    light: { commaChance: 0.08, periodChance: 0.6, questionChance: 0.03, exclamationChance: 0.02 },
    medium: { commaChance: 0.15, periodChance: 0.8, questionChance: 0.05, exclamationChance: 0.03 },
    heavy: { commaChance: 0.25, periodChance: 0.9, questionChance: 0.08, exclamationChance: 0.05 }
  };

  const config = densityConfig[punctuationDensity];
  const sentences: string[] = [];
  let currentSentence: string[] = [];
  let wordIndex = 0;

  // Number insertion patterns
  const numberPatterns = [
    () => Math.floor(Math.random() * 2025) + 2000, // Years
    () => Math.floor(Math.random() * 100) + 1, // Quantities
    () => (Math.random() * 100).toFixed(1) + '%', // Percentages
    () => '$' + (Math.random() * 1000).toFixed(2), // Prices
    () => Math.floor(Math.random() * 12) + 1, // Months/hours
  ];

  while (wordIndex < words.length) {
    // Determine sentence length (5-15 words)
    const sentenceLength = Math.floor(Math.random() * 11) + 5;
    currentSentence = [];

    for (let i = 0; i < sentenceLength && wordIndex < words.length; i++) {
      let currentWord = words[wordIndex];

      // Insert numbers occasionally
      if (numbers && Math.random() < numberFrequency) {
        const numberPattern = numberPatterns[Math.floor(Math.random() * numberPatterns.length)];
        currentSentence.push(numberPattern().toString());
        if (Math.random() < 0.7) { // Sometimes add a word after the number
          currentSentence.push(currentWord);
          wordIndex++;
        }
      } else {
        // Add commas for lists and compound sentences
        if (punctuation && i > 2 && i < sentenceLength - 2 && Math.random() < config.commaChance) {
          currentWord += ',';
        }

        // Add contractions and possessives
        if (punctuation && Math.random() < 0.1) {
          if (currentWord === 'it' && Math.random() < 0.5) {
            currentWord = "it's";
          } else if (currentWord === 'do' && Math.random() < 0.3) {
            currentWord = "don't";
          } else if (currentWord === 'can' && Math.random() < 0.3) {
            currentWord = "can't";
          } else if (Math.random() < 0.05) {
            currentWord += "'s"; // Possessive
          }
        }

        currentSentence.push(currentWord);
        wordIndex++;
      }
    }

    // Capitalize first word
    if (currentSentence.length > 0) {
      currentSentence[0] = capitalizeFirstLetter(currentSentence[0]);
    }

    // Add sentence-ending punctuation
    if (punctuation && currentSentence.length > 0) {
      const lastWord = currentSentence[currentSentence.length - 1];
      const rand = Math.random();
      
      if (rand < config.questionChance) {
        currentSentence[currentSentence.length - 1] = lastWord + '?';
      } else if (rand < config.questionChance + config.exclamationChance) {
        currentSentence[currentSentence.length - 1] = lastWord + '!';
      } else if (rand < config.periodChance) {
        currentSentence[currentSentence.length - 1] = lastWord + '.';
      }
    }

    if (currentSentence.length > 0) {
      sentences.push(currentSentence.join(' '));
    }
  }

  // Add quotation marks occasionally
  if (punctuation && sentences.length > 1 && Math.random() < 0.1) {
    const quoteIndex = Math.floor(Math.random() * sentences.length);
    sentences[quoteIndex] = `"${sentences[quoteIndex]}"`;
  }

  return sentences.join(' ');
}

/**
 * Capitalize the first letter of a word
 */
function capitalizeFirstLetter(word: string): string {
  if (!word) return word;
  
  // Handle cases where word starts with punctuation or numbers
  const match = word.match(/^([^a-zA-Z]*)(.*)/);
  if (match && match[2]) {
    return match[1] + match[2].charAt(0).toUpperCase() + match[2].slice(1);
  }
  
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Clear word list cache (useful for testing)
 */
export function clearCache(): void {
  wordListCache.clear();
}