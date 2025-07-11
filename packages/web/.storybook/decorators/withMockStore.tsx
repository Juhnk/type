import React from 'react';
import type { Decorator } from '@storybook/react';
import { useGameStore } from '../../src/store/useGameStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import { useModalStore } from '../../src/store/useModalStore';

// Default mock states for stores
const defaultGameState = {
  gameStatus: 'ready' as const,
  charStates: [],
  textToType: 'The quick brown fox jumps over the lazy dog',
  userInput: '',
  stats: {
    wpm: 0,
    rawWpm: 0,
    accuracy: 100,
    correctChars: 0,
    incorrectChars: 0,
    totalChars: 0,
    startTime: null,
    endTime: null,
    duration: 0,
  },
  testConfig: {
    mode: 'time' as const,
    duration: 60,
    wordCount: 50,
    difficulty: 'Normal' as const,
    textSource: 'english1k' as const,
    punctuation: false,
  },
  timeRemaining: 60000,
  wordsCompleted: 0,
  currentWordIndex: 0,
  wordBoundaries: [0, 4, 10, 16, 20, 26, 31, 35, 40],
};

const defaultAuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const defaultSettingsState = {
  settings: {
    appearance: {
      theme: 'slate',
      font: 'Roboto Mono',
      fontSize: 18,
      caretStyle: 'line' as const,
      caretColor: '#3b82f6',
      colorScheme: 'auto' as const,
      animations: true,
      smoothCaret: true,
      showWpmCounter: true,
      showAccuracyCounter: true,
    },
    behavior: {
      soundEffects: false,
      keyFeedback: false,
      defaultMode: 'time' as const,
      defaultDifficulty: 'Normal' as const,
      defaultDuration: 60,
      defaultWordCount: 50,
      paceCaretWpm: 0,
      paceCaretEnabled: false,
      autoSave: true,
      focusMode: false,
      quickRestart: true,
      blindMode: false,
    },
  },
  isLoading: false,
};

const defaultModalState = {
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
};

export const withMockStore: Decorator = (Story, context) => {
  // Reset stores to default state before each story
  React.useEffect(() => {
    // Apply any story-specific store overrides
    const gameOverrides = context.parameters?.mockStore?.game || {};
    const authOverrides = context.parameters?.mockStore?.auth || {};
    const settingsOverrides = context.parameters?.mockStore?.settings || {};
    const modalOverrides = context.parameters?.mockStore?.modal || {};

    useGameStore.setState({
      ...defaultGameState,
      ...gameOverrides,
    });

    useAuthStore.setState({
      ...defaultAuthState,
      ...authOverrides,
    });

    useSettingsStore.setState({
      ...defaultSettingsState,
      ...settingsOverrides,
    });

    useModalStore.setState({
      ...defaultModalState,
      ...modalOverrides,
    });
  }, [context.parameters?.mockStore]);

  return <Story />;
};
