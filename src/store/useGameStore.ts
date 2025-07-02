import { create } from 'zustand';

// Test Configuration Interface
interface TestConfig {
  duration: number; // Test duration in seconds
  difficulty: 'Normal' | 'Expert' | 'Master';
  textSource: 'random' | 'custom' | 'ai-generated';
  customText?: string;
}

// Character State Interface
interface CharState {
  char: string;
  status: 'untyped' | 'correct' | 'incorrect' | 'current';
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
type GameStatus = 'idle' | 'ready' | 'active' | 'paused' | 'completed';

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
  updateUserInput: (input: string) => void;
  startGame: () => void;
  pauseGame: () => void;
  resetGame: () => void;
  completeGame: () => void;
  updateStats: () => void;
  updateCharStates: () => void;
}

// Default values
const defaultTestConfig: TestConfig = {
  duration: 60,
  difficulty: 'Normal',
  textSource: 'random',
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

// Zustand Store
export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  testConfig: defaultTestConfig,
  textToType: '',
  charStates: [],
  userInput: '',
  gameStatus: 'idle',
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
        status: 'untyped' as const,
      })),
      userInput: '',
      gameStatus: 'ready',
    })),

  updateUserInput: (input: string) =>
    set(() => {
      get().updateCharStates();
      get().updateStats();
      return { userInput: input };
    }),

  startGame: () =>
    set(() => ({
      gameStatus: 'active',
      stats: {
        ...get().stats,
        startTime: Date.now(),
      },
    })),

  pauseGame: () =>
    set(() => ({
      gameStatus: 'paused',
    })),

  resetGame: () =>
    set(() => ({
      userInput: '',
      gameStatus: 'idle',
      stats: defaultStats,
      charStates: get()
        .textToType.split('')
        .map((char) => ({
          char,
          status: 'untyped' as const,
        })),
    })),

  completeGame: () =>
    set(() => {
      const now = Date.now();
      get().updateStats();
      return {
        gameStatus: 'completed',
        stats: {
          ...get().stats,
          endTime: now,
          elapsedTime: now - get().stats.startTime,
        },
      };
    }),

  updateCharStates: () =>
    set((state) => {
      const { userInput, textToType } = state;
      const newCharStates = textToType.split('').map((char, index) => {
        if (index < userInput.length) {
          const userChar = userInput[index];
          return {
            char,
            status:
              userChar === char ? ('correct' as const) : ('incorrect' as const),
            timestamp: Date.now(),
          };
        } else if (index === userInput.length) {
          return {
            char,
            status: 'current' as const,
          };
        } else {
          return {
            char,
            status: 'untyped' as const,
          };
        }
      });

      return { charStates: newCharStates };
    }),

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

      // Check if test is complete
      if (userInput.length >= textToType.length) {
        get().completeGame();
      }

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
