'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useModalStore } from '@/store/useModalStore';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Timer, RotateCcw, Save, Check } from 'lucide-react';

export function ResultsCard() {
  // Use atomic selectors to prevent infinite loop and optimize performance
  const wpm = useGameStore((state) => state.stats.wpm);
  const accuracy = useGameStore((state) => state.stats.accuracy);
  const totalChars = useGameStore((state) => state.stats.totalChars);
  const correctChars = useGameStore((state) => state.stats.correctChars);
  const incorrectChars = useGameStore((state) => state.stats.incorrectChars);
  const elapsedTime = useGameStore((state) => state.stats.elapsedTime);
  const resetGame = useGameStore((state) => state.resetGame);

  // Auth and modal stores
  const { token } = useAuthStore();
  const { openAuthModal } = useModalStore();

  const handleSaveScore = () => {
    openAuthModal();
  };

  // Format elapsed time to seconds
  const elapsedSeconds = Math.round(elapsedTime / 1000);

  // Determine performance level for congratulations message
  const getPerformanceMessage = () => {
    if (wpm >= 80) return 'Outstanding Performance! 🚀';
    if (wpm >= 60) return 'Excellent Typing! 🌟';
    if (wpm >= 40) return 'Great Job! 👏';
    return 'Keep Practicing! 💪';
  };

  const getAccuracyColor = () => {
    if (accuracy >= 95) return 'text-green-600 dark:text-green-400';
    if (accuracy >= 85) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Test Complete!
        </CardTitle>
        <CardDescription className="text-lg">
          {getPerformanceMessage()}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">{wpm}</div>
            <div className="text-muted-foreground text-sm font-medium">
              Words Per Minute
            </div>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4 text-center">
            <div className={`text-3xl font-bold ${getAccuracyColor()}`}>
              {accuracy}%
            </div>
            <div className="text-muted-foreground text-sm font-medium">
              Accuracy
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Characters Typed
            </span>
            <span className="font-medium">{totalChars}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              Correct
            </span>
            <span className="font-medium text-green-600 dark:text-green-400">
              {correctChars}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <span className="text-red-600 dark:text-red-400">✗</span>
              Incorrect
            </span>
            <span className="font-medium text-red-600 dark:text-red-400">
              {incorrectChars}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Time Elapsed
            </span>
            <span className="font-medium">{elapsedSeconds}s</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-3">
        {/* Contextual save button */}
        {token ? (
          <Button size="lg" variant="outline" className="flex-1" disabled>
            <Check className="mr-2 h-4 w-4 text-green-600" />
            Saved!
          </Button>
        ) : (
          <Button
            onClick={handleSaveScore}
            size="lg"
            variant="outline"
            className="flex-1"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Score
          </Button>
        )}

        <Button
          onClick={resetGame}
          className="flex-1"
          size="lg"
          variant="default"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </CardFooter>
    </Card>
  );
}
