'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { cn } from '@/lib/utils';

export function LiveStats() {
  const gameStatus = useGameStore((state) => state.gameStatus);
  const stats = useGameStore((state) => state.stats);
  const testConfig = useGameStore((state) => state.testConfig);

  // Only show live stats when game is running
  if (gameStatus !== 'running' && gameStatus !== 'finished') return null;

  return (
    <div className="flex justify-center gap-4 sm:gap-6">
      {/* WPM */}
      <div className="text-center">
        <div
          className={cn(
            'font-mono text-xl font-bold sm:text-2xl',
            stats.wpm >= 60
              ? 'text-success'
              : stats.wpm >= 40
                ? 'text-primary'
                : 'text-foreground'
          )}
        >
          {stats.wpm}
        </div>
        <div className="text-muted-foreground text-xs tracking-wide uppercase">
          WPM
        </div>
      </div>

      {/* Accuracy */}
      <div className="text-center">
        <div
          className={cn(
            'font-mono text-xl font-bold sm:text-2xl',
            stats.accuracy >= 95
              ? 'text-success'
              : stats.accuracy >= 90
                ? 'text-warning'
                : 'text-error'
          )}
        >
          {stats.accuracy}%
        </div>
        <div className="text-muted-foreground text-xs tracking-wide uppercase">
          Accuracy
        </div>
      </div>

      {/* Elapsed time for words mode (don't show word count as WordsProgress handles that) */}
      {testConfig.mode === 'words' && (
        <div className="text-center">
          <div className="text-foreground font-mono text-xl font-bold sm:text-2xl">
            {Math.floor(stats.elapsedTime / 1000)}s
          </div>
          <div className="text-muted-foreground text-xs tracking-wide uppercase">
            Elapsed
          </div>
        </div>
      )}

      {testConfig.mode === 'time' && (
        <div className="text-center">
          <div className="text-foreground font-mono text-xl font-bold sm:text-2xl">
            {Math.floor(stats.elapsedTime / 1000)}s
          </div>
          <div className="text-muted-foreground text-xs tracking-wide uppercase">
            Elapsed
          </div>
        </div>
      )}
    </div>
  );
}
