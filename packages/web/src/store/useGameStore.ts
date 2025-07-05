import { create } from 'zustand';
import { saveTestResult, type TestResult } from '@/lib/history';
import { saveSingleTest, getWords } from '@/lib/api-client';
import { useAuthStore } from './useAuthStore';
import {
  generateTextFromWords,
  generateFallbackText,
} from '@/lib/textGenerator';

// Test Configuration Interface
export interface TestConfig {
  mode: 'time' | 'words' | 'quote'; // Test mode
  duration: number; // Test duration in seconds
  wordCount: 10 | 25 | 50 | 100; // Word count for words mode
  difficulty: 'Normal' | 'Expert' | 'Master';
  textSource: 'english1k' | 'english10k' | 'javascript' | 'python';
  punctuation: boolean; // Include punctuation in text
  customText?: string;
}

// Character State Interface
interface CharState {
  char: string;
  status: 'default' | 'correct' | 'incorrect' | 'current';
  timestamp?: number;
}

// Game Statistics Interface
interface GameStats {
  wpm: number; // Words per minute
  accuracy: number; // Percentage
  startTime: number;
  endTime?: number;
  totalChars: number;
  correctChars: number;
  incorrectChars: number;
  elapsedTime: number;
}

// Game Status Type
type GameStatus = 'idle' | 'ready' | 'running' | 'paused' | 'finished';

// Text Window Interface for line-based scrolling
interface TextWindow {
  lines: string[];
  scrollOffset: number;
  lineCharOffsets: number[]; // Character positions where each line starts
}

// Main Store Interface
interface GameState {
  // Core typing data
  testConfig: TestConfig;
  textToType: string;
  charStates: CharState[];
  userInput: string;
  gameStatus: GameStatus;
  stats: GameStats;
  isLoadingWords: boolean;
  wordsError: string | null;
  words: string[]; // Store fetched words
  isPreparingGame: boolean;
  gamePreparationError: string | null;

  // Text window state for auto-scrolling
  textWindow: TextWindow;
  maxCharsPerLine: number;
  isContentStreaming: boolean;

  // Timer state for time mode
  timeRemaining: number; // in milliseconds
  isTimerRunning: boolean;
  gameStartTime: number | null; // timestamp when game started
  timerId: NodeJS.Timeout | null;

  // Word tracking state for words mode
  wordsCompleted: number;
  targetWordCount: number;
  wordsProgress: number; // percentage of completion
  currentWordIndex: number; // index of word being typed
  wordBoundaries: number[]; // positions of word boundaries in text

  // Failure tracking for difficulty modes
  testFailed: boolean;
  failureReason: string | null;

  // Actions
  setTestConfig: (config: Partial<TestConfig>) => void;
  setTextToType: (text: string) => void;
  loadWordsFromAPI: () => Promise<void>;
  prepareGame: () => Promise<void>;
  resetGamePreparation: () => void;
  useFallbackWords: () => void;
  handleKeyPress: (key: string) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  completeGame: () => void;
  updateStats: () => void;

  // Timer actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  updateTimer: () => void;
  clearTimer: () => void;

  // Word tracking actions
  updateWordProgress: () => void;
  checkWordCompletion: () => void;
  calculateWordBoundaries: (text: string) => number[];

  // Text window and streaming actions
  generateTextInLines: (words: string[]) => string[];
  initializeTextWindow: (text: string) => void;
  updateTextWindow: () => void;
  checkLineProgression: () => void;
  scrollToNextLine: () => void;
  generateMoreContent: () => Promise<void>;
  appendDynamicContent: (newWords: string[]) => void;
}

// Default values
const defaultTestConfig: TestConfig = {
  mode: 'time',
  duration: 60,
  wordCount: 50,
  difficulty: 'Normal',
  textSource: 'english1k',
  punctuation: false,
};

const defaultStats: GameStats = {
  wpm: 0,
  accuracy: 0,
  startTime: 0,
  totalChars: 0,
  correctChars: 0,
  incorrectChars: 0,
  elapsedTime: 0,
};

