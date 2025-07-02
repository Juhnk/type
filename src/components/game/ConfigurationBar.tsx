'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Badge } from '@/components/ui/badge';

export function ConfigurationBar() {
  // Use atomic selectors to prevent infinite loop and optimize performance
  const mode = useGameStore((state) => state.testConfig.mode);
  const difficulty = useGameStore((state) => state.testConfig.difficulty);
  const duration = useGameStore((state) => state.testConfig.duration);
  const textSource = useGameStore((state) => state.testConfig.textSource);
  const customText = useGameStore((state) => state.testConfig.customText);

  const getTextSourceDisplay = (textSource: string) => {
    switch (textSource) {
      case 'random':
        return 'Random Words';
      case 'custom':
        return 'Custom Text';
      case 'ai-generated':
        return 'AI Generated';
      default:
        return textSource;
    }
  };

  return (
    <div className="bg-card flex flex-wrap items-center gap-3 rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm font-medium">Mode:</span>
        <Badge
          variant="secondary"
          className="hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
        >
          {mode.charAt(0).toUpperCase() + mode.slice(1)}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm font-medium">
          Difficulty:
        </span>
        <Badge
          variant="secondary"
          className="hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
        >
          {difficulty}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm font-medium">
          Duration:
        </span>
        <Badge
          variant="secondary"
          className="hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
        >
          {duration}s
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm font-medium">
          Word List:
        </span>
        <Badge
          variant="secondary"
          className="hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
        >
          {getTextSourceDisplay(textSource)}
        </Badge>
      </div>

      {textSource === 'custom' && customText && (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm font-medium">
            Custom:
          </span>
          <Badge
            variant="outline"
            className="hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
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
