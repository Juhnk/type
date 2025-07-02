'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Badge } from '@/components/ui/badge';

export function ConfigurationBar() {
  const testConfig = useGameStore((state) => state.testConfig);

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
          {testConfig.difficulty}
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
          {testConfig.duration}s
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
          {getTextSourceDisplay(testConfig.textSource)}
        </Badge>
      </div>

      {testConfig.textSource === 'custom' && testConfig.customText && (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm font-medium">
            Custom:
          </span>
          <Badge
            variant="outline"
            className="hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
          >
            {testConfig.customText.length > 20
              ? `${testConfig.customText.substring(0, 20)}...`
              : testConfig.customText}
          </Badge>
        </div>
      )}
    </div>
  );
}
