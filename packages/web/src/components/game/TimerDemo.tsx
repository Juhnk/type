'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { TimerDisplay, CompactTimerDisplay } from './TimerDisplay';

/**
 * Demo component to showcase Sprint 5 timer functionality
 * Demonstrates timer behavior across different states and configurations
 */
export function TimerDemo() {
  const testConfig = useGameStore((state) => state.testConfig);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const timeRemaining = useGameStore((state) => state.timeRemaining);
  const isTimerRunning = useGameStore((state) => state.isTimerRunning);
  const setTestConfig = useGameStore((state) => state.setTestConfig);
  const startGame = useGameStore((state) => state.startGame);
  const pauseGame = useGameStore((state) => state.pauseGame);
  const resumeGame = useGameStore((state) => state.resumeGame);
  const resetGame = useGameStore((state) => state.resetGame);

  const durations = [15, 30, 60, 120];

  return (
    <div className="bg-card space-y-6 rounded-lg border p-6">
      <h2 className="text-xl font-bold">Sprint 5 Timer Demo</h2>

      {/* Timer Displays */}
      <div className="space-y-4">
        <h3 className="font-semibold">Timer Displays</h3>

        <div className="flex flex-col items-center gap-4">
          <div>
            <h4 className="text-muted-foreground mb-2 text-sm">
              Main Timer Display
            </h4>
            <TimerDisplay />
          </div>

          <div>
            <h4 className="text-muted-foreground mb-2 text-sm">
              Compact Timer Display
            </h4>
            <CompactTimerDisplay />
          </div>
        </div>
      </div>

      {/* Timer Status */}
      <div className="space-y-2">
        <h3 className="font-semibold">Timer Status</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Mode:</span>{' '}
            {testConfig.mode}
          </div>
          <div>
            <span className="text-muted-foreground">Duration:</span>{' '}
            {testConfig.duration}s
          </div>
          <div>
            <span className="text-muted-foreground">Game Status:</span>{' '}
            {gameStatus}
          </div>
          <div>
            <span className="text-muted-foreground">Timer Running:</span>{' '}
            {isTimerRunning ? 'Yes' : 'No'}
          </div>
          <div>
            <span className="text-muted-foreground">Time Remaining:</span>{' '}
            {Math.ceil(timeRemaining / 1000)}s
          </div>
        </div>
      </div>

      {/* Duration Controls */}
      <div className="space-y-2">
        <h3 className="font-semibold">Duration Settings</h3>
        <div className="flex gap-2">
          {durations.map((duration) => (
            <button
              key={duration}
              onClick={() => setTestConfig({ mode: 'time', duration })}
              className={`rounded border px-3 py-1 text-sm transition-colors ${
                testConfig.duration === duration
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-muted hover:bg-muted'
              }`}
            >
              {duration}s
            </button>
          ))}
        </div>
      </div>

      {/* Timer Controls */}
      <div className="space-y-2">
        <h3 className="font-semibold">Timer Controls</h3>
        <div className="flex gap-2">
          <button
            onClick={startGame}
            disabled={gameStatus === 'running'}
            className="rounded bg-green-600 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start
          </button>

          <button
            onClick={pauseGame}
            disabled={gameStatus !== 'running'}
            className="rounded bg-yellow-600 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Pause
          </button>

          <button
            onClick={resumeGame}
            disabled={gameStatus !== 'paused'}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Resume
          </button>

          <button
            onClick={resetGame}
            className="rounded bg-gray-600 px-4 py-2 text-sm text-white"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Timer Features Demo */}
      <div className="space-y-2">
        <h3 className="font-semibold">Timer Features</h3>
        <ul className="text-muted-foreground space-y-1 text-sm">
          <li>✅ Automatic start when typing begins</li>
          <li>✅ Smooth countdown with 100ms precision</li>
          <li>
            ✅ Visual urgency indicators (30s warning, 10s urgent, 5s critical)
          </li>
          <li>✅ Format adaptation (mm:ss for long tests, ss for short)</li>
          <li>✅ Automatic game completion when timer reaches zero</li>
          <li>✅ Proper pause/resume functionality</li>
          <li>✅ Memory leak prevention with cleanup hooks</li>
          <li>✅ Page visibility handling (pauses when tab hidden)</li>
        </ul>
      </div>
    </div>
  );
}
