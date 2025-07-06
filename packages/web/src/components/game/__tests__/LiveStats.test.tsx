/**
 * Sprint 9: Comprehensive LiveStats Component Tests
 *
 * Tests for the live statistics display component including:
 * - Conditional rendering based on game status
 * - WPM color coding based on performance
 * - Accuracy color coding based on precision
 * - Mode-specific display logic (time vs words mode)
 * - Elapsed time formatting and display
 * - Responsive styling and accessibility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LiveStats } from '../LiveStats';

// Mock the game store
vi.mock('@/store/useGameStore');

import { useGameStore } from '@/store/useGameStore';

const mockUseGameStore = useGameStore as any;

describe('LiveStats Component Tests', () => {
  const defaultState = {
    gameStatus: 'running',
    stats: {
      wpm: 45,
      accuracy: 95,
      elapsedTime: 30000, // 30 seconds
      totalChars: 100,
      correctChars: 95,
      incorrectChars: 5,
    },
    testConfig: {
      mode: 'time',
      duration: 60,
      difficulty: 'Normal',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Conditional Rendering by Game Status', () => {
    it('should render when game status is running', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultState,
          gameStatus: 'running',
        });
      });

      render(<LiveStats />);

      expect(screen.getByText('WPM')).toBeInTheDocument();
      expect(screen.getByText('Accuracy')).toBeInTheDocument();
    });

    it('should render when game status is finished', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultState,
          gameStatus: 'finished',
        });
      });

      render(<LiveStats />);

      expect(screen.getByText('WPM')).toBeInTheDocument();
      expect(screen.getByText('Accuracy')).toBeInTheDocument();
    });

    it('should not render when game status is ready', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultState,
          gameStatus: 'ready',
        });
      });

      const { container } = render(<LiveStats />);

      expect(container.firstChild).toBeNull();
    });

    it('should not render when game status is paused', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultState,
          gameStatus: 'paused',
        });
      });

      const { container } = render(<LiveStats />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('WPM Color Coding', () => {
    it('should show green color for high WPM (>= 60)', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultState,
          stats: { ...defaultState.stats, wpm: 75 },
        });
      });

      render(<LiveStats />);

      const wpmElement = screen.getByText('75');
      expect(wpmElement).toHaveClass('text-green-600');
    });

    it('should show blue color for good WPM (>= 40, < 60)', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultState,
          stats: { ...defaultState.stats, wpm: 45 },
        });
      });

      render(<LiveStats />);

      const wpmElement = screen.getByText('45');
      expect(wpmElement).toHaveClass('text-blue-600');
    });

    it('should show default color for low WPM (< 40)', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultState,
          stats: { ...defaultState.stats, wpm: 25 },
        });
      });

      render(<LiveStats />);

      const wpmElement = screen.getByText('25');
      expect(wpmElement).toHaveClass('text-foreground');
      expect(wpmElement).not.toHaveClass('text-green-600');
      expect(wpmElement).not.toHaveClass('text-blue-600');
    });

    it('should handle exact WPM boundary values', () => {
      const boundaryTests = [
        { wpm: 60, expectedClass: 'text-green-600' },
        { wpm: 59, expectedClass: 'text-blue-600' },
        { wpm: 40, expectedClass: 'text-blue-600' },
        { wpm: 39, expectedClass: 'text-foreground' },
      ];

      boundaryTests.forEach(({ wpm, expectedClass }) => {
        mockUseGameStore.mockImplementation((selector: any) => {
          return selector({
            ...defaultState,
            stats: { ...defaultState.stats, wpm },
          });
        });

        const { unmount } = render(<LiveStats />);
        const wpmElement = screen.getByText(wpm.toString());
        expect(wpmElement).toHaveClass(expectedClass);
        unmount();
      });
    });
  });

  describe('Accuracy Color Coding', () => {
    it('should show green color for excellent accuracy (>= 95%)', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultState,
          stats: { ...defaultState.stats, accuracy: 97 },
        });
      });

      render(<LiveStats />);

      const accuracyElement = screen.getByText('97%');
      expect(accuracyElement).toHaveClass('text-green-600');
    });

    it('should show yellow color for good accuracy (>= 90%, < 95%)', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultState,
          stats: { ...defaultState.stats, accuracy: 92 },
        });
      });

      render(<LiveStats />);

      const accuracyElement = screen.getByText('92%');
      expect(accuracyElement).toHaveClass('text-yellow-600');
    });

    it('should show red color for poor accuracy (< 90%)', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultState,
          stats: { ...defaultState.stats, accuracy: 85 },
        });
      });

      render(<LiveStats />);

      const accuracyElement = screen.getByText('85%');
      expect(accuracyElement).toHaveClass('text-red-600');
    });

    it('should handle exact accuracy boundary values', () => {
      const boundaryTests = [
        { accuracy: 95, expectedClass: 'text-green-600' },
        { accuracy: 94, expectedClass: 'text-yellow-600' },
        { accuracy: 90, expectedClass: 'text-yellow-600' },
        { accuracy: 89, expectedClass: 'text-red-600' },
      ];

      boundaryTests.forEach(({ accuracy, expectedClass }) => {
        mockUseGameStore.mockImplementation((selector: any) => {
          return selector({
            ...defaultState,
            stats: { ...defaultState.stats, accuracy },
          });
        });

        const { unmount } = render(<LiveStats />);
        const accuracyElement = screen.getByText(`${accuracy}%`);
        expect(accuracyElement).toHaveClass(expectedClass);
        unmount();
      });
    });
  });

  describe('Mode-Specific Display Logic', () => {
    it('should show elapsed time in time mode', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultState,
          testConfig: { ...defaultState.testConfig, mode: 'time' },
          stats: { ...defaultState.stats, elapsedTime: 45000 }, // 45 seconds
        });
      });

      render(<LiveStats />);

      expect(screen.getByText('45s')).toBeInTheDocument();
      expect(screen.getByText('Elapsed')).toBeInTheDocument();
    });

    it('should show elapsed time in words mode', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultState,
          testConfig: { ...defaultState.testConfig, mode: 'words' },
          stats: { ...defaultState.stats, elapsedTime: 32000 }, // 32 seconds
        });
      });

      render(<LiveStats />);

      expect(screen.getByText('32s')).toBeInTheDocument();
      expect(screen.getByText('Elapsed')).toBeInTheDocument();
    });

    it('should not show extra time display in quote mode', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultState,
          testConfig: { ...defaultState.testConfig, mode: 'quote' },
          stats: { ...defaultState.stats, elapsedTime: 30000 },
        });
      });

      render(<LiveStats />);

      // Should only show WPM and Accuracy, no elapsed time
      expect(screen.getByText('WPM')).toBeInTheDocument();
      expect(screen.getByText('Accuracy')).toBeInTheDocument();
      expect(screen.queryByText('Elapsed')).not.toBeInTheDocument();
    });
  });

  describe('Elapsed Time Formatting', () => {
    it('should format elapsed time correctly for various durations', () => {
      const timeTests = [
        { elapsedTime: 5500, expected: '5s' }, // 5.5 seconds -> 5s
        { elapsedTime: 30000, expected: '30s' }, // 30 seconds
        { elapsedTime: 61200, expected: '61s' }, // 61.2 seconds -> 61s
        { elapsedTime: 120000, expected: '120s' }, // 2 minutes
        { elapsedTime: 0, expected: '0s' }, // Zero time
      ];

      timeTests.forEach(({ elapsedTime, expected }) => {
        mockUseGameStore.mockImplementation((selector: any) => {
          return selector({
            ...defaultState,
            testConfig: { ...defaultState.testConfig, mode: 'time' },
            stats: { ...defaultState.stats, elapsedTime },
          });
        });

        const { unmount } = render(<LiveStats />);
        expect(screen.getByText(expected)).toBeInTheDocument();
        unmount();
      });
    });

    it('should handle negative elapsed time gracefully', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultState,
          testConfig: { ...defaultState.testConfig, mode: 'time' },
          stats: { ...defaultState.stats, elapsedTime: -1000 },
        });
      });

      render(<LiveStats />);

      // Math.floor(-1) = -1, so it should show -1s
      expect(screen.getByText('-1s')).toBeInTheDocument();
    });
  });

  describe('Statistics Display Accuracy', () => {
    it('should display all statistics with correct values', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultState,
          stats: {
            wpm: 72,
            accuracy: 96,
            elapsedTime: 45000,
            totalChars: 200,
            correctChars: 192,
            incorrectChars: 8,
          },
          testConfig: { ...defaultState.testConfig, mode: 'time' },
        });
      });

      render(<LiveStats />);

      expect(screen.getByText('72')).toBeInTheDocument();
      expect(screen.getByText('96%')).toBeInTheDocument();
      expect(screen.getByText('45s')).toBeInTheDocument();
    });

    it('should handle zero values correctly', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultState,
          stats: {
            wpm: 0,
            accuracy: 0,
            elapsedTime: 0,
            totalChars: 0,
            correctChars: 0,
            incorrectChars: 0,
          },
          testConfig: { ...defaultState.testConfig, mode: 'time' },
        });
      });

      render(<LiveStats />);

      expect(screen.getByText('0')).toBeInTheDocument(); // WPM
      expect(screen.getByText('0%')).toBeInTheDocument(); // Accuracy
      expect(screen.getByText('0s')).toBeInTheDocument(); // Elapsed time
    });

    it('should handle extreme values correctly', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultState,
          stats: {
            wpm: 999,
            accuracy: 100,
            elapsedTime: 999999,
            totalChars: 5000,
            correctChars: 5000,
            incorrectChars: 0,
          },
          testConfig: { ...defaultState.testConfig, mode: 'time' },
        });
      });

      render(<LiveStats />);

      expect(screen.getByText('999')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('999s')).toBeInTheDocument();
    });
  });

  describe('Component Styling and Responsiveness', () => {
    it('should have correct CSS classes for responsive design', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector(defaultState);
      });

      render(<LiveStats />);

      const wpmElement = screen.getByText('45');
      const accuracyElement = screen.getByText('95%');

      // Check for responsive text sizing
      expect(wpmElement).toHaveClass('text-xl', 'sm:text-2xl');
      expect(accuracyElement).toHaveClass('text-xl', 'sm:text-2xl');

      // Check for monospace font
      expect(wpmElement).toHaveClass('font-mono');
      expect(accuracyElement).toHaveClass('font-mono');
    });

    it('should have proper layout structure', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector(defaultState);
      });

      const { container } = render(<LiveStats />);

      // Check for main container with proper gap classes
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass(
        'flex',
        'justify-center',
        'gap-4',
        'sm:gap-6'
      );
    });

    it('should have accessible text styling for labels', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector(defaultState);
      });

      render(<LiveStats />);

      const wpmLabel = screen.getByText('WPM');
      const accuracyLabel = screen.getByText('Accuracy');

      expect(wpmLabel).toHaveClass(
        'text-xs',
        'text-muted-foreground',
        'uppercase',
        'tracking-wide'
      );
      expect(accuracyLabel).toHaveClass(
        'text-xs',
        'text-muted-foreground',
        'uppercase',
        'tracking-wide'
      );
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined or missing stats gracefully', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          gameStatus: 'running',
          stats: {
            wpm: undefined,
            accuracy: undefined,
            elapsedTime: undefined,
          },
          testConfig: { mode: 'time' },
        });
      });

      render(<LiveStats />);

      // Should still render without crashing
      expect(screen.getByText('WPM')).toBeInTheDocument();
      expect(screen.getByText('Accuracy')).toBeInTheDocument();
    });

    it('should handle decimal values correctly', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultState,
          stats: {
            wpm: 72.8, // Should display as 72.8
            accuracy: 96.7, // Should display as 96.7%
            elapsedTime: 45500, // Should floor to 45s
          },
          testConfig: { ...defaultState.testConfig, mode: 'time' },
        });
      });

      render(<LiveStats />);

      expect(screen.getByText('72.8')).toBeInTheDocument();
      expect(screen.getByText('96.7%')).toBeInTheDocument();
      expect(screen.getByText('45s')).toBeInTheDocument(); // Floored
    });

    it('should handle different mode transitions correctly', () => {
      // Start with time mode
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultState,
          testConfig: { ...defaultState.testConfig, mode: 'time' },
        });
      });

      const { rerender } = render(<LiveStats />);

      expect(screen.getByText('Elapsed')).toBeInTheDocument();

      // Switch to words mode
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultState,
          testConfig: { ...defaultState.testConfig, mode: 'words' },
        });
      });

      rerender(<LiveStats />);

      expect(screen.getByText('Elapsed')).toBeInTheDocument();

      // Switch to quote mode
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultState,
          testConfig: { ...defaultState.testConfig, mode: 'quote' },
        });
      });

      rerender(<LiveStats />);

      expect(screen.queryByText('Elapsed')).not.toBeInTheDocument();
    });
  });
});
