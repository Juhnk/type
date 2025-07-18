import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from './useAuthStore';

interface BotOpponent {
  name: string;
  targetWpm: number;
  actualWpm: number; // Real WPM based on actual performance
  accuracy: number;
  currentPosition: number;
  targetPosition: number; // Where the bot is trying to reach
  typingBuffer: string; // Characters typed so far
  mistakePosition: number; // Position where last mistake was made (-1 if none)
  isBackspacing: boolean; // Currently deleting characters
  wordsCompleted: number;
  totalWordsTyped: number;
  correctWords: number;
  incorrectWords: number;
  isTyping: boolean;
  lastTypingTime: number;
  nextCharTime: number; // When to type next character
  trophies: number; // Bot's trophy count for ELO calculation
}

interface CompetitiveState {
  // User trophies
  trophies: number;

  // Match state
  matchStatus: 'idle' | 'searching' | 'countdown' | 'racing' | 'finished';
  countdownValue: number;
  opponent: BotOpponent | null;
  matchStartTime: number;

  // Match results
  userFinishTime: number | null;
  opponentFinishTime: number | null;
  lastMatchWon: boolean | null;
  trophyChange: number;
  userScore: number;
  opponentScore: number;

  // Actions
  startMatch: () => void;
  setCountdown: (value: number) => void;
  startRacing: () => void;
  updateOpponentPosition: (position: number) => void;
  updateOpponentWords: (
    wordsCompleted: number,
    totalWords: number,
    correctWords: number
  ) => void;
  finishMatch: (
    userTime: number,
    userWpm: number,
    userAccuracy: number,
    userTotalWords: number,
    userCorrectWords: number
  ) => void;
  opponentFinishMatch: (userStats: {
    wpm: number;
    accuracy: number;
    totalWords: number;
    correctWords: number;
    elapsedTime: number;
  }) => void;
  resetMatch: () => void;
  addTrophies: (amount: number) => void;
  setTrophies: (amount: number) => void; // Dev tool for testing
  validateAndSyncTrophies: () => Promise<void>; // Trophy validation and sync
}

const BOT_NAMES = [
  'TypeBot Alex',
  'SpeedRunner Sam',
  'Quick Quinn',
  'Rapid Riley',
  'Swift Sarah',
  'Lightning Luke',
  'Dash Diana',
  'Turbo Taylor',
  'Flash Felix',
  'Rocket Robin',
];

// ELO-style trophy calculation
function calculateTrophyChange(
  playerTrophies: number,
  opponentTrophies: number,
  playerWon: boolean
): number {
  // Expected score based on ELO formula
  const expectedScore =
    1 / (1 + Math.pow(10, (opponentTrophies - playerTrophies) / 400));

  // Actual score (1 for win, 0 for loss)
  const actualScore = playerWon ? 1 : 0;

  // Dynamic K-factor based on player's current trophies
  let kFactor: number;
  if (playerTrophies < 100) kFactor = 40;
  else if (playerTrophies < 300) kFactor = 30;
  else if (playerTrophies < 500) kFactor = 20;
  else if (playerTrophies < 700) kFactor = 15;
  else kFactor = 10;

  // Loss protection for new players (0-100 trophies)
  if (!playerWon && playerTrophies < 100) {
    kFactor *= 0.5; // Lose only half as much
  }

  // Trophy change calculation
  const trophyChange = Math.round(kFactor * (actualScore - expectedScore));

  // Ensure minimum gain of 1 for wins, maximum loss based on trophies
  if (playerWon && trophyChange < 1) return 1;
  if (!playerWon && playerTrophies < 50) return Math.max(trophyChange, -5); // New player protection

  return trophyChange;
}

// Generate bot WPM based on trophy level
function generateBotWpmFromTrophies(trophies: number): number {
  // Map trophy ranges to WPM with some variation - adjusted for more realistic ranges
  if (trophies < 50) return 5 + Math.random() * 5; // 5-10 WPM (absolute beginners)
  if (trophies < 100) return 10 + Math.random() * 10; // 10-20 WPM (beginners)
  if (trophies < 200) return 20 + Math.random() * 10; // 20-30 WPM
  if (trophies < 300) return 30 + Math.random() * 10; // 30-40 WPM
  if (trophies < 400) return 40 + Math.random() * 10; // 40-50 WPM
  if (trophies < 500) return 50 + Math.random() * 10; // 50-60 WPM
  if (trophies < 600) return 55 + Math.random() * 10; // 55-65 WPM (500 trophies = ~60 WPM average)
  if (trophies < 700) return 65 + Math.random() * 10; // 65-75 WPM
  if (trophies < 800) return 75 + Math.random() * 10; // 75-85 WPM
  if (trophies < 900) return 85 + Math.random() * 15; // 85-100 WPM
  if (trophies < 1000) return 100 + Math.random() * 20; // 100-120 WPM
  return 120 + Math.random() * 20; // 120-140 WPM for masters (1000+)
}

