'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { useGameStore } from '@/store/useGameStore';
import {
  Check,
  Clock,
  Hash,
  Zap,
  BookOpen,
  ToggleLeft,
  AlertCircle,
  RefreshCw,
  Loader2,
  FileText,
  Code,
  Timer,
  Settings,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CommandConfig {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  action: () => void;
  isActive?: boolean;
  description?: string;
}

export function EnhancedCommandPalette() {
  const [open, setOpen] = useState(false);
  const [isChangingConfig, setIsChangingConfig] = useState(false);
  const [search, setSearch] = useState('');

  // Zustand store state and actions
  const {
    setTestConfig,
    resetGame,
    gameStatus,
    isPreparingGame,
    testConfig: {
      mode: currentMode,
      duration: currentDuration,
      wordCount: currentWordCount,
      difficulty: currentDifficulty,
      textSource: currentTextSource,
      punctuation: currentPunctuation,
    },
  } = useGameStore();

  // Recent configurations (stored in localStorage)
  const [recentConfigs, setRecentConfigs] = useState<
    Array<{
      label: string;
      config: Record<string, unknown>;
      timestamp: number;
    }>
  >([]);

  useEffect(() => {
    // Load recent configurations from localStorage
    const stored = localStorage.getItem('typeamp-recent-configs');
    if (stored) {
      setRecentConfigs(JSON.parse(stored));
    }
  }, []);

  // Future enhancement: save recent configurations
  // const saveRecentConfig = useCallback((label: string, config: Record<string, unknown>) => {
  //   const newRecent = {
  //     label,
  //     config,
  //     timestamp: Date.now(),
  //   };
  //   const updated = [newRecent, ...recentConfigs.filter(r => r.label !== label)].slice(0, 5);
  //   setRecentConfigs(updated);
  //   localStorage.setItem('typeamp-recent-configs', JSON.stringify(updated));
  // }, [recentConfigs]);

  const handleCommand = useCallback(
    async (callback: () => void, showToast = true, toastMessage?: string) => {
      // Check if game is running and warn user
      if (gameStatus === 'running') {
        const confirmed = window.confirm(
          'Changing settings will reset your current game. Continue?'
        );
        if (!confirmed) {
          return;
        }
      }

      setIsChangingConfig(true);
      setOpen(false);

      // Execute the configuration change
      callback();

      // Show toast notification
      if (showToast) {
        toast.success(toastMessage || 'Configuration updated', {
          description: 'New game prepared with updated settings',
          duration: 2000,
        });
      }

      // Reset loading state after animation
      setTimeout(() => {
        setIsChangingConfig(false);
      }, 300);
    },
    [gameStatus]
  );

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to open
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((open) => !open);
      }

      // If command palette is open
      if (open) {
        // Escape to close
        if (e.key === 'Escape') {
          e.preventDefault();
          setOpen(false);
          return;
        }

        // Number shortcuts for time mode
        if (currentMode === 'time' && !e.ctrlKey && !e.metaKey && !e.altKey) {
          const durationMap: Record<string, number> = {
            '1': 15,
            '2': 30,
            '3': 60,
            '4': 120,
          };

          if (durationMap[e.key]) {
            e.preventDefault();
            handleCommand(() =>
              setTestConfig({ duration: durationMap[e.key] })
            );
          }
        }

        // Letter shortcuts
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          switch (e.key.toLowerCase()) {
            case 't':
              if (search === '') {
                e.preventDefault();
                handleCommand(() => setTestConfig({ mode: 'time' }));
              }
              break;
            case 'w':
              if (search === '') {
                e.preventDefault();
                handleCommand(() => setTestConfig({ mode: 'words' }));
              }
              break;
            case 'q':
              if (search === '') {
                e.preventDefault();
                handleCommand(() => setTestConfig({ mode: 'quote' }));
              }
              break;
            case 'r':
              if (search === '') {
                e.preventDefault();
                handleCommand(() => resetGame(), false);
              }
              break;
            case 'p':
              if (search === '') {
                e.preventDefault();
                handleCommand(() =>
                  setTestConfig({ punctuation: !currentPunctuation })
                );
              }
              break;
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    open,
    currentMode,
    currentPunctuation,
    search,
    handleCommand,
    resetGame,
    setTestConfig,
  ]);

  // Command configurations
  const commands = useMemo(() => {
    const modeCommands: CommandConfig[] = [
      {
        id: 'mode-time',
        label: 'Time Mode',
        icon: <Clock className="h-4 w-4" />,
        shortcut: 'T',
        action: () => setTestConfig({ mode: 'time' }),
        isActive: currentMode === 'time',
        description: 'Type for a set duration',
      },
      {
        id: 'mode-words',
        label: 'Words Mode',
        icon: <Hash className="h-4 w-4" />,
        shortcut: 'W',
        action: () => setTestConfig({ mode: 'words' }),
        isActive: currentMode === 'words',
        description: 'Type a specific number of words',
      },
      {
        id: 'mode-quote',
        label: 'Quote Mode',
        icon: <BookOpen className="h-4 w-4" />,
        shortcut: 'Q',
        action: () => setTestConfig({ mode: 'quote' }),
        isActive: currentMode === 'quote',
        description: 'Type a custom quote or text',
      },
    ];

    const durationCommands: CommandConfig[] =
      currentMode === 'time'
        ? [
            {
              id: 'duration-15',
              label: '15 seconds',
              icon: <Timer className="h-4 w-4" />,
              shortcut: '1',
              action: () => setTestConfig({ duration: 15 }),
              isActive: currentDuration === 15,
            },
            {
              id: 'duration-30',
              label: '30 seconds',
              icon: <Timer className="h-4 w-4" />,
              shortcut: '2',
              action: () => setTestConfig({ duration: 30 }),
              isActive: currentDuration === 30,
            },
            {
              id: 'duration-60',
              label: '60 seconds',
              icon: <Timer className="h-4 w-4" />,
              shortcut: '3',
              action: () => setTestConfig({ duration: 60 }),
              isActive: currentDuration === 60,
            },
            {
              id: 'duration-120',
              label: '120 seconds',
              icon: <Timer className="h-4 w-4" />,
              shortcut: '4',
              action: () => setTestConfig({ duration: 120 }),
              isActive: currentDuration === 120,
            },
          ]
        : [];

    const wordCountCommands: CommandConfig[] =
      currentMode === 'words'
        ? [
            {
              id: 'words-10',
              label: '10 words',
              icon: <Hash className="h-4 w-4" />,
              shortcut: '1',
              action: () => setTestConfig({ wordCount: 10 }),
              isActive: currentWordCount === 10,
            },
            {
              id: 'words-25',
              label: '25 words',
              icon: <Hash className="h-4 w-4" />,
              shortcut: '2',
              action: () => setTestConfig({ wordCount: 25 }),
              isActive: currentWordCount === 25,
            },
            {
              id: 'words-50',
              label: '50 words',
              icon: <Hash className="h-4 w-4" />,
              shortcut: '3',
              action: () => setTestConfig({ wordCount: 50 }),
              isActive: currentWordCount === 50,
            },
            {
              id: 'words-100',
              label: '100 words',
              icon: <Hash className="h-4 w-4" />,
              shortcut: '4',
              action: () => setTestConfig({ wordCount: 100 }),
              isActive: currentWordCount === 100,
            },
          ]
        : [];

    const difficultyCommands: CommandConfig[] = [
      {
        id: 'difficulty-normal',
        label: 'Normal Mode',
        icon: <Zap className="h-4 w-4" />,
        action: () => setTestConfig({ difficulty: 'Normal' }),
        isActive: currentDifficulty === 'Normal',
        description: 'Standard typing experience',
      },
      {
        id: 'difficulty-expert',
        label: 'Expert Mode',
        icon: <Sparkles className="h-4 w-4" />,
        action: () => setTestConfig({ difficulty: 'Expert' }),
        isActive: currentDifficulty === 'Expert',
        description: 'No errors allowed per word',
      },
      {
        id: 'difficulty-master',
        label: 'Master Mode',
        icon: <AlertCircle className="h-4 w-4" />,
        action: () => setTestConfig({ difficulty: 'Master' }),
        isActive: currentDifficulty === 'Master',
        description: 'One mistake ends the test',
      },
    ];

    const wordListCommands: CommandConfig[] = [
      {
        id: 'list-english1k',
        label: 'English 1K',
        icon: <FileText className="h-4 w-4" />,
        action: () => setTestConfig({ textSource: 'english1k' }),
        isActive: currentTextSource === 'english1k',
        description: 'Top 1000 English words',
      },
      {
        id: 'list-english10k',
        label: 'English 10K',
        icon: <FileText className="h-4 w-4" />,
        action: () => setTestConfig({ textSource: 'english10k' }),
        isActive: currentTextSource === 'english10k',
        description: 'Top 10000 English words',
      },
      {
        id: 'list-javascript',
        label: 'JavaScript',
        icon: <Code className="h-4 w-4" />,
        action: () => setTestConfig({ textSource: 'javascript' }),
        isActive: currentTextSource === 'javascript',
        description: 'JavaScript keywords and syntax',
      },
      {
        id: 'list-python',
        label: 'Python',
        icon: <Code className="h-4 w-4" />,
        action: () => setTestConfig({ textSource: 'python' }),
        isActive: currentTextSource === 'python',
        description: 'Python keywords and syntax',
      },
    ];

    const modifierCommands: CommandConfig[] = [
      {
        id: 'toggle-punctuation',
        label: 'Punctuation & Numbers',
        icon: <ToggleLeft className="h-4 w-4" />,
        shortcut: 'P',
        action: () => setTestConfig({ punctuation: !currentPunctuation }),
        isActive: currentPunctuation,
        description: 'Add punctuation and numbers to text',
      },
    ];

    return {
      modeCommands,
      durationCommands,
      wordCountCommands,
      difficultyCommands,
      wordListCommands,
      modifierCommands,
    };
  }, [
    currentMode,
    currentDuration,
    currentWordCount,
    currentDifficulty,
    currentTextSource,
    currentPunctuation,
    setTestConfig,
  ]);

  // Filter commands based on search
  const filterCommands = (commands: CommandConfig[], query: string) => {
    if (!query) return commands;
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(query.toLowerCase()) ||
        cmd.description?.toLowerCase().includes(query.toLowerCase())
    );
  };

  const renderCommandItem = (cmd: CommandConfig) => (
    <CommandItem
      key={cmd.id}
      value={cmd.label}
      onSelect={() => handleCommand(cmd.action, true, `${cmd.label} activated`)}
      className="flex cursor-pointer items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'transition-all',
            cmd.isActive ? 'text-primary' : 'opacity-50'
          )}
        >
          {cmd.isActive ? <Check className="h-4 w-4" /> : cmd.icon}
        </div>
        <div>
          <div className="font-medium">{cmd.label}</div>
          {cmd.description && (
            <div className="text-muted-foreground text-xs">
              {cmd.description}
            </div>
          )}
        </div>
      </div>
      {cmd.shortcut && <CommandShortcut>{cmd.shortcut}</CommandShortcut>}
    </CommandItem>
  );

  return (
    <>
      {/* Loading overlay */}
      {(isChangingConfig || isPreparingGame) && (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
            <p className="text-muted-foreground animate-pulse text-sm">
              Preparing new game...
            </p>
          </div>
        </div>
      )}

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search commands..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No commands found.</CommandEmpty>

          {/* Quick Actions */}
          <CommandGroup heading="Quick Actions">
            <CommandItem
              value="reset"
              onSelect={() => handleCommand(() => resetGame(), false)}
              className="flex cursor-pointer items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <RefreshCw className="h-4 w-4" />
                <div>
                  <div className="font-medium">Reset Current Game</div>
                  <div className="text-muted-foreground text-xs">
                    Start over with current settings
                  </div>
                </div>
              </div>
              <CommandShortcut>R</CommandShortcut>
            </CommandItem>

            {/* Recent Configurations */}
            {recentConfigs.length > 0 && (
              <>
                <CommandSeparator className="my-2" />
                <div className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
                  Recent
                </div>
                {recentConfigs.slice(0, 3).map((recent, idx) => (
                  <CommandItem
                    key={`recent-${idx}`}
                    value={`recent-${recent.label}`}
                    onSelect={() =>
                      handleCommand(
                        () => {
                          Object.entries(recent.config).forEach(
                            ([key, value]) => {
                              setTestConfig({ [key]: value });
                            }
                          );
                        },
                        true,
                        `Loaded: ${recent.label}`
                      )
                    }
                    className="flex cursor-pointer items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="h-4 w-4 opacity-50" />
                      <div className="text-sm">{recent.label}</div>
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {new Date(recent.timestamp).toLocaleDateString()}
                    </div>
                  </CommandItem>
                ))}
              </>
            )}
          </CommandGroup>

          <CommandSeparator />

          {/* Game Mode */}
          <CommandGroup heading="Game Mode">
            {filterCommands(commands.modeCommands, search).map(
              renderCommandItem
            )}
          </CommandGroup>

          {/* Time Duration (conditional) */}
          {currentMode === 'time' && commands.durationCommands.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Time Duration">
                {filterCommands(commands.durationCommands, search).map(
                  renderCommandItem
                )}
              </CommandGroup>
            </>
          )}

          {/* Word Count (conditional) */}
          {currentMode === 'words' && commands.wordCountCommands.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Word Count">
                {filterCommands(commands.wordCountCommands, search).map(
                  renderCommandItem
                )}
              </CommandGroup>
            </>
          )}

          <CommandSeparator />

          {/* Difficulty */}
          <CommandGroup heading="Difficulty">
            {filterCommands(commands.difficultyCommands, search).map(
              renderCommandItem
            )}
          </CommandGroup>

          <CommandSeparator />

          {/* Word Lists */}
          <CommandGroup heading="Word Lists">
            {filterCommands(commands.wordListCommands, search).map(
              renderCommandItem
            )}
          </CommandGroup>

          <CommandSeparator />

          {/* Modifiers */}
          <CommandGroup heading="Modifiers">
            {filterCommands(commands.modifierCommands, search).map(
              renderCommandItem
            )}
          </CommandGroup>

          {/* Footer with keyboard shortcuts help */}
          <div className="text-muted-foreground border-t px-3 py-2 text-xs">
            <div className="flex items-center justify-between">
              <span>
                Press <kbd className="bg-muted rounded px-1">Ctrl+K</kbd> to
                toggle
              </span>
              <span>
                Use <kbd className="bg-muted rounded px-1">↑↓</kbd> to navigate
              </span>
            </div>
          </div>
        </CommandList>
      </CommandDialog>
    </>
  );
}
