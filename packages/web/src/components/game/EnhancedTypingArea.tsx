'use client';

import React from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useGameStore } from '@/store/useGameStore';
import { cn } from '@/lib/utils';

interface CaretProps {
  position: number;
  visible: boolean;
}

const Caret: React.FC<CaretProps> = ({ position, visible }) => {
  const { caretStyle, caretColor, smoothCaret } = useSettingsStore(
    (state) => state.settings.appearance
  );

  if (!visible) return null;

  const baseClasses = cn(
    'absolute pointer-events-none',
    smoothCaret && 'transition-all duration-100 ease-out'
  );

  const getCaretElement = () => {
    switch (caretStyle) {
      case 'line':
        return (
          <div
            className={cn(baseClasses, 'h-full w-0.5')}
            style={{
              backgroundColor: caretColor,
              left: `${position}ch`,
              transform: 'translateX(-1px)',
            }}
          />
        );
      case 'block':
        return (
          <div
            className={cn(baseClasses, 'h-full w-[1ch] opacity-50')}
            style={{
              backgroundColor: caretColor,
              left: `${position}ch`,
            }}
          />
        );
      case 'underline':
        return (
          <div
            className={cn(baseClasses, 'bottom-0 h-1 w-[1ch]')}
            style={{
              backgroundColor: caretColor,
              left: `${position}ch`,
            }}
          />
        );
      default:
        return null;
    }
  };

  return getCaretElement();
};

interface PaceCaretProps {
  position: number;
  visible: boolean;
}

const PaceCaret: React.FC<PaceCaretProps> = ({ position, visible }) => {
  const { paceCaretEnabled } = useSettingsStore(
    (state) => state.settings.behavior
  );

  if (!visible || !paceCaretEnabled) return null;

  return (
    <div
      className="absolute h-full w-0.5 bg-yellow-500 opacity-50 transition-all duration-100"
      style={{
        left: `${position}ch`,
        transform: 'translateX(-1px)',
      }}
    />
  );
};

export function EnhancedTypingArea() {
  const { font, fontSize, blindMode } = useSettingsStore((state) => ({
    font: state.settings.appearance.font,
    fontSize: state.settings.appearance.fontSize,
    blindMode: state.settings.behavior.blindMode,
  }));

  const { textToType, userInput, gameStatus } = useGameStore((state) => ({
    textToType: state.textToType,
    userInput: state.userInput,
    gameStatus: state.gameStatus,
  }));

  const [caretVisible, setCaretVisible] = React.useState(true);

  // Caret blinking
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCaretVisible((prev) => !prev);
    }, 530);

    return () => clearInterval(interval);
  }, []);

  // Calculate pace caret position
  const calculatePaceCaretPosition = () => {
    const { paceCaretWpm } = useSettingsStore.getState().settings.behavior;
    const { stats } = useGameStore.getState();
    const elapsedTimeInSeconds = stats.elapsedTime / 1000; // Convert ms to seconds

    // Calculate expected position based on target WPM
    const expectedChars = (paceCaretWpm * 5 * elapsedTimeInSeconds) / 60;
    return Math.min(expectedChars, textToType.length);
  };

  const renderText = () => {
    const currentIndex = userInput.length;
    return textToType.split('').map((char: string, index: number) => {
      const isTyped = index < currentIndex;
      const isCurrent = index === currentIndex;
      const isCorrect = userInput[index] === char;
      const hasError = isTyped && !isCorrect;

      // Blind mode hides typed text
      const displayChar = blindMode && isTyped ? '●' : char;

      return (
        <span
          key={index}
          className={cn(
            'relative',
            isTyped && isCorrect && 'text-success',
            hasError && 'bg-error-soft text-error',
            isCurrent && 'text-foreground',
            !isTyped && !isCurrent && 'text-muted-foreground/60'
          )}
        >
          {displayChar}
        </span>
      );
    });
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div
        className="bg-muted/20 relative rounded-lg border p-8 backdrop-blur-sm"
        style={{
          fontFamily: font,
          fontSize: `${fontSize}px`,
        }}
      >
        <div className="relative font-mono leading-relaxed">
          {renderText()}
          <Caret
            position={userInput.length}
            visible={caretVisible && gameStatus !== 'finished'}
          />
          <PaceCaret
            position={calculatePaceCaretPosition()}
            visible={gameStatus === 'running'}
          />
        </div>

        {gameStatus === 'ready' && (
          <p className="text-muted-foreground mt-6 text-center text-sm">
            Start typing to begin the test...
          </p>
        )}
      </div>
    </div>
  );
}
