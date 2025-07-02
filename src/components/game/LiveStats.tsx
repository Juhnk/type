'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';

export function LiveStats() {
  // Use atomic selectors to prevent infinite loop and optimize performance
  const wpm = useGameStore((state) => state.stats.wpm);
  const accuracy = useGameStore((state) => state.stats.accuracy);
  const gameStatus = useGameStore((state) => state.gameStatus);

  // Reduce opacity during typing to minimize distraction (GDD Section 3.2.1)
  const isRunning = gameStatus === 'running';
  const opacityClass = isRunning ? 'opacity-50' : 'opacity-100';

  return (
    <div
      className={`bg-card rounded-lg border p-6 transition-opacity duration-300 ${opacityClass}`}
    >
      <div className="grid grid-cols-2 gap-6 text-center">
        <div className="space-y-1">
          <div className="text-3xl font-bold tracking-tight">{wpm}</div>
          <div className="text-muted-foreground text-sm font-medium">WPM</div>
        </div>

        <div className="space-y-1">
          <div className="text-3xl font-bold tracking-tight">{accuracy}%</div>
          <div className="text-muted-foreground text-sm font-medium">
            Accuracy
          </div>
        </div>
      </div>
    </div>
  );
}
