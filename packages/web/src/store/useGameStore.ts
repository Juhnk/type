import { create } from 'zustand';
import { saveTestResult, type TestResult } from '@/lib/history';
import { saveSingleTest } from '@/lib/api-client';
import { useAuthStore } from './useAuthStore';

// Test Configuration Interface
interface TestConfig {
  mode: 'time' | 'words' | 'quote'; // Test mode
  duration: number; // Test duration in seconds
  wordCount: 10 | 25 | 50 | 100; // Word count for words mode
  difficulty: 'Normal' | 'Expert' | 'Master';
  textSource: 'english-1k' | 'javascript' | 'python';
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
type GameStatus = 'idle' | 'ready' | 'running' | 'finished';

// Main Store Interface
interface GameState {
  // Core typing data
  testConfig: TestConfig;
  textToType: string;
  charStates: CharState[];
  userInput: string;
  gameStatus: GameStatus;
  stats: GameStats;

  // Actions
  setTestConfig: (config: Partial<TestConfig>) => void;
  setTextToType: (text: string) => void;
  handleKeyPress: (key: string) => void;
  startGame: () => void;
  pauseGame: () => void;
  resetGame: () => void;
  completeGame: () => void;
  updateStats: () => void;
}

// Default values
const defaultTestConfig: TestConfig = {
  mode: 'time',
  duration: 60,
  wordCount: 50,
  difficulty: 'Normal',
  textSource: 'english-1k',
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

  // Actions
  setTestConfig: (config: Partial<TestConfig>) =>
    set((state) => ({
      testConfig: { ...state.testConfig, ...config },
    })),

  setTextToType: (text: string) =>
    set(() => ({
      textToType: text,
      charStates: text.split('').map((char) => ({
        char,
        status: 'default' as const,
      })),
      userInput: '',
      gameStatus: 'ready',
    })),

  handleKeyPress: (key: string) =>
    set((state) => {
      const { gameStatus, userInput, textToType, testConfig } = state;

      // Start game if ready
      if (gameStatus === 'ready') {
        set({
          gameStatus: 'running',
          stats: { ...state.stats, startTime: Date.now() },
        });
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
        return { userInput: newInput, charStates: newCharStates };
      }

      // Handle character input
      if (key.length === 1 && userInput.length < textToType.length) {
        const index = userInput.length;
        const expectedChar = textToType[index];
        const isCorrect = key === expectedChar;

        // Check difficulty modes
        if (testConfig.difficulty === 'Master' && !isCorrect) {
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

        // Update stats and check completion
        setTimeout(() => {
          get().updateStats();

          // Check if test is complete
          if (newInput.length >= textToType.length) {
            get().completeGame();
          }
        }, 0);

        return { userInput: newInput, charStates: newCharStates };
      }

      return {};
    }),

  startGame: () =>
    set(() => ({
      gameStatus: 'running',
      stats: {
        ...get().stats,
        startTime: Date.now(),
      },
    })),

  pauseGame: () =>
    set(() => ({
      gameStatus: 'ready',
    })),

  resetGame: () =>
    set(() => {
      const { textToType } = get();
      const newCharStates = textToType.split('').map((char, index) => ({
        char,
        status: index === 0 ? ('current' as const) : ('default' as const),
      }));

      return {
        userInput: '',
        gameStatus: 'ready',
        stats: defaultStats,
        charStates: newCharStates,
      };
    }),

  completeGame: async () => {
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
}));
