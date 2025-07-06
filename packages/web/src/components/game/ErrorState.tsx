'use client';

import React from 'react';

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  onFallback?: () => void;
  className?: string;
}

export function ErrorState({
  error,
  onRetry,
  onFallback,
  className = '',
}: ErrorStateProps) {
  return (
    <div className={`py-12 text-center ${className}`}>
      <p className="text-destructive mb-4 text-sm">{error}</p>
      <div className="flex flex-col items-center gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-primary hover:text-primary/80 text-sm underline"
          >
            Try again
          </button>
        )}
        {onFallback && (
          <button
            onClick={onFallback}
            className="text-muted-foreground hover:text-muted-foreground/80 text-sm underline"
          >
            Use fallback words
          </button>
        )}
      </div>
    </div>
  );
}
