import { TestConfig } from '@/store/useGameStore';

/**
 * Generates typing text from fetched words based on test configuration
 */
export function generateTextFromWords(
  words: string[],
  config: TestConfig
): string {
  if (!words || words.length === 0) {
    throw new Error('No words provided for text generation');
  }

  switch (config.mode) {
    case 'time':
      return generateTimedText(words, config.duration, config.punctuation);
    case 'words':
      return generateWordCountText(words, config.wordCount, config.punctuation);
    case 'quote':
      return generateQuoteText(words, config.punctuation);
    default:
      return words.slice(0, 50).join(' ');
  }
}

/**
 * Generates text for time-based mode
 */
function generateTimedText(
  words: string[],
  duration: number,
  includePunctuation: boolean
): string {
  // Estimate words needed based on average typing speed (40 WPM)
  // Add 20% buffer to ensure enough text
  const estimatedWordsNeeded = Math.ceil((duration / 60) * 40 * 1.2);
  const repeatedWords = repeatWords(words, estimatedWordsNeeded);

  if (includePunctuation) {
    return addPunctuation(repeatedWords);
  }

  return repeatedWords.join(' ');
}

/**
 * Generates text for word count mode
 */
function generateWordCountText(
  words: string[],
  wordCount: number,
  includePunctuation: boolean
): string {
  const selectedWords = repeatWords(words, wordCount);

  if (includePunctuation) {
    return addPunctuation(selectedWords);
  }

  return selectedWords.join(' ');
}

/**
 * Generates quote-like text
 */
function generateQuoteText(
  words: string[],
  includePunctuation: boolean
): string {
  // Create sentences of varying lengths
  const sentences: string[] = [];
  let wordIndex = 0;

  // Generate 3-5 sentences
  const sentenceCount = Math.floor(Math.random() * 3) + 3;

  for (let i = 0; i < sentenceCount; i++) {
    // Each sentence has 5-15 words
    const sentenceLength = Math.floor(Math.random() * 11) + 5;
    const sentenceWords: string[] = [];

    for (let j = 0; j < sentenceLength; j++) {
      sentenceWords.push(words[wordIndex % words.length]);
      wordIndex++;
    }

    // Capitalize first word
    if (sentenceWords.length > 0) {
      sentenceWords[0] = capitalizeFirst(sentenceWords[0]);
    }

    const sentence = sentenceWords.join(' ');
    sentences.push(includePunctuation ? sentence + '.' : sentence);
  }

  return sentences.join(' ');
}

/**
 * Repeats words array to reach target count
 */
function repeatWords(words: string[], targetCount: number): string[] {
  const result: string[] = [];
  let index = 0;

  while (result.length < targetCount) {
    result.push(words[index % words.length]);
    index++;
  }

  return result.slice(0, targetCount);
}

/**
 * Enhanced punctuation generation with realistic patterns
 */
