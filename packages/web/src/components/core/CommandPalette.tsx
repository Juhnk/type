'use client';

import React, { useEffect, useState } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useGameStore } from '@/store/useGameStore';
import { Check } from 'lucide-react';

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  // Zustand store actions and current config
  const setTestConfig = useGameStore((state) => state.setTestConfig);
  const resetGame = useGameStore((state) => state.resetGame);
  const currentMode = useGameStore((state) => state.testConfig.mode);
  const currentDuration = useGameStore((state) => state.testConfig.duration);
  const currentWordCount = useGameStore((state) => state.testConfig.wordCount);
  const currentDifficulty = useGameStore(
    (state) => state.testConfig.difficulty
  );
  const currentTextSource = useGameStore(
    (state) => state.testConfig.textSource
  );
  const currentPunctuation = useGameStore(
    (state) => state.testConfig.punctuation
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+K (Windows/Linux) or Cmd+K (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCommand = (callback: () => void) => {
    setOpen(false);
    callback();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Mode">
          <CommandItem
            onSelect={() =>
              handleCommand(() => setTestConfig({ mode: 'time' }))
            }
          >
            {currentMode === 'time' && <Check className="mr-2 h-4 w-4" />}
            <span className={currentMode !== 'time' ? 'ml-6' : ''}>Time</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              handleCommand(() => setTestConfig({ mode: 'words' }))
            }
          >
            {currentMode === 'words' && <Check className="mr-2 h-4 w-4" />}
            <span className={currentMode !== 'words' ? 'ml-6' : ''}>Words</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              handleCommand(() => setTestConfig({ mode: 'quote' }))
            }
          >
            {currentMode === 'quote' && <Check className="mr-2 h-4 w-4" />}
            <span className={currentMode !== 'quote' ? 'ml-6' : ''}>Quote</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Game Controls">
          <CommandItem onSelect={() => handleCommand(() => resetGame())}>
            <span>Reset Game</span>
          </CommandItem>
        </CommandGroup>

        {currentMode === 'time' && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Duration">
              <CommandItem
                onSelect={() =>
                  handleCommand(() => setTestConfig({ duration: 15 }))
                }
              >
                {currentDuration === 15 && <Check className="mr-2 h-4 w-4" />}
                <span className={currentDuration !== 15 ? 'ml-6' : ''}>
                  15 seconds
                </span>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  handleCommand(() => setTestConfig({ duration: 30 }))
                }
              >
                {currentDuration === 30 && <Check className="mr-2 h-4 w-4" />}
                <span className={currentDuration !== 30 ? 'ml-6' : ''}>
                  30 seconds
                </span>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  handleCommand(() => setTestConfig({ duration: 60 }))
                }
              >
                {currentDuration === 60 && <Check className="mr-2 h-4 w-4" />}
                <span className={currentDuration !== 60 ? 'ml-6' : ''}>
                  60 seconds
                </span>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  handleCommand(() => setTestConfig({ duration: 120 }))
                }
              >
                {currentDuration === 120 && <Check className="mr-2 h-4 w-4" />}
                <span className={currentDuration !== 120 ? 'ml-6' : ''}>
                  120 seconds
                </span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {currentMode === 'words' && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Word Count">
              <CommandItem
                onSelect={() =>
                  handleCommand(() => setTestConfig({ wordCount: 10 }))
                }
              >
                {currentWordCount === 10 && <Check className="mr-2 h-4 w-4" />}
                <span className={currentWordCount !== 10 ? 'ml-6' : ''}>
                  10 words
                </span>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  handleCommand(() => setTestConfig({ wordCount: 25 }))
                }
              >
                {currentWordCount === 25 && <Check className="mr-2 h-4 w-4" />}
                <span className={currentWordCount !== 25 ? 'ml-6' : ''}>
                  25 words
                </span>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  handleCommand(() => setTestConfig({ wordCount: 50 }))
                }
              >
                {currentWordCount === 50 && <Check className="mr-2 h-4 w-4" />}
                <span className={currentWordCount !== 50 ? 'ml-6' : ''}>
                  50 words
                </span>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  handleCommand(() => setTestConfig({ wordCount: 100 }))
                }
              >
                {currentWordCount === 100 && <Check className="mr-2 h-4 w-4" />}
                <span className={currentWordCount !== 100 ? 'ml-6' : ''}>
                  100 words
                </span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        <CommandSeparator />

        <CommandGroup heading="Difficulty">
          <CommandItem
            onSelect={() =>
              handleCommand(() => setTestConfig({ difficulty: 'Normal' }))
            }
          >
            {currentDifficulty === 'Normal' && (
              <Check className="mr-2 h-4 w-4" />
            )}
            <span className={currentDifficulty !== 'Normal' ? 'ml-6' : ''}>
              Normal Mode
            </span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              handleCommand(() => setTestConfig({ difficulty: 'Expert' }))
            }
          >
            {currentDifficulty === 'Expert' && (
              <Check className="mr-2 h-4 w-4" />
            )}
            <span className={currentDifficulty !== 'Expert' ? 'ml-6' : ''}>
              Expert Mode
            </span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              handleCommand(() => setTestConfig({ difficulty: 'Master' }))
            }
          >
            {currentDifficulty === 'Master' && (
              <Check className="mr-2 h-4 w-4" />
            )}
            <span className={currentDifficulty !== 'Master' ? 'ml-6' : ''}>
              Master Mode
            </span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Word List">
          <CommandItem
            onSelect={() =>
              handleCommand(() => setTestConfig({ textSource: 'english1k' }))
            }
          >
            {currentTextSource === 'english1k' && (
              <Check className="mr-2 h-4 w-4" />
            )}
            <span className={currentTextSource !== 'english1k' ? 'ml-6' : ''}>
              English 1K
            </span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              handleCommand(() => setTestConfig({ textSource: 'english10k' }))
            }
          >
            {currentTextSource === 'english10k' && (
              <Check className="mr-2 h-4 w-4" />
            )}
            <span className={currentTextSource !== 'english10k' ? 'ml-6' : ''}>
              English 10K
            </span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              handleCommand(() => setTestConfig({ textSource: 'javascript' }))
            }
          >
            {currentTextSource === 'javascript' && (
              <Check className="mr-2 h-4 w-4" />
            )}
            <span className={currentTextSource !== 'javascript' ? 'ml-6' : ''}>
              JavaScript
            </span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              handleCommand(() => setTestConfig({ textSource: 'python' }))
            }
          >
            {currentTextSource === 'python' && (
              <Check className="mr-2 h-4 w-4" />
            )}
            <span className={currentTextSource !== 'python' ? 'ml-6' : ''}>
              Python
            </span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Modifiers">
          <CommandItem
            onSelect={() =>
              handleCommand(() =>
                setTestConfig({ punctuation: !currentPunctuation })
              )
            }
          >
            {currentPunctuation && <Check className="mr-2 h-4 w-4" />}
            <span className={!currentPunctuation ? 'ml-6' : ''}>
              Punctuation
            </span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
