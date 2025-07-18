import { useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';

/**
 * Custom hook to handle timer cleanup when component unmounts
 * Prevents memory leaks from lingering timers
 */
export function useTimerCleanup() {
  const clearTimer = useGameStore((state) => state.clearTimer);

  useEffect(() => {
    // Cleanup function runs when component unmounts
    return () => {
      clearTimer();
    };
  }, [clearTimer]);
}

/**
 * Custom hook to handle page visibility changes
 * Pauses timer when page becomes hidden, resumes when visible
 */
export function useTimerVisibility() {
  const gameStatus = useGameStore((state) => state.gameStatus);
  const isTimerRunning = useGameStore((state) => state.isTimerRunning);
  const pauseTimer = useGameStore((state) => state.pauseTimer);
  const startTimer = useGameStore((state) => state.startTimer);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (gameStatus === 'running') {
        if (document.hidden && isTimerRunning) {
          // Page became hidden, pause timer
          pauseTimer();
        } else if (!document.hidden && !isTimerRunning) {
          // Page became visible, resume timer
          startTimer();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [gameStatus, isTimerRunning, pauseTimer, startTimer]);
}
