import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppearanceSettings {
  theme: string;
  font: string;
  fontSize: number;
  caretStyle: 'line' | 'block' | 'underline';
  caretColor: string;
  colorScheme: 'light' | 'dark' | 'auto';
  animations: boolean;
  smoothCaret: boolean;
  showWpmCounter: boolean;
  showAccuracyCounter: boolean;
}

export interface BehaviorSettings {
  soundEffects: boolean;
  keyFeedback: boolean;
  defaultMode: 'time' | 'words' | 'quote';
  defaultDifficulty: 'Normal' | 'Expert' | 'Master';
  defaultDuration: number;
  defaultWordCount: number;
  paceCaretWpm: number;
  paceCaretEnabled: boolean;
  autoSave: boolean;
  focusMode: boolean;
  quickRestart: boolean;
  blindMode: boolean;
}

export interface Settings {
  appearance: AppearanceSettings;
  behavior: BehaviorSettings;
}

const defaultSettings: Settings = {
  appearance: {
    theme: 'slate',
    font: 'Roboto Mono',
    fontSize: 18,
    caretStyle: 'line',
    caretColor: '#3b82f6',
    colorScheme: 'auto',
    animations: true,
    smoothCaret: true,
    showWpmCounter: true,
    showAccuracyCounter: true,
  },
  behavior: {
    soundEffects: false,
    keyFeedback: false,
    defaultMode: 'time',
    defaultDifficulty: 'Normal',
    defaultDuration: 60,
    defaultWordCount: 50,
    paceCaretWpm: 0,
    paceCaretEnabled: false,
    autoSave: true,
    focusMode: false,
    quickRestart: true,
    blindMode: false,
  },
};

interface SettingsStore {
  settings: Settings;
  isLoading: boolean;

  // Appearance actions
  updateTheme: (theme: string) => void;
  updateFont: (font: string) => void;
  updateFontSize: (size: number) => void;
  updateCaretStyle: (style: 'line' | 'block' | 'underline') => void;
  updateCaretColor: (color: string) => void;
  updateColorScheme: (scheme: 'light' | 'dark' | 'auto') => void;
  toggleAnimations: () => void;
  toggleSmoothCaret: () => void;
  toggleWpmCounter: () => void;
  toggleAccuracyCounter: () => void;

  // Behavior actions
  toggleSoundEffects: () => void;
  toggleKeyFeedback: () => void;
  updateDefaultMode: (mode: 'time' | 'words' | 'quote') => void;
  updateDefaultDifficulty: (difficulty: 'Normal' | 'Expert' | 'Master') => void;
  updateDefaultDuration: (duration: number) => void;
  updateDefaultWordCount: (count: number) => void;
  updatePaceCaretWpm: (wpm: number) => void;
  togglePaceCaret: () => void;
  toggleAutoSave: () => void;
  toggleFocusMode: () => void;
  toggleQuickRestart: () => void;
  toggleBlindMode: () => void;

  // Bulk actions
  updateAppearanceSettings: (settings: Partial<AppearanceSettings>) => void;
  updateBehaviorSettings: (settings: Partial<BehaviorSettings>) => void;
  resetToDefaults: () => void;
  importSettings: (settings: Settings) => void;
  exportSettings: () => Settings;

  // Persistence
  saveToServer: () => Promise<void>;
  loadFromServer: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      isLoading: false,

      // Appearance actions
      updateTheme: (theme) =>
        set((state) => ({
          settings: {
            ...state.settings,
            appearance: { ...state.settings.appearance, theme },
          },
        })),

      updateFont: (font) =>
        set((state) => ({
          settings: {
            ...state.settings,
            appearance: { ...state.settings.appearance, font },
          },
        })),

      updateFontSize: (fontSize) =>
        set((state) => ({
          settings: {
            ...state.settings,
            appearance: { ...state.settings.appearance, fontSize },
          },
        })),

      updateCaretStyle: (caretStyle) =>
        set((state) => ({
          settings: {
            ...state.settings,
            appearance: { ...state.settings.appearance, caretStyle },
          },
        })),

      updateCaretColor: (caretColor) =>
        set((state) => ({
          settings: {
            ...state.settings,
            appearance: { ...state.settings.appearance, caretColor },
          },
        })),

      updateColorScheme: (colorScheme) =>
        set((state) => ({
          settings: {
            ...state.settings,
            appearance: { ...state.settings.appearance, colorScheme },
          },
        })),

