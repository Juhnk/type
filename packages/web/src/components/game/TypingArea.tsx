'use client';

import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { ResultsCard } from './ResultsCard';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { TimerDisplay } from './TimerDisplay';
import { LiveStats } from './LiveStats';
import { WordsProgress } from './WordsProgress';
import { Caret, PaceCaret, usePaceCaretPosition } from './CaretComponents';
import { useTimerCleanup, useTimerVisibility } from '@/hooks/useTimerCleanup';
import {
  useDeviceDetection,
  useVirtualKeyboard,
} from '@/hooks/useDeviceDetection';
import { cn } from '@/lib/utils';

// Helper function to calculate current word boundaries
const getCurrentWordBounds = (
  currentWordIndex: number,
  wordBoundaries: number[],
  textLength: number
) => {
  const start = wordBoundaries[currentWordIndex] || 0;
  const end = wordBoundaries[currentWordIndex + 1] || textLength;
  return { start, end };
};

export function TypingArea() {
  // Use timer cleanup hooks
  useTimerCleanup();
  useTimerVisibility();

  // Mobile detection and optimization
  const { isMobile, isTouchDevice } = useDeviceDetection();
  const hasVirtualKeyboard = useVirtualKeyboard();

  // Settings from settings store
  const settings = useSettingsStore((state) => state.settings);
  const { font, fontSize, showWpmCounter, showAccuracyCounter } =
    settings.appearance;
  const { blindMode } = settings.behavior;

  // Caret blinking state
  const [caretVisible, setCaretVisible] = useState(true);
  const paceCaretPosition = usePaceCaretPosition();

  // Use atomic selectors to prevent infinite loop and optimize performance
  const charStates = useGameStore((state) => state.charStates);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const testConfig = useGameStore((state) => state.testConfig);
  const textWindow = useGameStore((state) => state.textWindow);
  const handleKeyPress = useGameStore((state) => state.handleKeyPress);
  const isPreparingGame = useGameStore((state) => state.isPreparingGame);
  const gamePreparationError = useGameStore(
    (state) => state.gamePreparationError
  );
  const prepareGame = useGameStore((state) => state.prepareGame);
  const useFallbackWords = useGameStore((state) => state.useFallbackWords);
  const stats = useGameStore((state) => state.stats);

  // Prepare game on component mount
  useEffect(() => {
    prepareGame();
  }, [prepareGame]);

  // Caret blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCaretVisible((prev) => !prev);
    }, 530);

    return () => clearInterval(interval);
  }, []);

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

  const getCharClassName = (
    status: string,
    isInCurrentWord: boolean = false
  ) => {
    const baseClasses = 'transition-colors duration-150';
    const wordHighlight = isInCurrentWord
      ? 'bg-primary/10 dark:bg-primary/15'
      : '';

    switch (status) {
      case 'correct':
        return cn(baseClasses, 'text-success bg-success-soft', wordHighlight);
      case 'incorrect':
        return cn(baseClasses, 'text-error bg-error-soft', wordHighlight);
      case 'current':
        return cn(baseClasses, 'text-foreground relative', wordHighlight);
      default:
        return cn(baseClasses, 'text-muted-foreground', wordHighlight);
    }
  };

  // Component to render the appropriate typing display based on mode
  const TypingDisplay = () => {
    if (testConfig.mode === 'time') {
      return <TimeModePastedComponent />;
    } else {
      return <StandardTypingDisplay />;
    }
  };

  // Optimized auto-scrolling display for time mode
  const TimeModePastedComponent = () => {
    const { lines, lineCharOffsets, scrollOffset } = textWindow;

    // Get word tracking state
    const currentWordIndex = useGameStore((state) => state.currentWordIndex);
    const wordBoundaries = useGameStore((state) => state.wordBoundaries);

    // Simple, performant scrolling - no complex interpolation needed
    // The store handles the timing, we just smoothly animate the transition

    // Buffer rendering to prevent content popping
    const renderBuffer = 2;
    const startIndex = Math.max(0, scrollOffset - renderBuffer);
    const endIndex = Math.min(lines.length, scrollOffset + 3 + renderBuffer);
    const linesToRender = lines.slice(startIndex, endIndex);

    // Calculate current word boundaries
    const { start: wordStart, end: wordEnd } = getCurrentWordBounds(
      currentWordIndex,
      wordBoundaries,
      charStates.length
    );

    // Memoize the line rendering for performance
    const renderLineWithCharacterStates = React.useMemo(() => {
      return (line: string, lineIndex: number) => {
        const globalLineIndex = startIndex + lineIndex;
        const lineStartChar = lineCharOffsets[globalLineIndex] || 0;

        return line.split('').map((char, charIndex) => {
          const globalCharIndex = lineStartChar + charIndex;
          const charState = charStates[globalCharIndex];

          if (!charState) return null;

          const isInCurrentWord =
            globalCharIndex >= wordStart &&
            globalCharIndex < wordEnd &&
            char !== ' ';

          const isCurrent = charState.status === 'current';
          const displayChar =
            blindMode && charState.status === 'correct'
              ? '●'
              : char === ' '
                ? '\u00A0'
                : char;

          return (
            <span
              key={`${globalLineIndex}-${charIndex}`}
              className={cn(
                'relative',
                getCharClassName(charState.status, isInCurrentWord)
              )}
            >
              {displayChar}
              {isCurrent && (
                <Caret
                  position={0}
                  visible={caretVisible && gameStatus !== 'finished'}
                  className="!left-0"
                />
              )}
              {Math.floor(paceCaretPosition) === globalCharIndex && (
                <PaceCaret
                  position={0}
                  visible={gameStatus === 'running'}
                  className="!left-0"
                />
              )}
            </span>
          );
        });
      };
    }, [
      lineCharOffsets,
      startIndex,
      wordStart,
      wordEnd,
      blindMode,
      caretVisible,
      gameStatus,
      paceCaretPosition,
    ]);

    return (
      <div className="typing-container relative">
        {/* Fixed 3-line container with smooth transform-based scrolling */}
        <div
          className={cn(
            'overflow-hidden',
            // Responsive height
            isMobile ? 'h-20' : 'h-24'
          )}
          role="textbox"
          aria-multiline="true"
          aria-describedby="typing-instructions game-status-live"
          tabIndex={0}
        >
          <div
            className={cn(
              'font-mono leading-8',
              // Responsive text size
              isMobile ? 'text-base' : 'text-lg sm:text-xl'
            )}
            style={{
              fontFamily: font,
              fontSize: `${fontSize}px`,
              transform: `translateY(-${(scrollOffset - startIndex) * (isMobile ? 28 : 32)}px)`,
              transition: 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              willChange: 'transform',
            }}
          >
            {linesToRender.map((line, index) => (
              <div
                key={`line-${startIndex + index}`}
                className={cn(
                  'leading-8',
                  isMobile ? 'min-h-[28px]' : 'min-h-[32px]'
                )}
                role="textbox"
                aria-label={`Line ${startIndex + index + 1}`}
              >
                {renderLineWithCharacterStates(line, index)}
              </div>
            ))}
          </div>
        </div>

        {/* Content streaming indicator */}
        {useGameStore((state) => state.isContentStreaming) && (
          <div className="text-info absolute top-0 right-0 animate-pulse text-xs">
            Loading more content...
          </div>
        )}

        {gameStatus === 'ready' && (
          <p className="text-muted-foreground mt-6 text-center text-sm">
            Start typing to begin the test...
          </p>
        )}

        {gameStatus === 'paused' && (
          <p className="text-warning mt-6 text-center text-sm font-medium">
            Test paused - continue typing to resume
          </p>
        )}
      </div>
    );
  };

  // Standard display for words and quote modes
  const StandardTypingDisplay = () => {
    // Get word tracking state
    const currentWordIndex = useGameStore((state) => state.currentWordIndex);
    const wordBoundaries = useGameStore((state) => state.wordBoundaries);

    // Calculate current word boundaries
    const { start, end } = getCurrentWordBounds(
      currentWordIndex,
      wordBoundaries,
      charStates.length
    );

    return (
      <div className="typing-container relative">
        <div
          className={cn(
            'relative w-full font-mono leading-relaxed tracking-wide break-words focus:outline-none',
            // Responsive text size and spacing
            isMobile
              ? 'min-h-[150px] text-base'
              : 'min-h-[200px] text-lg sm:text-xl lg:text-2xl'
          )}
          style={{
            fontFamily: font,
            fontSize: `${fontSize}px`,
          }}
          role="textbox"
          aria-multiline="true"
          aria-describedby="typing-instructions game-status-live"
          tabIndex={0}
        >
          {charStates.map((charState, index) => {
            const isInCurrentWord =
              index >= start && index < end && charState.char !== ' ';
            const isCurrent = charState.status === 'current';
            const displayChar =
              blindMode && charState.status === 'correct'
                ? '●'
                : charState.char === ' '
                  ? '\u00A0'
                  : charState.char;

            return (
              <span
                key={index}
                className={cn(
                  'relative',
                  getCharClassName(charState.status, isInCurrentWord)
                )}
                aria-label={isCurrent ? 'Current character' : undefined}
              >
                {displayChar}
                {isCurrent && (
                  <Caret
                    position={0}
                    visible={caretVisible && gameStatus !== 'finished'}
                    className="!left-0"
                  />
                )}
                {Math.floor(paceCaretPosition) === index && (
                  <PaceCaret
                    position={0}
                    visible={gameStatus === 'running'}
                    className="!left-0"
                  />
                )}
              </span>
            );
          })}
        </div>

        {gameStatus === 'ready' && (
          <p className="text-muted-foreground mt-6 text-center text-sm">
            Start typing to begin the test...
          </p>
        )}

        {gameStatus === 'paused' && (
          <p className="text-warning mt-6 text-center text-sm font-medium">
            Test paused - continue typing to resume
          </p>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'mx-auto w-full max-w-5xl space-y-6',
        // Mobile optimizations
        isMobile && 'space-y-4 px-4',
        hasVirtualKeyboard && 'pb-4'
      )}
    >
      {/* Timer Display (time mode only) */}
      {testConfig.mode === 'time' && (
        <div className="flex justify-center">
          <TimerDisplay />
        </div>
      )}

      {/* Words Progress (words mode only) */}
      <WordsProgress />

      {/* Main Typing Container */}
      <div className="w-full">
        <div
          className={cn(
            'bg-card focus-within:ring-ring rounded-lg border focus-within:ring-2',
            // Responsive padding
            isMobile ? 'p-4' : 'p-6 sm:p-8',
            // Touch optimizations
            isTouchDevice && 'touch-manipulation'
          )}
          role="main"
          aria-label="Typing practice area"
        >
          {/* Screen reader instructions */}
          <div id="typing-instructions" className="sr-only">
            {testConfig.mode === 'time'
              ? `Type the text shown to practice your typing speed. Timer: ${testConfig.duration} seconds.`
              : testConfig.mode === 'words'
                ? `Type ${testConfig.wordCount} words as quickly and accurately as possible.`
                : 'Type the quote shown as quickly and accurately as possible.'}{' '}
            Use backspace to correct mistakes. Press Escape to open the command
            palette. Current difficulty: {testConfig.difficulty}.
          </div>

          {/* Live region for game status updates */}
          <div
            id="game-status-live"
            className="sr-only"
            aria-live="polite"
            aria-atomic="false"
          >
            {gameStatus === 'ready' && 'Ready to start typing'}
            {gameStatus === 'running' && 'Test in progress'}
            {gameStatus === 'paused' && 'Test paused'}
            {gameStatus === 'finished' && 'Test completed'}
          </div>

          {isPreparingGame ? (
            <LoadingState
              message="Preparing your typing challenge..."
              variant="preparing"
            />
          ) : gamePreparationError ? (
            <ErrorState
              error={`Game preparation failed: ${gamePreparationError}`}
              onRetry={prepareGame}
              onFallback={useFallbackWords}
            />
          ) : (
            <TypingDisplay />
          )}
        </div>
      </div>

      {/* Statistics Below Text Box */}
      {gameStatus === 'running' && (
        <div className="flex justify-center">
          <LiveStats />
        </div>
      )}

      {/* Show results card when test is finished */}
      {gameStatus === 'finished' && <ResultsCard />}
    </div>
  );
}
