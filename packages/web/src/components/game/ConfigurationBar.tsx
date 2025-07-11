'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function ConfigurationBar() {
  // Use atomic selectors to prevent infinite loop and optimize performance
  const mode = useGameStore((state) => state.testConfig.mode);
  const difficulty = useGameStore((state) => state.testConfig.difficulty);
  const duration = useGameStore((state) => state.testConfig.duration);
  const wordCount = useGameStore((state) => state.testConfig.wordCount);
  const textSource = useGameStore((state) => state.testConfig.textSource);
  const punctuation = useGameStore((state) => state.testConfig.punctuation);
  const customText = useGameStore((state) => state.testConfig.customText);

  const setTestConfig = useGameStore((state) => state.setTestConfig);

  const getTextSourceDisplay = (textSource: string) => {
    switch (textSource) {
      case 'english1k':
        return 'English 1K';
      case 'english10k':
        return 'English 10K';
      case 'javascript':
        return 'JavaScript';
      case 'python':
        return 'Python';
      default:
        return textSource;
    }
  };

  const handleModeChange = () => {
    const modes: Array<'time' | 'words' | 'quote'> = ['time', 'words', 'quote'];
    const currentIndex = modes.indexOf(mode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setTestConfig({ mode: nextMode });
  };

  const handleDifficultyChange = () => {
    const difficulties: Array<'Normal' | 'Expert' | 'Master'> = [
      'Normal',
      'Expert',
      'Master',
    ];
    const currentIndex = difficulties.indexOf(difficulty);
    const nextDifficulty =
      difficulties[(currentIndex + 1) % difficulties.length];
    setTestConfig({ difficulty: nextDifficulty });
  };

  const handleDurationChange = () => {
    const durations = [15, 30, 60, 120];
    const currentIndex = durations.indexOf(duration);
    const nextDuration = durations[(currentIndex + 1) % durations.length];
    setTestConfig({ duration: nextDuration });
  };

  const handleWordCountChange = () => {
    const wordCounts: Array<10 | 25 | 50 | 100> = [10, 25, 50, 100];
    const currentIndex = wordCounts.indexOf(wordCount);
    const nextWordCount = wordCounts[(currentIndex + 1) % wordCounts.length];
    setTestConfig({ wordCount: nextWordCount });
  };

  const handleTextSourceChange = () => {
    const textSources: Array<
      'english1k' | 'english10k' | 'javascript' | 'python'
    > = ['english1k', 'english10k', 'javascript', 'python'];
    const currentIndex = textSources.indexOf(textSource);
    const nextTextSource = textSources[(currentIndex + 1) % textSources.length];
    setTestConfig({ textSource: nextTextSource });
  };

  const handlePunctuationToggle = () => {
    setTestConfig({ punctuation: !punctuation });
  };

  return (
    <div className="bg-card flex flex-wrap items-center gap-3 rounded-lg border p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm font-medium">Mode:</span>
        <Button variant="outline" size="sm" onClick={handleModeChange}>
          {mode.charAt(0).toUpperCase() + mode.slice(1)}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm font-medium">
          Difficulty:
        </span>
        <Button variant="outline" size="sm" onClick={handleDifficultyChange}>
          {difficulty}
        </Button>
      </div>

      {mode === 'time' && (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm font-medium">
            Duration:
          </span>
          <Button variant="outline" size="sm" onClick={handleDurationChange}>
            {duration}s
          </Button>
        </div>
      )}

      {mode === 'words' && (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm font-medium">
            Word Count:
          </span>
          <Button variant="outline" size="sm" onClick={handleWordCountChange}>
            {wordCount} words
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm font-medium">
          Word List:
        </span>
        <Button variant="outline" size="sm" onClick={handleTextSourceChange}>
          {getTextSourceDisplay(textSource)}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={punctuation ? 'default' : 'outline'}
          size="sm"
          onClick={handlePunctuationToggle}
        >
          Punctuation
        </Button>
      </div>

      {mode === 'quote' && customText && (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm font-medium">
            Custom:
          </span>
          <Badge
            variant="outline"
            className="hover:bg-primary hover:text-primary-foreground transition-base cursor-pointer"
          >
            {customText.length > 20
              ? `${customText.substring(0, 20)}...`
              : customText}
          </Badge>
        </div>
      )}
    </div>
  );
}