function addPunctuation(words: string[]): string {
  if (!words.length) return '';

  const sentences: string[] = [];
  let currentSentence: string[] = [];
  let wordIndex = 0;

  // Number patterns for realistic number insertion
  const numberPatterns = [
    () => Math.floor(Math.random() * 25) + 2000, // Years 2000-2024
    () => Math.floor(Math.random() * 100) + 1, // Quantities 1-100
    () => (Math.random() * 100).toFixed(1) + '%', // Percentages
    () => '$' + (Math.random() * 1000).toFixed(2), // Prices $0.00-$1000.00
    () => Math.floor(Math.random() * 12) + 1, // Months/hours 1-12
    () => Math.floor(Math.random() * 31) + 1, // Days 1-31
  ];

  while (wordIndex < words.length) {
    // Determine sentence length (6-18 words for more variation)
    const sentenceLength = Math.floor(Math.random() * 13) + 6;
    currentSentence = [];

    for (let i = 0; i < sentenceLength && wordIndex < words.length; i++) {
      let currentWord = words[wordIndex];

      // Insert numbers occasionally (8% chance)
      if (Math.random() < 0.08) {
        const numberPattern =
          numberPatterns[Math.floor(Math.random() * numberPatterns.length)];
        currentSentence.push(numberPattern().toString());
        if (Math.random() < 0.7) {
          // 70% chance to add a word after number
          currentSentence.push(currentWord);
          wordIndex++;
        }
        continue;
      }

      // Add commas for lists and compound sentences
      if (i > 2 && i < sentenceLength - 2 && Math.random() < 0.15) {
        currentWord += ',';
      }

      // Add contractions and possessives
      if (Math.random() < 0.12) {
        const contractions: Record<string, string[]> = {
          it: ["it's", "it'll"],
          do: ["don't", "doesn't"],
          can: ["can't", 'cannot'],
          will: ["won't", "we'll"],
          have: ["haven't", "hasn't"],
          would: ["wouldn't", "we'd"],
          could: ["couldn't", "could've"],
          should: ["shouldn't", "should've"],
          i: ["I'm", "I'll", "I've", "I'd"],
          you: ["you're", "you'll", "you've", "you'd"],
          we: ["we're", "we'll", "we've", "we'd"],
          they: ["they're", "they'll", "they've", "they'd"],
        };

        const lowerWord = currentWord.toLowerCase();
        if (contractions[lowerWord] && Math.random() < 0.6) {
          const options = contractions[lowerWord];
          currentWord = options[Math.floor(Math.random() * options.length)];
        } else if (Math.random() < 0.05) {
          currentWord += "'s"; // Possessive
        }
      }

      currentSentence.push(currentWord);
      wordIndex++;
    }

    // Capitalize first word of sentence
    if (currentSentence.length > 0) {
      currentSentence[0] = capitalizeFirst(currentSentence[0]);
    }

    // Add sentence-ending punctuation with more variety
    if (currentSentence.length > 0) {
      const lastWordIndex = currentSentence.length - 1;
      const lastWord = currentSentence[lastWordIndex];
      const rand = Math.random();

      if (rand < 0.05) {
        currentSentence[lastWordIndex] = lastWord + '?';
      } else if (rand < 0.08) {
        currentSentence[lastWordIndex] = lastWord + '!';
      } else if (rand < 0.02) {
        currentSentence[lastWordIndex] = lastWord + '...';
      } else {
        currentSentence[lastWordIndex] = lastWord + '.';
      }
    }

    if (currentSentence.length > 0) {
      sentences.push(currentSentence.join(' '));
    }
  }

  // Add quotation marks occasionally around whole sentences
  if (sentences.length > 1 && Math.random() < 0.08) {
    const quoteIndex = Math.floor(Math.random() * sentences.length);
    sentences[quoteIndex] = `"${sentences[quoteIndex]}"`;
  }

  // Add semicolons for complex sentences
  const finalText = sentences.join(' ');
  return addAdvancedPunctuation(finalText);
}

/**
 * Add advanced punctuation patterns (semicolons, colons, parentheses)
 */
function addAdvancedPunctuation(text: string): string {
  let result = text;

  // Add semicolons occasionally between sentences (2% chance)
  if (Math.random() < 0.02) {
    result = result.replace(/\. ([A-Z])/g, (match, p1) => {
      return Math.random() < 0.3 ? `; ${p1.toLowerCase()}` : match;
    });
  }

  // Add colons for explanations (1% chance)
  if (Math.random() < 0.01) {
    result = result.replace(/\. ([A-Z][^.]*\.)/g, (match, p1) => {
      return Math.random() < 0.5 ? `: ${p1.toLowerCase()}` : match;
    });
  }

  // Add parenthetical remarks (3% chance)
  if (Math.random() < 0.03) {
    const words = result.split(' ');
    if (words.length > 10) {
      const insertPos = Math.floor(Math.random() * (words.length - 5)) + 3;
      const parentheticalWords = [
        'like this',
        'for example',
        'of course',
        'obviously',
        'naturally',
      ];
      const parenthetical =
        parentheticalWords[
          Math.floor(Math.random() * parentheticalWords.length)
        ];
      words.splice(insertPos, 0, `(${parenthetical})`);
      result = words.join(' ');
    }
  }

  return result;
}

/**
 * Capitalizes the first letter of a word
 */
function capitalizeFirst(word: string): string {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Generates fallback text when API fails
 */
export function generateFallbackText(config: TestConfig): string {
  const fallbackWords = [
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
    'under',
    'bright',
    'blue',
    'sky',
    'during',
    'sunny',
    'afternoon',
    'near',
    'peaceful',
    'river',
    'flowing',
    'gently',
    'towards',
    'distant',
    'mountains',
    'where',
    'eagles',
    'soar',
    'high',
    'among',
    'white',
    'clouds',
    'drifting',
    'slowly',
    'across',
    'vast',
    'horizon',
    'beneath',
    'warm',
    'golden',
    'sunlight',
    'shining',
  ];

  return generateTextFromWords(fallbackWords, config);
}
