'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { cn } from '@/lib/utils';

export function TimerDisplay() {
  const testConfig = useGameStore((state) => state.testConfig);
  const timeRemaining = useGameStore((state) => state.timeRemaining);
  const isTimerRunning = useGameStore((state) => state.isTimerRunning);
  const gameStatus = useGameStore((state) => state.gameStatus);

  // Only show timer for time mode
  if (testConfig.mode !== 'time') return null;

  const totalSeconds = Math.ceil(timeRemaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // Determine urgency levels
  const isVeryLowTime = totalSeconds <= 5;
  const isLowTime = totalSeconds <= 10;
  const isWarningTime = totalSeconds <= 30;

  // Format display based on duration
  const formatTime = () => {
    if (testConfig.duration >= 60) {
      // Show mm:ss for longer tests
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
      // Show just seconds for shorter tests
      return `${totalSeconds}s`;
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          'font-mono text-3xl font-bold transition-all duration-200',
          {
            // Normal state
            'text-muted-foreground':
              gameStatus === 'ready' || gameStatus === 'paused',
            'text-foreground': gameStatus === 'running' && !isWarningTime,

            // Warning states
            'text-warning': isWarningTime && !isLowTime,
            'text-error animate-pulse': isLowTime && !isVeryLowTime,
            'text-error animate-bounce': isVeryLowTime,

            // Size based on urgency
            'text-4xl': isLowTime,
            'text-5xl': isVeryLowTime,
          }
        )}
      >
        {formatTime()}
      </div>

      {/* Status indicator */}
      <div className="ms-3 flex flex-col items-center">
        <div
          className={cn('transition-base h-2 w-2 rounded-full', {
            'bg-muted': gameStatus === 'ready' || gameStatus === 'paused',
            'animate-pulse-subtle bg-success':
              gameStatus === 'running' && isTimerRunning,
            'bg-error': gameStatus === 'finished',
          })}
        />
        <span className="text-muted-foreground mt-1 text-xs">
          {gameStatus === 'ready' && 'Ready'}
          {gameStatus === 'running' && 'Running'}
          {gameStatus === 'paused' && 'Paused'}
          {gameStatus === 'finished' && 'Finished'}
        </span>
      </div>
    </div>
  );
}

// Alternative compact timer for when space is limited
export function CompactTimerDisplay() {
  const testConfig = useGameStore((state) => state.testConfig);
  const timeRemaining = useGameStore((state) => state.timeRemaining);
  const gameStatus = useGameStore((state) => state.gameStatus);

  if (testConfig.mode !== 'time') return null;

  const totalSeconds = Math.ceil(timeRemaining / 1000);
  const isLowTime = totalSeconds <= 10;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-sm',
        {
          'border-muted-foreground/20 text-muted-foreground':
            gameStatus !== 'running',
          'border-success/20 text-success':
            gameStatus === 'running' && !isLowTime,
          'border-error/20 text-error animate-pulse':
            gameStatus === 'running' && isLowTime,
        }
      )}
    >
      <div
        className={cn('h-1.5 w-1.5 rounded-full', {
          'bg-muted-foreground/40': gameStatus !== 'running',
          'bg-success': gameStatus === 'running' && !isLowTime,
          'bg-error': gameStatus === 'running' && isLowTime,
        })}
      />
      {totalSeconds}s
    </div>
  );
}
