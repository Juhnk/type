'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { cn } from '@/lib/utils';

export function WordsProgress() {
  const testConfig = useGameStore((state) => state.testConfig);
  const wordsCompleted = useGameStore((state) => state.wordsCompleted);
  const wordsProgress = useGameStore((state) => state.wordsProgress);
  const targetWordCount = useGameStore((state) => state.targetWordCount);
  const gameStatus = useGameStore((state) => state.gameStatus);

  // Only show for words mode
  if (testConfig.mode !== 'words') return null;

  // Don't show if game hasn't started
  if (gameStatus === 'idle' || gameStatus === 'ready') return null;

  const isNearCompletion = wordsProgress >= 80;
  const isAlmostDone = wordsProgress >= 90;

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Progress</span>
        <span
          className={cn(
            'text-xs font-medium sm:text-sm',
            isAlmostDone && 'text-success',
            isNearCompletion && !isAlmostDone && 'text-info'
          )}
        >
          {wordsCompleted}/{targetWordCount} words
        </span>
      </div>

      <div className="bg-muted relative h-3 overflow-hidden rounded-full">
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full transition-all duration-300 ease-out',
            'bg-primary',
            isAlmostDone && 'bg-success',
            isNearCompletion && !isAlmostDone && 'bg-info'
          )}
          style={{ width: `${wordsProgress}%` }}
        >
          {/* Animated shimmer effect when near completion */}
          {isNearCompletion && (
            <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          )}
        </div>

        {/* Milestone markers */}
        <div className="absolute inset-0 flex justify-between px-1">
          {[25, 50, 75].map((milestone) => (
            <div
              key={milestone}
              className={cn(
                'bg-border/50 h-full w-0.5 transition-opacity',
                wordsProgress >= milestone && 'opacity-50'
              )}
              style={{ marginLeft: `${milestone}%` }}
            />
          ))}
        </div>
      </div>

      {/* Percentage text */}
      <div className="mt-1 text-center">
        <span className="text-muted-foreground text-xs">
          {Math.round(wordsProgress)}% complete
        </span>
      </div>
    </div>
  );
}

// Compact version for smaller displays
export function CompactWordsProgress() {
  const testConfig = useGameStore((state) => state.testConfig);
  const wordsCompleted = useGameStore((state) => state.wordsCompleted);
  const targetWordCount = useGameStore((state) => state.targetWordCount);
  const wordsProgress = useGameStore((state) => state.wordsProgress);
  const gameStatus = useGameStore((state) => state.gameStatus);

  if (
    testConfig.mode !== 'words' ||
    gameStatus === 'idle' ||
    gameStatus === 'ready'
  ) {
    return null;
  }

  const isNearCompletion = wordsProgress >= 80;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm',
        'border-muted-foreground/20',
        isNearCompletion && 'border-success/20 text-success'
      )}
    >
      <div className="bg-muted relative h-1.5 w-16 overflow-hidden rounded-full">
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full transition-all duration-300',
            'bg-primary',
            isNearCompletion && 'bg-success'
          )}
          style={{ width: `${wordsProgress}%` }}
        />
      </div>
      <span className="font-mono">
        {wordsCompleted}/{targetWordCount}
      </span>
    </div>
  );
}
