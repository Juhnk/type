'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { WordsProgress, CompactWordsProgress } from './WordsProgress';

/**
 * Demo component to showcase Sprint 6 words mode functionality
 * Demonstrates word counting, progress tracking, and automatic completion
 */
export function WordsModeDemo() {
  const testConfig = useGameStore((state) => state.testConfig);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const wordsCompleted = useGameStore((state) => state.wordsCompleted);
  const wordsProgress = useGameStore((state) => state.wordsProgress);
  const targetWordCount = useGameStore((state) => state.targetWordCount);
  const currentWordIndex = useGameStore((state) => state.currentWordIndex);
  const wordBoundaries = useGameStore((state) => state.wordBoundaries);
  const setTestConfig = useGameStore((state) => state.setTestConfig);
  const startGame = useGameStore((state) => state.startGame);
  const resetGame = useGameStore((state) => state.resetGame);

  const wordCounts = [10, 25, 50, 100] as const;

  return (
    <div className="bg-card space-y-6 rounded-lg border p-6">
      <h2 className="text-xl font-bold">Sprint 6 Words Mode Demo</h2>

      {/* Progress Displays */}
      <div className="space-y-4">
        <h3 className="font-semibold">Progress Displays</h3>

        <div className="space-y-4">
          <div>
            <h4 className="text-muted-foreground mb-2 text-sm">
              Main Progress Display
            </h4>
            <WordsProgress />
          </div>

          <div>
            <h4 className="text-muted-foreground mb-2 text-sm">
              Compact Progress Display
            </h4>
            <div className="flex justify-center">
              <CompactWordsProgress />
            </div>
          </div>
        </div>
      </div>

      {/* Words Mode Status */}
      <div className="space-y-2">
        <h3 className="font-semibold">Words Mode Status</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Mode:</span>{' '}
            {testConfig.mode}
          </div>
          <div>
            <span className="text-muted-foreground">Target Words:</span>{' '}
            {targetWordCount}
          </div>
          <div>
            <span className="text-muted-foreground">Words Completed:</span>{' '}
            {wordsCompleted}
          </div>
          <div>
            <span className="text-muted-foreground">Progress:</span>{' '}
            {Math.round(wordsProgress)}%
          </div>
          <div>
            <span className="text-muted-foreground">Current Word Index:</span>{' '}
            {currentWordIndex}
          </div>
          <div>
            <span className="text-muted-foreground">Game Status:</span>{' '}
            {gameStatus}
          </div>
        </div>
      </div>

      {/* Word Count Controls */}
      <div className="space-y-2">
        <h3 className="font-semibold">Word Count Settings</h3>
        <div className="flex gap-2">
          {wordCounts.map((count) => (
            <button
              key={count}
              onClick={() => setTestConfig({ mode: 'words', wordCount: count })}
              className={`rounded border px-3 py-1 text-sm transition-colors ${
                testConfig.wordCount === count && testConfig.mode === 'words'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-muted hover:bg-muted'
              }`}
            >
              {count} words
            </button>
          ))}
        </div>
      </div>

      {/* Game Controls */}
      <div className="space-y-2">
        <h3 className="font-semibold">Game Controls</h3>
        <div className="flex gap-2">
          <button
            onClick={startGame}
            disabled={gameStatus === 'running'}
            className="rounded bg-green-600 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start
          </button>

          <button
            onClick={resetGame}
            className="rounded bg-gray-600 px-4 py-2 text-sm text-white"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Word Boundaries Debug Info */}
      <div className="space-y-2">
        <h3 className="font-semibold">Word Boundaries (Debug)</h3>
        <div className="text-muted-foreground text-sm">
          <p>Detected {wordBoundaries.length} words in current text</p>
          <p>Boundaries: [{wordBoundaries.join(', ')}]</p>
        </div>
      </div>

      {/* Words Mode Features */}
      <div className="space-y-2">
        <h3 className="font-semibold">Words Mode Features</h3>
        <ul className="text-muted-foreground space-y-1 text-sm">
          <li>✅ Automatic completion when target word count is reached</li>
          <li>✅ Real-time word counting with character-level accuracy</li>
          <li>✅ Visual progress indicators with milestone markers</li>
          <li>✅ Handles backspace corrections affecting word completion</li>
          <li>✅ Smart word boundary detection (spaces, punctuation)</li>
          <li>✅ Support for multiple word counts (10, 25, 50, 100)</li>
          <li>✅ Progress bar with urgency styling near completion</li>
          <li>✅ Integration with existing typing mechanics</li>
          <li>✅ No performance impact on character-by-character feedback</li>
        </ul>
      </div>

      {/* Usage Instructions */}
      <div className="bg-muted space-y-2 rounded-lg p-4">
        <h3 className="font-semibold">How to Test</h3>
        <ol className="text-muted-foreground list-inside list-decimal space-y-1 text-sm">
          <li>Select a word count (10, 25, 50, or 100)</li>
          <li>Click &ldquo;Start&rdquo; to begin the test</li>
          <li>Start typing to see word progress update in real-time</li>
          <li>Watch the progress bar fill as you complete words</li>
          <li>Notice the game automatically ends when target is reached</li>
          <li>Try backspacing to see word completion status change</li>
        </ol>
      </div>
    </div>
  );
}