const defaultTextWindow: TextWindow = {
  lines: [],
  scrollOffset: 0,
  lineCharOffsets: [],
};

// Sample text for development
const sampleText = 'the quick brown fox jumps over the lazy dog';

// Zustand Store
export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  testConfig: defaultTestConfig,
  textToType: sampleText,
  charStates: sampleText.split('').map((char) => ({
    char,
    status: 'default' as const,
  })),
  userInput: '',
  gameStatus: 'ready',
  stats: defaultStats,
  isLoadingWords: false,
  wordsError: null,
  words: [],
  isPreparingGame: false,
  gamePreparationError: null,

  // Text window state
  textWindow: defaultTextWindow,
  maxCharsPerLine: 70,
  isContentStreaming: false,

  // Timer state
  timeRemaining: 0,
  isTimerRunning: false,
  gameStartTime: null,
  timerId: null,

  // Word tracking state
  wordsCompleted: 0,
  targetWordCount: 0,
  wordsProgress: 0,
  currentWordIndex: 0,
  wordBoundaries: [],

  // Failure tracking
  testFailed: false,
  failureReason: null,

  // Actions
  setTestConfig: (config: Partial<TestConfig>) => {
    // Reset timer if duration or mode changes
    if (config.duration !== undefined || config.mode !== undefined) {
      get().resetTimer();
    }

    set((state) => ({
      testConfig: { ...state.testConfig, ...config },
    }));

    // Prepare new game if any relevant config changed
    if (
      config.textSource ||
      config.wordCount ||
      config.mode ||
      config.punctuation
    ) {
      get().prepareGame();
    }

    // Initialize timer state for time mode
    if (
      config.mode === 'time' ||
      (config.duration !== undefined && get().testConfig.mode === 'time')
    ) {
      const { duration } = get().testConfig;
      set({ timeRemaining: duration * 1000 });
    }
  },

  setTextToType: (text: string) => {
    const boundaries = get().calculateWordBoundaries(text);
    const { testConfig } = get();

    // Initialize the text window for the new text
    get().initializeTextWindow(text);

    set({
      textToType: text,
      charStates: text.split('').map((char, index) => ({
        char,
        status: index === 0 ? ('current' as const) : ('default' as const),
      })),
      userInput: '',
      gameStatus: 'ready',
      wordBoundaries: boundaries,
      wordsCompleted: 0,
      wordsProgress: 0,
      currentWordIndex: 0,
      targetWordCount: testConfig.mode === 'words' ? testConfig.wordCount : 0,
    });
  },

  loadWordsFromAPI: async () => {
    const { testConfig } = get();

    set({ isLoadingWords: true, wordsError: null });

    try {
      // Calculate word count based on mode
      let wordLimit = 100; // Default for time mode

      if (testConfig.mode === 'words') {
        wordLimit = testConfig.wordCount;
      } else if (testConfig.mode === 'time') {
        // Estimate words needed based on duration (assuming 40 WPM average)
        wordLimit = Math.max(100, Math.ceil((testConfig.duration * 40) / 60));
      }

      const response = await getWords(testConfig.textSource, wordLimit, true);

      if (response.words && response.words.length > 0) {
        // Join words with spaces to create text
        const text = response.words.join(' ');
        get().setTextToType(text);
      } else {
        throw new Error('No words received from API');
      }

      set({ isLoadingWords: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load words';
      set({
        isLoadingWords: false,
        wordsError: errorMessage,
        // Fall back to sample text on error
        textToType: sampleText,
        charStates: sampleText.split('').map((char) => ({
          char,
          status: 'default' as const,
        })),
      });
      console.error('Failed to load words from API:', error);
    }
  },

  prepareGame: async () => {
    const { testConfig } = get();

    set({ isPreparingGame: true, gamePreparationError: null });

    try {
      // Calculate word count based on mode
      let wordLimit = 100; // Default for time mode

      if (testConfig.mode === 'words') {
        wordLimit = testConfig.wordCount;
      } else if (testConfig.mode === 'time') {
        // Estimate words needed based on duration (assuming 40 WPM average)
        // Add extra buffer for faster typists
        wordLimit = Math.max(100, Math.ceil((testConfig.duration * 50) / 60));
      } else if (testConfig.mode === 'quote') {
        // For quote mode, get a reasonable amount of words
        wordLimit = 200;
      }

      const response = await getWords(testConfig.textSource, wordLimit, true);

      if (response.words && response.words.length > 0) {
        // Store the fetched words
        set({ words: response.words });

        // Generate text based on mode and configuration
        const generatedText = generateTextFromWords(response.words, testConfig);

        // Set the generated text and update char states
        const newCharStates = generatedText.split('').map((char, index) => ({
          char,
          status: index === 0 ? ('current' as const) : ('default' as const),
        }));

        // Calculate word boundaries
        const boundaries = get().calculateWordBoundaries(generatedText);

        // Initialize the text window
        get().initializeTextWindow(generatedText);

        set({
          textToType: generatedText,
          charStates: newCharStates,
          userInput: '',
          gameStatus: 'ready',
          isPreparingGame: false,
          gamePreparationError: null,
          // Initialize timer for time mode
          timeRemaining:
            testConfig.mode === 'time' ? testConfig.duration * 1000 : 0,
          // Initialize word tracking for words mode
          wordBoundaries: boundaries,
          wordsCompleted: 0,
          wordsProgress: 0,
          currentWordIndex: 0,
          targetWordCount:
            testConfig.mode === 'words' ? testConfig.wordCount : 0,
        });
      } else {
        throw new Error('No words received from API');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to prepare game';

      // Generate fallback text
      const fallbackText = generateFallbackText(testConfig);
      const fallbackCharStates = fallbackText.split('').map((char, index) => ({
        char,
        status: index === 0 ? ('current' as const) : ('default' as const),
      }));

      // Calculate word boundaries for fallback text
      const boundaries = get().calculateWordBoundaries(fallbackText);

      // Initialize the text window for fallback text
      get().initializeTextWindow(fallbackText);

      set({
        isPreparingGame: false,
        gamePreparationError: errorMessage,
        textToType: fallbackText,
        charStates: fallbackCharStates,
        userInput: '',
        gameStatus: 'ready',
        // Initialize timer for time mode
        timeRemaining:
          testConfig.mode === 'time' ? testConfig.duration * 1000 : 0,
        // Initialize word tracking for words mode
        wordBoundaries: boundaries,
        wordsCompleted: 0,
        wordsProgress: 0,
        currentWordIndex: 0,
        targetWordCount: testConfig.mode === 'words' ? testConfig.wordCount : 0,
      });

      console.error('Failed to prepare game:', error);
    }
  },

  resetGamePreparation: () => {
    set({
      isPreparingGame: false,
      gamePreparationError: null,
    });
  },

  useFallbackWords: () => {
    const { testConfig } = get();
    const fallbackText = generateFallbackText(testConfig);
    const fallbackCharStates = fallbackText.split('').map((char, index) => ({
      char,
      status: index === 0 ? ('current' as const) : ('default' as const),
    }));

    // Calculate word boundaries
    const boundaries = get().calculateWordBoundaries(fallbackText);

    set({
      textToType: fallbackText,
      charStates: fallbackCharStates,
      userInput: '',
      gameStatus: 'ready',
      isPreparingGame: false,
      gamePreparationError: null,
      // Initialize timer for time mode
      timeRemaining:
        testConfig.mode === 'time' ? testConfig.duration * 1000 : 0,
      // Initialize word tracking for words mode
      wordBoundaries: boundaries,
      wordsCompleted: 0,
      wordsProgress: 0,
      currentWordIndex: 0,
      targetWordCount: testConfig.mode === 'words' ? testConfig.wordCount : 0,
    });
  },

  handleKeyPress: (key: string) =>
    set((state) => {
      const { gameStatus, userInput, textToType, testConfig, wordBoundaries } =
        state;

      // Start game if ready
      if (gameStatus === 'ready') {
        const now = Date.now();
        set({
          gameStatus: 'running',
          stats: { ...state.stats, startTime: now },
        });

        // Start timer for time mode
        get().startTimer();
      }

      // Handle backspace
      if (key === 'Backspace') {
        if (userInput.length === 0) return {};

        const newInput = userInput.slice(0, -1);
        const newCharStates = [...state.charStates];

        // Reset the character that was just deleted
        if (newCharStates[userInput.length - 1]) {
          newCharStates[userInput.length - 1].status = 'default';
        }

        // Update current character marker
        if (newCharStates[newInput.length]) {
          newCharStates[newInput.length].status = 'current';
        }

        get().updateStats();

        // Update word progress when backspacing
        if (state.testConfig.mode === 'words') {
          setTimeout(() => {
            get().updateWordProgress();
          }, 0);
        }

        return { userInput: newInput, charStates: newCharStates };
      }

      // Handle character input
      if (key.length === 1 && userInput.length < textToType.length) {
        const index = userInput.length;
        const expectedChar = textToType[index];
        const isCorrect = key === expectedChar;

        // Master Mode: Fail on first incorrect keystroke
        if (testConfig.difficulty === 'Master' && !isCorrect) {
          // Set game as failed and complete immediately
          set({
            gameStatus: 'finished',
            testFailed: true,
            failureReason: `Master Mode: Failed on incorrect keystroke '${key}' (expected '${expectedChar}')`,
          });
          get().completeGame();
          return {};
        }

        const newInput = userInput + key;
        const newCharStates = [...state.charStates];

        // Update current character status
        newCharStates[index] = {
          char: expectedChar,
          status: isCorrect ? 'correct' : 'incorrect',
          timestamp: Date.now(),
        };

        // Update next character to current
        if (newCharStates[index + 1]) {
          newCharStates[index + 1].status = 'current';
        }

        // Expert Mode: Check for word completion with errors when space is pressed
        if (testConfig.difficulty === 'Expert' && key === ' ') {
          // Find the current word being completed
          const currentWordBoundaryIndex =
            wordBoundaries.findIndex((boundary) => boundary > index) - 1;

          if (currentWordBoundaryIndex >= 0) {
            const wordStart = wordBoundaries[currentWordBoundaryIndex];
            const wordEnd = index; // Current position (space pressed)

            // Check if any character in the completed word is incorrect
            let hasError = false;
            for (let i = wordStart; i < wordEnd; i++) {
              if (newCharStates[i] && newCharStates[i].status === 'incorrect') {
                hasError = true;
                break;
              }
            }

            if (hasError) {
              // Find the specific incorrect word for the error message
              const incorrectWord = textToType.slice(wordStart, wordEnd);
              // Set game as failed and complete immediately
              set({
                gameStatus: 'finished',
                testFailed: true,
                failureReason: `Expert Mode: Failed due to errors in word "${incorrectWord}"`,
              });
              get().completeGame();
              return {};
            }
          }
        }

        // Update stats and check completion
        setTimeout(() => {
          get().updateStats();

          // Update word progress for words mode
          get().updateWordProgress();
          get().checkWordCompletion();

          // Update text window for time mode auto-scrolling
          get().updateTextWindow();

          // Check if test is complete (for non-words modes)
          if (
            testConfig.mode !== 'words' &&
            newInput.length >= textToType.length
          ) {
            get().completeGame();
          }
        }, 0);

        return { userInput: newInput, charStates: newCharStates };
      }

      return {};
    }),

  startGame: () => {
    const now = Date.now();
    set({
      gameStatus: 'running',
      stats: {
        ...get().stats,
        startTime: now,
      },
    });

    // Start timer for time mode
    get().startTimer();
  },

  pauseGame: () => {
    get().pauseTimer();
    set({
      gameStatus: 'paused',
    });
  },

  resumeGame: () => {
    set({
      gameStatus: 'running',
    });

    // Resume timer for time mode if it was running
    const { testConfig, timeRemaining } = get();
    if (testConfig.mode === 'time' && timeRemaining > 0) {
      get().startTimer();
    }
  },

  resetGame: () => {
    // Clear timer first
    get().resetTimer();

    const { textToType } = get();
    const newCharStates = textToType.split('').map((char, index) => ({
      char,
      status: index === 0 ? ('current' as const) : ('default' as const),
    }));

    set({
      userInput: '',
      gameStatus: 'ready',
      stats: defaultStats,
      charStates: newCharStates,
      // Reset word tracking
      wordsCompleted: 0,
      wordsProgress: 0,
      currentWordIndex: 0,
      // Reset failure tracking
      testFailed: false,
      failureReason: null,
    });
  },

  completeGame: async () => {
    // Clear timer immediately when game completes
    get().clearTimer();

    const now = Date.now();
    const state = get();
    const finalStats = {
      ...state.stats,
      endTime: now,
      elapsedTime: now - state.stats.startTime,
    };

    // Create test result
    const testResult: TestResult = {
      id: `test-${now}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: now,
      mode: state.testConfig.mode,
      duration:
        state.testConfig.mode === 'time'
          ? state.testConfig.duration
          : undefined,
      wordCount:
        state.testConfig.mode === 'words'
          ? state.testConfig.wordCount
          : undefined,
      textSource: state.testConfig.textSource,
      difficulty: state.testConfig.difficulty,
      punctuation: state.testConfig.punctuation,
      wpm: finalStats.wpm,
      accuracy: finalStats.accuracy,
      totalChars: finalStats.totalChars,
      correctChars: finalStats.correctChars,
      incorrectChars: finalStats.incorrectChars,
    };

    // Smart saving: check authentication status
    const { token } = useAuthStore.getState();

    if (token) {
      // User is authenticated - save to backend
      try {
        await saveSingleTest(testResult, token);
      } catch (error) {
        console.error('Failed to save test result to backend:', error);
        // Fallback to localStorage if backend fails
        saveTestResult(testResult);
      }
    } else {
      // User is anonymous - save to localStorage
      saveTestResult(testResult);
    }

    set({
      gameStatus: 'finished',
      stats: finalStats,
    });
  },

  updateStats: () =>
    set((state) => {
      const { userInput, textToType, stats } = state;
      const currentTime = Date.now();
      const elapsedTime = currentTime - stats.startTime;
      const elapsedMinutes = elapsedTime / 60000; // Convert to minutes

      const correctChars = userInput
        .split('')
        .filter((char, index) => char === textToType[index]).length;
      const incorrectChars = userInput.length - correctChars;
      const totalChars = userInput.length;

      // Calculate WPM (assuming 5 characters per word)
      const wordsTyped = correctChars / 5;
      const wpm =
        elapsedMinutes > 0 ? Math.round(wordsTyped / elapsedMinutes) : 0;

      // Calculate accuracy
      const accuracy =
        totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;

      return {
        stats: {
          ...stats,
          wpm,
          accuracy,
          totalChars,
          correctChars,
          incorrectChars,
          elapsedTime,
        },
      };
    }),

  // Timer Actions
  startTimer: () => {
    const { testConfig, timerId } = get();

    // Only start timer for time mode
    if (testConfig.mode !== 'time') return;

    // Clear any existing timer
    if (timerId) {
      clearInterval(timerId);
    }

    const duration = testConfig.duration * 1000; // convert to ms
    const startTime = Date.now();

    set({
      timeRemaining: duration,
      isTimerRunning: true,
      gameStartTime: startTime,
    });

    const newTimerId = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      const remaining = Math.max(0, duration - elapsed);

      set({ timeRemaining: remaining });

      if (remaining <= 0) {
        get().completeGame();
      }
    }, 100); // Update every 100ms for smooth display

    set({ timerId: newTimerId });
  },

  pauseTimer: () => {
    const { timerId } = get();

    if (timerId) {
      clearInterval(timerId);
      set({
        timerId: null,
        isTimerRunning: false,
      });
    }
  },

  resetTimer: () => {
    const { timerId, testConfig } = get();

    if (timerId) {
      clearInterval(timerId);
    }

    const duration =
      testConfig.mode === 'time' ? testConfig.duration * 1000 : 0;

    set({
      timerId: null,
      timeRemaining: duration,
      isTimerRunning: false,
      gameStartTime: null,
    });
  },

  updateTimer: () => {
    const { gameStartTime, testConfig } = get();

    if (!gameStartTime || testConfig.mode !== 'time') return;

    const now = Date.now();
    const elapsed = now - gameStartTime;
    const duration = testConfig.duration * 1000;
    const remaining = Math.max(0, duration - elapsed);

    set({ timeRemaining: remaining });

    if (remaining <= 0) {
      get().completeGame();
    }
  },

  clearTimer: () => {
    const { timerId } = get();

    if (timerId) {
      clearInterval(timerId);
      set({ timerId: null });
    }
  },

  // Word Tracking Actions
  calculateWordBoundaries: (text: string) => {
    const boundaries: number[] = [];
    let inWord = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const isWordChar = char !== ' ';

      if (isWordChar && !inWord) {
        // Start of a new word
        boundaries.push(i);
        inWord = true;
      } else if (!isWordChar && inWord) {
        // End of a word
        inWord = false;
      }
    }

    return boundaries;
  },

  updateWordProgress: () => {
    const { userInput, textToType, testConfig, wordBoundaries, charStates } =
      get();

    if (testConfig.mode !== 'words') return;

    // Count completed words more accurately
    let completedWords = 0;
    let currentIndex = 0;

    // Split text into words based on boundaries
    const words = [];
    for (let i = 0; i < wordBoundaries.length; i++) {
      const start = wordBoundaries[i];
      const end =
        i < wordBoundaries.length - 1
          ? wordBoundaries[i + 1]
          : textToType.length;

      // Find the actual end of the word (before spaces)
      let wordEnd = start;
      while (wordEnd < end && textToType[wordEnd] !== ' ') {
        wordEnd++;
      }

      words.push({
        start,
        end: wordEnd,
        text: textToType.slice(start, wordEnd),
      });
    }

    // Check each word for completion
    for (let i = 0; i < words.length && i < testConfig.wordCount; i++) {
      const word = words[i];

      // Check if we've typed up to the end of this word
      if (userInput.length > word.end) {
        // Check if all characters in the word are correct
        let wordCorrect = true;
        for (let j = word.start; j < word.end; j++) {
          if (charStates[j]?.status !== 'correct') {
            wordCorrect = false;
            break;
          }
        }

        if (wordCorrect) {
          completedWords++;
        }
        currentIndex = i + 1;
      } else if (userInput.length >= word.start) {
        // Currently typing this word
        currentIndex = i;
        break;
      }
    }

    const targetWords = testConfig.wordCount;
    const progress = Math.min(100, (completedWords / targetWords) * 100);

    set({
      wordsCompleted: completedWords,
      wordsProgress: progress,
      currentWordIndex: currentIndex,
      targetWordCount: targetWords,
    });
  },

  checkWordCompletion: () => {
    const { wordsCompleted, testConfig } = get();

    if (testConfig.mode !== 'words') return;

    // Check if we've completed the target number of words
    if (wordsCompleted >= testConfig.wordCount) {
      // Complete the game
      get().completeGame();
    }
  },

  // Text window and streaming functions
  generateTextInLines: (words: string[]): string[] => {
    const { maxCharsPerLine } = get();
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const potentialLine = currentLine ? `${currentLine} ${word}` : word;

      if (potentialLine.length <= maxCharsPerLine) {
        currentLine = potentialLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // Word is longer than max chars per line, split it
          lines.push(word);
          currentLine = '';
        }
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  },

  initializeTextWindow: (text: string) => {
    const { testConfig } = get();

    // For time mode, we use line-based scrolling
    if (testConfig.mode === 'time') {
      const words = text.split(' ');
      const lines = get().generateTextInLines(words);

      // Calculate character offsets for each line with precise space handling
      const lineCharOffsets: number[] = [];
      let offset = 0;

      for (let i = 0; i < lines.length; i++) {
        lineCharOffsets.push(offset);
        offset += lines[i].length;
        // Add space character between lines except for the last line
        if (i < lines.length - 1) {
          offset += 1; // Space between lines
        }
      }

      set({
        textWindow: {
          lines,
          scrollOffset: 0,
          lineCharOffsets,
        },
      });
    } else {
      // For words mode, use traditional approach
      set({
        textWindow: {
          ...defaultTextWindow,
          lines: [text],
        },
      });
    }
  },

  updateTextWindow: () => {
    const { testConfig } = get();

    if (testConfig.mode === 'time') {
      get().checkLineProgression();
    }
  },

  checkLineProgression: () => {
    const { userInput, textWindow, testConfig } = get();

    if (testConfig.mode !== 'time') return;

    const currentPosition = userInput.length;
    const { lineCharOffsets, scrollOffset, lines } = textWindow;

    // Find which line the current position is on
    let currentLineIndex = 0;
    for (let i = 0; i < lineCharOffsets.length; i++) {
      if (currentPosition >= lineCharOffsets[i]) {
        currentLineIndex = i;
      } else {
        break;
      }
    }

    // Calculate which line is currently the "second visible line"
    const secondLineIndex = scrollOffset + 1;

    // Trigger scroll when user reaches the second visible line
    // This keeps the user typing position in the middle line after scroll
    if (
      currentLineIndex >= secondLineIndex &&
      secondLineIndex < lines.length - 1
    ) {
      const newScrollOffset = scrollOffset + 1;

      // Only update if we actually need to scroll
      if (
        newScrollOffset !== scrollOffset &&
        newScrollOffset < lines.length - 2
      ) {
        set({
          textWindow: {
            ...textWindow,
            scrollOffset: newScrollOffset,
          },
        });
      }
    }

    // Check if we need more content (within last 20% of available text)
    const totalTextLength = lines.join(' ').length;
    if (currentPosition > totalTextLength * 0.8) {
      get().generateMoreContent();
    }
  },

  scrollToNextLine: () => {
    // This function is now simplified and handled by checkLineProgression
    // Keeping for backward compatibility but logic moved to checkLineProgression
  },

  generateMoreContent: async () => {
    const { testConfig, isContentStreaming } = get();

    if (testConfig.mode !== 'time' || isContentStreaming) return;

    set({ isContentStreaming: true });

    try {
      // Generate additional words
      const response = await getWords(testConfig.textSource, 50, true);

      if (response.words && response.words.length > 0) {
        get().appendDynamicContent(response.words);
      }
    } catch (error) {
      console.error('Failed to generate more content:', error);
      // Use fallback content
      const fallbackWords = [
        'the',
        'quick',
        'brown',
        'fox',
        'jumps',
        'over',
        'lazy',
        'dog',
        'pack',
        'my',
        'box',
        'with',
        'five',
        'dozen',
        'liquor',
        'jugs',
      ];
      get().appendDynamicContent(fallbackWords);
    } finally {
      set({ isContentStreaming: false });
    }
  },

  appendDynamicContent: (newWords: string[]) => {
    const { textToType, textWindow, charStates } = get();

    // Append new words to existing text
    const additionalText = ' ' + newWords.join(' ');
    const newTextToType = textToType + additionalText;

    // Generate new lines from all text
    const allWords = newTextToType.split(' ');
    const newLines = get().generateTextInLines(allWords);

    // Calculate new character offsets with precise space handling
    const lineCharOffsets: number[] = [];
    let offset = 0;

    for (let i = 0; i < newLines.length; i++) {
      lineCharOffsets.push(offset);
      offset += newLines[i].length;
      // Add space character between lines except for the last line
      if (i < newLines.length - 1) {
        offset += 1; // Space between lines
      }
    }

    // Update character states for new content
    const newCharStates = [...charStates];
    for (let i = charStates.length; i < newTextToType.length; i++) {
      newCharStates.push({
        char: newTextToType[i],
        status: 'default' as const,
      });
    }

    set({
      textToType: newTextToType,
      charStates: newCharStates,
      textWindow: {
        ...textWindow,
        lines: newLines,
        lineCharOffsets,
      },
    });
  },
}));
