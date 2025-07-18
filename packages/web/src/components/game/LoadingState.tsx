'use client';

import React from 'react';
import { Loader2, Clock, BookOpen, Zap } from 'lucide-react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  className?: string;
  variant?: 'default' | 'preparing' | 'typing' | 'processing';
  showProgress?: boolean;
  progress?: number; // 0-100
}

export function LoadingState({
  message = 'Loading...',
  className = '',
  variant = 'default',
  showProgress = false,
  progress = 0,
}: LoadingStateProps) {
  const { isMobile } = useDeviceDetection();

  const getIcon = () => {
    switch (variant) {
      case 'preparing':
        return (
          <BookOpen
            className={cn(
              'text-info animate-pulse',
              isMobile ? 'h-6 w-6' : 'h-8 w-8'
            )}
          />
        );
      case 'typing':
        return (
          <Zap
            className={cn(
              'text-success animate-pulse',
              isMobile ? 'h-6 w-6' : 'h-8 w-8'
            )}
          />
        );
      case 'processing':
        return (
          <Clock
            className={cn(
              'text-warning animate-spin',
              isMobile ? 'h-6 w-6' : 'h-8 w-8'
            )}
          />
        );
      default:
        return (
          <Loader2
            className={cn(
              'text-primary animate-spin',
              isMobile ? 'h-6 w-6' : 'h-8 w-8'
            )}
          />
        );
    }
  };

  const getLoadingMessages = () => {
    const messages = {
      preparing: [
        'Preparing your typing challenge...',
        'Selecting words for your level...',
        'Setting up your practice session...',
      ],
      typing: [
        'Processing your input...',
        'Calculating your performance...',
        'Analyzing your typing patterns...',
      ],
      processing: [
        'Saving your results...',
        'Updating your statistics...',
        'Finalizing your session...',
      ],
      default: ['Loading...', 'Please wait...', 'Getting things ready...'],
    };
    return messages[variant] || messages.default;
  };

  // Cycle through different loading messages for better UX
  const [messageIndex, setMessageIndex] = React.useState(0);
  const loadingMessages = getLoadingMessages();

  React.useEffect(() => {
    if (loadingMessages.length > 1) {
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [loadingMessages.length]);

  const currentMessage =
    message === 'Loading...' ? loadingMessages[messageIndex] : message;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center space-y-4',
        isMobile ? 'py-8' : 'py-12',
        className
      )}
    >
      {/* Loading Icon */}
      <div className="flex items-center justify-center">{getIcon()}</div>

      {/* Progress Bar (if enabled) */}
      {showProgress && (
        <div className="w-full max-w-xs">
          <div className="bg-muted h-2 w-full rounded-full">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <p className="text-muted-foreground mt-2 text-center text-xs">
            {Math.round(progress)}% complete
          </p>
        </div>
      )}

      {/* Loading Message */}
      <div className="space-y-1 text-center">
        <p
          className={cn(
            'text-muted-foreground font-medium',
            isMobile ? 'text-sm' : 'text-base'
          )}
        >
          {currentMessage}
        </p>

        {/* Additional context for longer loads */}
        {variant === 'preparing' && (
          <p className="text-muted-foreground/75 text-xs">
            This may take a few seconds for optimal word selection
          </p>
        )}
      </div>

      {/* Pulse Animation for Visual Interest */}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'bg-primary/30 rounded-full',
              isMobile ? 'h-2 w-2' : 'h-3 w-3'
            )}
            style={{
              animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
