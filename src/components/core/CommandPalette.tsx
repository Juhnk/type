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

        <CommandSeparator />

        <CommandGroup heading="Duration">
          <CommandItem
            onSelect={() =>
              handleCommand(() => setTestConfig({ duration: 30 }))
            }
          >
            <span>30 seconds</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              handleCommand(() => setTestConfig({ duration: 60 }))
            }
          >
            <span>60 seconds</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              handleCommand(() => setTestConfig({ duration: 120 }))
            }
          >
            <span>120 seconds</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Difficulty">
          <CommandItem
            onSelect={() =>
              handleCommand(() => setTestConfig({ difficulty: 'Normal' }))
            }
          >
            <span>Normal Mode</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              handleCommand(() => setTestConfig({ difficulty: 'Expert' }))
            }
          >
            <span>Expert Mode</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              handleCommand(() => setTestConfig({ difficulty: 'Master' }))
            }
          >
            <span>Master Mode</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Word List">
          <CommandItem
            onSelect={() =>
              handleCommand(() => setTestConfig({ textSource: 'random' }))
            }
          >
            <span>Random Words</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              handleCommand(() => setTestConfig({ textSource: 'ai-generated' }))
            }
          >
            <span>AI Generated</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              handleCommand(() => setTestConfig({ textSource: 'custom' }))
            }
          >
            <span>Custom Text</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
