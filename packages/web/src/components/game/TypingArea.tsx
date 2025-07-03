'use client';

import React, { useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { ResultsCard } from './ResultsCard';

export function TypingArea() {
  // Use atomic selectors to prevent infinite loop and optimize performance
  const charStates = useGameStore((state) => state.charStates);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const handleKeyPress = useGameStore((state) => state.handleKeyPress);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default browser actions for specific keys
      if (
        event.key === 'Tab' ||
        event.key === 'Escape' ||
        (event.key === ' ' && event.target === document.body)
      ) {
        event.preventDefault();
      }

      // Only handle typing when game is ready or running
      if (gameStatus === 'ready' || gameStatus === 'running') {
        handleKeyPress(event.key);
      }
    };

    // Add global keydown listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup function to remove listener
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStatus, handleKeyPress]);

  const getCharClassName = (status: string) => {
    switch (status) {
      case 'correct':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'incorrect':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case 'current':
        return 'bg-primary text-primary-foreground animate-pulse border-l-2 border-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="w-full">
      <div className="bg-card focus-within:ring-ring rounded-lg border p-8 focus-within:ring-2">
        <div
          className="font-mono text-2xl leading-relaxed tracking-wide focus:outline-none"
          tabIndex={0}
        >
          {charStates.map((charState, index) => (
            <span
              key={index}
              className={`transition-colors duration-150 ${getCharClassName(
                charState.status
              )}`}
            >
              {charState.char === ' ' ? '\u00A0' : charState.char}
            </span>
          ))}
        </div>

        {gameStatus === 'ready' && (
          <p className="text-muted-foreground mt-4 text-center text-sm">
            Start typing to begin the test...
          </p>
        )}
      </div>

      {/* Show results card when test is finished */}
      {gameStatus === 'finished' && (
        <div className="mt-8">
          <ResultsCard />
        </div>
      )}
    </div>
  );
}