const createBotOpponent = (
  userRecentWpm: number = 40,
  userTrophies: number = 0
): BotOpponent => {
  // Generate bot trophies within a similar range to the user (±100 trophies)
  const trophyVariation = Math.floor((Math.random() - 0.5) * 200); // -100 to +100
  const botTrophies = Math.max(0, userTrophies + trophyVariation);

  // Generate bot WPM based on their trophy level
  const targetWpm = generateBotWpmFromTrophies(botTrophies);

  // Add some slight variation to accuracy based on trophy level
  const baseAccuracy = 90 + (botTrophies / 1000) * 8; // Higher trophies = better accuracy
  const accuracy = Math.min(98, baseAccuracy + Math.random() * 2 - 1); // ±1% variation

  return {
    name: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)],
    targetWpm: Math.round(targetWpm),
    actualWpm: 0,
    accuracy,
    currentPosition: 0,
    targetPosition: 0,
    typingBuffer: '',
    mistakePosition: -1,
    isBackspacing: false,
    wordsCompleted: 0,
    totalWordsTyped: 0,
    correctWords: 0,
    incorrectWords: 0,
    isTyping: false,
    lastTypingTime: 0,
    nextCharTime: 0,
    trophies: botTrophies,
  };
};

export const useCompetitiveStore = create<CompetitiveState>()(
  persist(
    (set, get) => ({
      // Initial state
      trophies: 0, // Starting trophies (new players start at 0)
      matchStatus: 'idle',
      countdownValue: 3,
      opponent: null,
      matchStartTime: 0,
      userFinishTime: null,
      opponentFinishTime: null,
      lastMatchWon: null,
      trophyChange: 0,
      userScore: 0,
      opponentScore: 0,

      // Actions
      startMatch: () => {
        const { trophies } = get();
        const opponent = createBotOpponent(40, trophies); // Pass user's trophies for better matchmaking
        set({
          matchStatus: 'searching',
          opponent,
          userFinishTime: null,
          opponentFinishTime: null,
          lastMatchWon: null,
          trophyChange: 0,
        });

        // Simulate finding opponent
        setTimeout(() => {
          set({ matchStatus: 'countdown', countdownValue: 3 });
        }, 2000);
      },

      setCountdown: (value: number) => {
        set({ countdownValue: value });
        if (value === 0) {
          set({
            matchStatus: 'racing',
            matchStartTime: Date.now(),
          });
        }
      },

      startRacing: () => {
        set({
          matchStatus: 'racing',
          matchStartTime: Date.now(),
        });
      },

      updateOpponentPosition: (position: number) => {
        const { opponent } = get();
        if (opponent) {
          set({
            opponent: {
              ...opponent,
              currentPosition: position,
              isTyping: true,
              lastTypingTime: Date.now(),
            },
          });
        }
      },

      updateOpponentWords: (
        wordsCompleted: number,
        totalWords: number,
        correctWords: number
      ) => {
        const { opponent } = get();
        if (opponent) {
          set({
            opponent: {
              ...opponent,
              wordsCompleted,
              totalWordsTyped: totalWords,
              correctWords,
              incorrectWords: totalWords - correctWords,
            },
          });
        }
      },

      finishMatch: (
        userTime: number,
        userWpm: number,
        userAccuracy: number,
        userTotalWords: number,
        userCorrectWords: number
      ) => {
        const { opponent, trophies } = get();
        if (!opponent) return;

        // Calculate user score: (Total Words × WPM × Accuracy) / 100
        const userScore = (userTotalWords * userWpm * userAccuracy) / 100;

        // Calculate opponent score using their actual WPM
        const opponentWpm = opponent.actualWpm || opponent.targetWpm; // Fallback to targetWpm if actualWpm not set
        const opponentScore =
          (opponent.totalWordsTyped * opponentWpm * opponent.accuracy) / 100;

        // Determine winner based on score
        const userWon = userScore > opponentScore;

        // Use ELO calculation for trophy change
        const trophyChange = calculateTrophyChange(
          trophies,
          opponent.trophies,
          userWon
        );
        const newTrophies = Math.max(0, trophies + trophyChange);

        set({
          matchStatus: 'finished',
          userFinishTime: userTime,
          opponentFinishTime: userTime, // Both finish at same time
          lastMatchWon: userWon,
          trophyChange,
          trophies: newTrophies,
          userScore,
          opponentScore,
        });

        // Sync trophies after match
        get().addTrophies(0); // This will trigger sync without changing the value
      },

      opponentFinishMatch: (userStats: {
        wpm: number;
        accuracy: number;
        totalWords: number;
        correctWords: number;
        elapsedTime: number;
      }) => {
        const { opponent, trophies, matchStartTime } = get();
        if (!opponent) return;

        // Opponent finished first (reached 50 words)
        const opponentFinishTime = Date.now() - matchStartTime;

        // Calculate scores
        const userScore =
          (userStats.totalWords * userStats.wpm * userStats.accuracy) / 100;
        const opponentWpm = opponent.actualWpm || opponent.targetWpm; // Use actual WPM
        const opponentScore = (50 * opponentWpm * opponent.accuracy) / 100; // Opponent completed all 50 words

        // Determine winner based on score, not who finished first
        const userWon = userScore > opponentScore;

        // Use ELO calculation for trophy change
        const trophyChange = calculateTrophyChange(
          trophies,
          opponent.trophies,
          userWon
        );
        const newTrophies = Math.max(0, trophies + trophyChange);

        set({
          matchStatus: 'finished',
          userFinishTime: null, // User didn't finish
          opponentFinishTime: opponentFinishTime,
          lastMatchWon: userWon,
          trophyChange,
          trophies: newTrophies,
          userScore,
          opponentScore,
        });

        // Sync trophies after match
        get().addTrophies(0); // This will trigger sync without changing the value
      },

      resetMatch: () => {
        set({
          matchStatus: 'idle',
          countdownValue: 3,
          opponent: null,
          matchStartTime: 0,
          userFinishTime: null,
          opponentFinishTime: null,
          lastMatchWon: null,
          trophyChange: 0,
          userScore: 0,
          opponentScore: 0,
        });
      },

      addTrophies: async (amount: number) => {
        const { trophies } = get();
        const newTrophies = Math.max(0, trophies + amount);
        set({ trophies: newTrophies });

        // Sync with server if user is authenticated
        const authState = useAuthStore.getState();
        if (!authState?.token) {
          console.log('[Trophy Sync] No auth token, skipping sync');
          return;
        }

        // Retry logic for failed syncs
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
          try {
            console.log(
              `[Trophy Sync] Attempt ${retryCount + 1}: Syncing trophies to server:`,
              newTrophies
            );
            await apiClient.patch(
              '/api/me/trophies',
              { trophies: newTrophies },
              authState.token
            );
            console.log('[Trophy Sync] Successfully synced trophies');
            return; // Success, exit retry loop
          } catch (error) {
            retryCount++;
            console.error(`[Trophy Sync] Attempt ${retryCount} failed:`, error);

            if (retryCount < maxRetries) {
              // Wait before retrying (exponential backoff)
              const delay = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
              console.log(`[Trophy Sync] Retrying in ${delay}ms...`);
              await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
              console.error(
                '[Trophy Sync] All retry attempts failed. Trophy sync will be attempted on next app load.'
              );
            }
          }
        }
      },

      setTrophies: async (amount: number) => {
        // Dev tool to directly set trophy count
        const newTrophies = Math.max(0, amount);
        set({ trophies: newTrophies });

        // Sync with server if user is authenticated
        const authState = useAuthStore.getState();
        if (!authState?.token) {
          console.log('[Trophy Dev] No auth token, skipping sync');
          return;
        }

        // Retry logic for failed syncs
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
          try {
            console.log(
              `[Trophy Dev] Attempt ${retryCount + 1}: Setting trophies to:`,
              newTrophies
            );
            await apiClient.patch(
              '/api/me/trophies',
              { trophies: newTrophies },
              authState.token
            );
            console.log('[Trophy Dev] Successfully set trophies');
            return; // Success, exit retry loop
          } catch (error) {
            retryCount++;
            console.error(`[Trophy Dev] Attempt ${retryCount} failed:`, error);

            if (retryCount < maxRetries) {
              // Wait before retrying (exponential backoff)
              const delay = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
              console.log(`[Trophy Dev] Retrying in ${delay}ms...`);
              await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
              console.error('[Trophy Dev] All retry attempts failed.');
            }
          }
        }
      },

      validateAndSyncTrophies: async () => {
        const authState = useAuthStore.getState();
        if (!authState?.token) {
          console.log('[Trophy Validation] No auth token, skipping validation');
          return;
        }

        try {
          console.log('[Trophy Validation] Fetching server trophy count...');
          // Fetch current user data from server to get server trophy count
          const userData = await apiClient.get('/api/me', authState.token);
          const serverTrophies = userData.trophies || 0;
          const localTrophies = get().trophies;

          console.log(
            '[Trophy Validation] Local trophies:',
            localTrophies,
            'Server trophies:',
            serverTrophies
          );

          if (localTrophies !== serverTrophies) {
            console.log(
              '[Trophy Validation] Trophy mismatch detected! Resolving in favor of server...'
            );
            // Resolve conflict in favor of server data (source of truth)
            set({ trophies: serverTrophies });
            console.log(
              '[Trophy Validation] Trophies synchronized to server value:',
              serverTrophies
            );
          } else {
            console.log(
              '[Trophy Validation] Trophy counts match, no sync needed'
            );
          }
        } catch (error) {
          console.error(
            '[Trophy Validation] Failed to validate trophies:',
            error
          );
          // Don't change local state if validation fails
        }
      },
    }),
    {
      name: 'competitive-storage',
      partialize: (state) => ({
        trophies: state.trophies,
      }),
    }
  )
);