      toggleAnimations: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            appearance: {
              ...state.settings.appearance,
              animations: !state.settings.appearance.animations,
            },
          },
        })),

      toggleSmoothCaret: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            appearance: {
              ...state.settings.appearance,
              smoothCaret: !state.settings.appearance.smoothCaret,
            },
          },
        })),

      toggleWpmCounter: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            appearance: {
              ...state.settings.appearance,
              showWpmCounter: !state.settings.appearance.showWpmCounter,
            },
          },
        })),

      toggleAccuracyCounter: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            appearance: {
              ...state.settings.appearance,
              showAccuracyCounter:
                !state.settings.appearance.showAccuracyCounter,
            },
          },
        })),

      // Behavior actions
      toggleSoundEffects: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            behavior: {
              ...state.settings.behavior,
              soundEffects: !state.settings.behavior.soundEffects,
            },
          },
        })),

      toggleKeyFeedback: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            behavior: {
              ...state.settings.behavior,
              keyFeedback: !state.settings.behavior.keyFeedback,
            },
          },
        })),

      updateDefaultMode: (defaultMode) =>
        set((state) => ({
          settings: {
            ...state.settings,
            behavior: { ...state.settings.behavior, defaultMode },
          },
        })),

      updateDefaultDifficulty: (defaultDifficulty) =>
        set((state) => ({
          settings: {
            ...state.settings,
            behavior: { ...state.settings.behavior, defaultDifficulty },
          },
        })),

      updateDefaultDuration: (defaultDuration) =>
        set((state) => ({
          settings: {
            ...state.settings,
            behavior: { ...state.settings.behavior, defaultDuration },
          },
        })),

      updateDefaultWordCount: (defaultWordCount) =>
        set((state) => ({
          settings: {
            ...state.settings,
            behavior: { ...state.settings.behavior, defaultWordCount },
          },
        })),

      updatePaceCaretWpm: (paceCaretWpm) =>
        set((state) => ({
          settings: {
            ...state.settings,
            behavior: { ...state.settings.behavior, paceCaretWpm },
          },
        })),

      togglePaceCaret: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            behavior: {
              ...state.settings.behavior,
              paceCaretEnabled: !state.settings.behavior.paceCaretEnabled,
            },
          },
        })),

      toggleAutoSave: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            behavior: {
              ...state.settings.behavior,
              autoSave: !state.settings.behavior.autoSave,
            },
          },
        })),

      toggleFocusMode: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            behavior: {
              ...state.settings.behavior,
              focusMode: !state.settings.behavior.focusMode,
            },
          },
        })),

      toggleQuickRestart: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            behavior: {
              ...state.settings.behavior,
              quickRestart: !state.settings.behavior.quickRestart,
            },
          },
        })),

      toggleBlindMode: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            behavior: {
              ...state.settings.behavior,
              blindMode: !state.settings.behavior.blindMode,
            },
          },
        })),

      // Bulk actions
      updateAppearanceSettings: (appearance) =>
        set((state) => ({
          settings: {
            ...state.settings,
            appearance: { ...state.settings.appearance, ...appearance },
          },
        })),

      updateBehaviorSettings: (behavior) =>
        set((state) => ({
          settings: {
            ...state.settings,
            behavior: { ...state.settings.behavior, ...behavior },
          },
        })),

      resetToDefaults: () => set({ settings: defaultSettings }),

      importSettings: (settings) => set({ settings }),

      exportSettings: () => get().settings,

      // Server persistence
      saveToServer: async () => {
        try {
          set({ isLoading: true });
          const { settings } = get();
          const token = localStorage.getItem('token');

          if (!token) {
            throw new Error('No authentication token found');
          }

          // Import API client dynamically to avoid circular dependencies
          const { updateSettings } = await import('@/lib/api-client');

          // Map settings to API format
          const apiSettings = {
            // Appearance settings
            theme: settings.appearance.theme,
            font: settings.appearance.font,
            fontSize: settings.appearance.fontSize,
            caretStyle: settings.appearance.caretStyle,
            caretColor: settings.appearance.caretColor,
            colorScheme: settings.appearance.colorScheme,
            animations: settings.appearance.animations,
            smoothCaret: settings.appearance.smoothCaret,
            showWpmCounter: settings.appearance.showWpmCounter,
            showAccuracyCounter: settings.appearance.showAccuracyCounter,
            // Behavior settings
            soundEffects: settings.behavior.soundEffects,
            keyFeedback: settings.behavior.keyFeedback,
            defaultMode: settings.behavior.defaultMode,
            defaultDifficulty: settings.behavior.defaultDifficulty,
            defaultDuration: settings.behavior.defaultDuration,
            defaultWordCount: settings.behavior.defaultWordCount,
            paceCaretWpm: settings.behavior.paceCaretWpm,
            paceCaretEnabled: settings.behavior.paceCaretEnabled,
            autoSave: settings.behavior.autoSave,
            focusMode: settings.behavior.focusMode,
            quickRestart: settings.behavior.quickRestart,
            blindMode: settings.behavior.blindMode,
          };

          await updateSettings(apiSettings, token);
        } catch (error) {
          console.error('Failed to save settings to server:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      loadFromServer: async () => {
        try {
          set({ isLoading: true });
          const token = localStorage.getItem('token');

          if (!token) {
            throw new Error('No authentication token found');
          }

          // Import API client dynamically to avoid circular dependencies
          const { getSettings } = await import('@/lib/api-client');

          const serverSettings = await getSettings(token);

          // Map server settings to local format
          set((state) => ({
            settings: {
              appearance: {
                ...state.settings.appearance,
                theme: serverSettings.theme || state.settings.appearance.theme,
                font: serverSettings.font || state.settings.appearance.font,
                fontSize:
                  serverSettings.fontSize || state.settings.appearance.fontSize,
                caretStyle:
                  (serverSettings.caretStyle as
                    | 'line'
                    | 'block'
                    | 'underline') || state.settings.appearance.caretStyle,
                caretColor:
                  serverSettings.caretColor ||
                  state.settings.appearance.caretColor,
                colorScheme:
                  (serverSettings.colorScheme as 'light' | 'dark' | 'auto') ||
                  state.settings.appearance.colorScheme,
                animations:
                  serverSettings.animations ??
                  state.settings.appearance.animations,
                smoothCaret:
                  serverSettings.smoothCaret ??
                  state.settings.appearance.smoothCaret,
                showWpmCounter:
                  serverSettings.showWpmCounter ??
                  state.settings.appearance.showWpmCounter,
                showAccuracyCounter:
                  serverSettings.showAccuracyCounter ??
                  state.settings.appearance.showAccuracyCounter,
              },
              behavior: {
                ...state.settings.behavior,
                soundEffects:
                  serverSettings.soundEffects ??
                  state.settings.behavior.soundEffects,
                keyFeedback:
                  serverSettings.keyFeedback ??
                  state.settings.behavior.keyFeedback,
                defaultMode:
                  (serverSettings.defaultMode as 'time' | 'words' | 'quote') ||
                  state.settings.behavior.defaultMode,
                defaultDifficulty:
                  (serverSettings.defaultDifficulty as
                    | 'Normal'
                    | 'Expert'
                    | 'Master') || state.settings.behavior.defaultDifficulty,
                defaultDuration:
                  serverSettings.defaultDuration ||
                  state.settings.behavior.defaultDuration,
                defaultWordCount:
                  serverSettings.defaultWordCount ||
                  state.settings.behavior.defaultWordCount,
                paceCaretWpm:
                  serverSettings.paceCaretWpm ||
                  state.settings.behavior.paceCaretWpm,
                paceCaretEnabled:
                  serverSettings.paceCaretEnabled ??
                  state.settings.behavior.paceCaretEnabled,
                autoSave:
                  serverSettings.autoSave ?? state.settings.behavior.autoSave,
                focusMode:
                  serverSettings.focusMode ?? state.settings.behavior.focusMode,
                quickRestart:
                  serverSettings.quickRestart ??
                  state.settings.behavior.quickRestart,
                blindMode:
                  serverSettings.blindMode ?? state.settings.behavior.blindMode,
              },
            },
          }));
        } catch (error) {
          console.error('Failed to load settings from server:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'typeamp-settings',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);

// Helper hook for theme
export const useTheme = () => {
  const { theme, colorScheme } = useSettingsStore(
    (state) => state.settings.appearance
  );

  // Determine actual theme based on color scheme preference
  const actualTheme =
    colorScheme === 'auto'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : colorScheme;

  return { theme, colorScheme: actualTheme };
};
