import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TimerDisplay, CompactTimerDisplay } from '../TimerDisplay';
import { useGameStore } from '@/store/useGameStore';

// Mock the game store
vi.mock('@/store/useGameStore');

const mockUseGameStore = useGameStore as any;

describe('TimerDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TimerDisplay', () => {
    it('does not render for non-time modes', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        const state = {
          testConfig: { mode: 'words', duration: 60 },
          timeRemaining: 30000,
          isTimerRunning: false,
          gameStatus: 'ready',
        };
        return selector(state);
      });

      const { container } = render(<TimerDisplay />);
      expect(container.firstChild).toBeNull();
    });

    it('renders time correctly for time mode', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        const state = {
          testConfig: { mode: 'time', duration: 60 },
          timeRemaining: 30000, // 30 seconds
          isTimerRunning: true,
          gameStatus: 'running',
        };
        return selector(state);
      });

      render(<TimerDisplay />);

      expect(screen.getByText('0:30')).toBeInTheDocument();
      expect(screen.getByText('Running')).toBeInTheDocument();
    });

    it('displays seconds only for short duration tests', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        const state = {
          testConfig: { mode: 'time', duration: 30 },
          timeRemaining: 15000, // 15 seconds
          isTimerRunning: true,
          gameStatus: 'running',
        };
        return selector(state);
      });

      render(<TimerDisplay />);

      expect(screen.getByText('15s')).toBeInTheDocument();
    });

    it('shows warning colors for low time', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        const state = {
          testConfig: { mode: 'time', duration: 60 },
          timeRemaining: 5000, // 5 seconds - very low
          isTimerRunning: true,
          gameStatus: 'running',
        };
        return selector(state);
      });

      render(<TimerDisplay />);

      const timerElement = screen.getByText('0:05');
      expect(timerElement).toHaveClass('animate-bounce');
    });

    it('shows different status indicators', () => {
      const statuses = [
        { gameStatus: 'ready', expected: 'Ready' },
        { gameStatus: 'running', expected: 'Running' },
        { gameStatus: 'paused', expected: 'Paused' },
        { gameStatus: 'finished', expected: 'Finished' },
      ];

      statuses.forEach(({ gameStatus, expected }) => {
        mockUseGameStore.mockImplementation((selector: any) => {
          const state = {
            testConfig: { mode: 'time', duration: 60 },
            timeRemaining: 30000,
            isTimerRunning: gameStatus === 'running',
            gameStatus,
          };
          return selector(state);
        });

        render(<TimerDisplay />);
        expect(screen.getByText(expected)).toBeInTheDocument();
      });
    });
  });

  describe('CompactTimerDisplay', () => {
    it('renders compact format correctly', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        const state = {
          testConfig: { mode: 'time', duration: 60 },
          timeRemaining: 25000, // 25 seconds
          gameStatus: 'running',
        };
        return selector(state);
      });

      render(<CompactTimerDisplay />);

      expect(screen.getByText('25s')).toBeInTheDocument();
    });

    it('shows urgency styling for low time', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        const state = {
          testConfig: { mode: 'time', duration: 60 },
          timeRemaining: 8000, // 8 seconds
          gameStatus: 'running',
        };
        return selector(state);
      });

      render(<CompactTimerDisplay />);

      const container = screen.getByText('8s').closest('div');
      expect(container).toHaveClass('animate-pulse');
    });

    it('does not render for non-time modes', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        const state = {
          testConfig: { mode: 'words', duration: 60 },
          timeRemaining: 30000,
          gameStatus: 'ready',
        };
        return selector(state);
      });

      const { container } = render(<CompactTimerDisplay />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Timer formatting', () => {
    it('formats mm:ss correctly for longer durations', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        const state = {
          testConfig: { mode: 'time', duration: 120 },
          timeRemaining: 75000, // 1:15
          isTimerRunning: true,
          gameStatus: 'running',
        };
        return selector(state);
      });

      render(<TimerDisplay />);
      expect(screen.getByText('1:15')).toBeInTheDocument();
    });

    it('pads seconds with zero when needed', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        const state = {
          testConfig: { mode: 'time', duration: 120 },
          timeRemaining: 65000, // 1:05
          isTimerRunning: true,
          gameStatus: 'running',
        };
        return selector(state);
      });

      render(<TimerDisplay />);
      expect(screen.getByText('1:05')).toBeInTheDocument();
    });

    it('handles zero time correctly', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        const state = {
          testConfig: { mode: 'time', duration: 60 },
          timeRemaining: 0,
          isTimerRunning: false,
          gameStatus: 'finished',
        };
        return selector(state);
      });

      render(<TimerDisplay />);
      expect(screen.getByText('0:00')).toBeInTheDocument();
    });
  });
});
