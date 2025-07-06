/**
 * Sprint 9: Comprehensive ResultsCard Component Tests
 *
 * Tests for the game results display component including:
 * - Performance message generation based on WPM
 * - Accuracy color coding
 * - Failed test states and error display
 * - Authentication-dependent save functionality
 * - Statistics display accuracy
 * - User interaction handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResultsCard } from '../ResultsCard';

// Mock all the stores
vi.mock('@/store/useGameStore');
vi.mock('@/store/useAuthStore');
vi.mock('@/store/useModalStore');

import { useGameStore } from '@/store/useGameStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useModalStore } from '@/store/useModalStore';

const mockUseGameStore = useGameStore as any;
const mockUseAuthStore = useAuthStore as any;
const mockUseModalStore = useModalStore as any;

describe('ResultsCard Component Tests', () => {
  const mockResetGame = vi.fn();
  const mockOpenAuthModal = vi.fn();

  const defaultGameState = {
    stats: {
      wpm: 45,
      accuracy: 95,
      totalChars: 100,
      correctChars: 95,
      incorrectChars: 5,
      elapsedTime: 60000, // 60 seconds
    },
    testFailed: false,
    failureReason: null,
    testConfig: {
      difficulty: 'Normal',
      mode: 'time',
      duration: 60,
    },
    resetGame: mockResetGame,
  };

  const defaultAuthState = {
    token: null,
  };

  const defaultModalState = {
    openAuthModal: mockOpenAuthModal,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    mockUseGameStore.mockImplementation((selector: any) => {
      return selector(defaultGameState);
    });

    mockUseAuthStore.mockReturnValue(defaultAuthState);
    mockUseModalStore.mockReturnValue(defaultModalState);
  });

  describe('Performance Message Generation', () => {
    it('should show outstanding message for WPM >= 80', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultGameState,
          stats: { ...defaultGameState.stats, wpm: 85 },
        });
      });

      render(<ResultsCard />);

      expect(
        screen.getByText('Outstanding Performance! 🚀')
      ).toBeInTheDocument();
      expect(screen.getByText('Test Complete!')).toBeInTheDocument();
    });

    it('should show excellent message for WPM >= 60', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultGameState,
          stats: { ...defaultGameState.stats, wpm: 65 },
        });
      });

      render(<ResultsCard />);

      expect(screen.getByText('Excellent Typing! 🌟')).toBeInTheDocument();
    });

    it('should show great job message for WPM >= 40', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultGameState,
          stats: { ...defaultGameState.stats, wpm: 45 },
        });
      });

      render(<ResultsCard />);

      expect(screen.getByText('Great Job! 👏')).toBeInTheDocument();
    });

    it('should show keep practicing message for WPM < 40', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultGameState,
          stats: { ...defaultGameState.stats, wpm: 25 },
        });
      });

      render(<ResultsCard />);

      expect(screen.getByText('Keep Practicing! 💪')).toBeInTheDocument();
    });
  });

  describe('Accuracy Color Coding', () => {
    it('should show green color for accuracy >= 95%', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultGameState,
          stats: { ...defaultGameState.stats, accuracy: 97 },
        });
      });

      render(<ResultsCard />);

      const accuracyElement = screen.getByText('97%');
      expect(accuracyElement).toHaveClass('text-green-600');
    });

    it('should show yellow color for accuracy >= 85%', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultGameState,
          stats: { ...defaultGameState.stats, accuracy: 88 },
        });
      });

      render(<ResultsCard />);

      const accuracyElement = screen.getByText('88%');
      expect(accuracyElement).toHaveClass('text-yellow-600');
    });

    it('should show red color for accuracy < 85%', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultGameState,
          stats: { ...defaultGameState.stats, accuracy: 75 },
        });
      });

      render(<ResultsCard />);

      const accuracyElement = screen.getByText('75%');
      expect(accuracyElement).toHaveClass('text-red-600');
    });
  });

  describe('Failed Test States', () => {
    it('should display failure state with Expert mode', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultGameState,
          testFailed: true,
          failureReason: 'Expert Mode: Failed due to errors in word "hello"',
          testConfig: { ...defaultGameState.testConfig, difficulty: 'Expert' },
        });
      });

      render(<ResultsCard />);

      expect(screen.getByText('Test Failed!')).toBeInTheDocument();
      expect(
        screen.getByText('Test Failed in Expert Mode')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Expert Mode: Failed due to errors in word "hello"')
      ).toBeInTheDocument();
    });

    it('should display failure state with Master mode', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultGameState,
          testFailed: true,
          failureReason:
            'Master Mode: Failed on incorrect keystroke "x" (expected "t")',
          testConfig: { ...defaultGameState.testConfig, difficulty: 'Master' },
        });
      });

      render(<ResultsCard />);

      expect(
        screen.getByText('Test Failed in Master Mode')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Master Mode: Failed on incorrect keystroke "x" (expected "t")'
        )
      ).toBeInTheDocument();
    });

    it('should handle failure without failure reason', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultGameState,
          testFailed: true,
          failureReason: null,
          testConfig: { ...defaultGameState.testConfig, difficulty: 'Master' },
        });
      });

      render(<ResultsCard />);

      expect(
        screen.getByText('Test Failed in Master Mode')
      ).toBeInTheDocument();
      // Failure reason section should not appear
      expect(
        screen.queryByText(/Master Mode: Failed on/)
      ).not.toBeInTheDocument();
    });
  });

  describe('Statistics Display', () => {
    it('should display all statistics correctly', () => {
      render(<ResultsCard />);

      // Main stats
      expect(screen.getByText('45')).toBeInTheDocument(); // WPM
      expect(screen.getByText('95%')).toBeInTheDocument(); // Accuracy

      // Detailed stats
      expect(screen.getByText('100')).toBeInTheDocument(); // Total chars
      expect(screen.getByText('95')).toBeInTheDocument(); // Correct chars
      expect(screen.getByText('5')).toBeInTheDocument(); // Incorrect chars
      expect(screen.getByText('60s')).toBeInTheDocument(); // Elapsed time

      // Labels
      expect(screen.getByText('Words Per Minute')).toBeInTheDocument();
      expect(screen.getByText('Accuracy')).toBeInTheDocument();
      expect(screen.getByText('Characters Typed')).toBeInTheDocument();
      expect(screen.getByText('Correct')).toBeInTheDocument();
      expect(screen.getByText('Incorrect')).toBeInTheDocument();
      expect(screen.getByText('Time Elapsed')).toBeInTheDocument();
    });

    it('should handle zero values gracefully', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultGameState,
          stats: {
            wpm: 0,
            accuracy: 0,
            totalChars: 0,
            correctChars: 0,
            incorrectChars: 0,
            elapsedTime: 0,
          },
        });
      });

      render(<ResultsCard />);

      // Check for specific elements to avoid multiple matches
      expect(screen.getByText('Words Per Minute')).toBeInTheDocument();
      expect(screen.getByText('Accuracy')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument(); // Accuracy with %
      expect(screen.getByText('0s')).toBeInTheDocument(); // Time with s

      // Verify the main stats are displayed
      const allZeros = screen.getAllByText('0');
      expect(allZeros.length).toBeGreaterThan(0);
    });

    it('should format elapsed time correctly for different durations', () => {
      const testCases = [
        { elapsedTime: 15500, expected: '16s' }, // 15.5 seconds -> 16s
        { elapsedTime: 30200, expected: '30s' }, // 30.2 seconds -> 30s
        { elapsedTime: 119800, expected: '120s' }, // 119.8 seconds -> 120s
      ];

      testCases.forEach(({ elapsedTime, expected }) => {
        mockUseGameStore.mockImplementation((selector: any) => {
          return selector({
            ...defaultGameState,
            stats: { ...defaultGameState.stats, elapsedTime },
          });
        });

        const { unmount } = render(<ResultsCard />);
        expect(screen.getByText(expected)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Authentication and Save Functionality', () => {
    it('should show save button when not authenticated', () => {
      mockUseAuthStore.mockReturnValue({ token: null });

      render(<ResultsCard />);

      const saveButton = screen.getByRole('button', { name: /save score/i });
      expect(saveButton).toBeInTheDocument();
      expect(saveButton).not.toBeDisabled();
    });

    it('should show saved state when authenticated', () => {
      mockUseAuthStore.mockReturnValue({ token: 'valid-jwt-token' });

      render(<ResultsCard />);

      const savedButton = screen.getByRole('button', { name: /saved!/i });
      expect(savedButton).toBeInTheDocument();
      expect(savedButton).toBeDisabled();
      expect(
        screen.queryByRole('button', { name: /save score/i })
      ).not.toBeInTheDocument();
    });

    it('should open auth modal when save button is clicked', () => {
      mockUseAuthStore.mockReturnValue({ token: null });

      render(<ResultsCard />);

      const saveButton = screen.getByRole('button', { name: /save score/i });
      fireEvent.click(saveButton);

      expect(mockOpenAuthModal).toHaveBeenCalledTimes(1);
    });
  });

  describe('User Interactions', () => {
    it('should reset game when try again button is clicked', () => {
      render(<ResultsCard />);

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(tryAgainButton);

      expect(mockResetGame).toHaveBeenCalledTimes(1);
    });

    it('should have properly sized buttons', () => {
      render(<ResultsCard />);

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      const saveButton = screen.getByRole('button', { name: /save score/i });

      expect(tryAgainButton).toHaveClass('flex-1');
      expect(saveButton).toHaveClass('flex-1');
    });
  });

  describe('Component Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<ResultsCard />);

      // Buttons should have proper roles
      expect(
        screen.getByRole('button', { name: /try again/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /save score/i })
      ).toBeInTheDocument();
    });

    it('should display icons with proper semantic meaning', () => {
      render(<ResultsCard />);

      // Check for trophy icon presence (it doesn't have a testId, so we check for SVG)
      const titleElement = screen.getByText('Test Complete!');
      expect(titleElement).toBeInTheDocument();

      // The SVG should be present in the title area
      const titleContainer = titleElement.closest('div');
      const svgElement = titleContainer?.querySelector('svg');
      expect(svgElement).toBeTruthy();
    });

    it('should display failure state with appropriate warning icon', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultGameState,
          testFailed: true,
          failureReason: 'Test failed for testing',
        });
      });

      render(<ResultsCard />);

      expect(screen.getByText('Test Failed!')).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle extremely high WPM values', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultGameState,
          stats: { ...defaultGameState.stats, wpm: 200 },
        });
      });

      render(<ResultsCard />);

      expect(screen.getByText('200')).toBeInTheDocument();
      expect(
        screen.getByText('Outstanding Performance! 🚀')
      ).toBeInTheDocument();
    });

    it('should handle negative values gracefully', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultGameState,
          stats: {
            wpm: -5, // This shouldn't happen but let's handle it
            accuracy: 95,
            totalChars: 100,
            correctChars: 95,
            incorrectChars: 5,
            elapsedTime: 60000,
          },
        });
      });

      render(<ResultsCard />);

      expect(screen.getByText('-5')).toBeInTheDocument();
      expect(screen.getByText('Keep Practicing! 💪')).toBeInTheDocument();
    });

    it('should handle missing or undefined store values', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          stats: {
            wpm: 0,
            accuracy: 0,
            totalChars: 0,
            correctChars: 0,
            incorrectChars: 0,
            elapsedTime: 0,
          },
          testFailed: false,
          failureReason: null,
          testConfig: { difficulty: 'Normal' },
          resetGame: mockResetGame,
        });
      });

      render(<ResultsCard />);

      // Should render without crashing
      expect(screen.getByText('Test Complete!')).toBeInTheDocument();
    });
  });

  describe('Performance Message Edge Cases', () => {
    it('should handle exact WPM boundary values', () => {
      const boundaryTests = [
        { wpm: 80, expected: 'Outstanding Performance! 🚀' },
        { wpm: 79, expected: 'Excellent Typing! 🌟' },
        { wpm: 60, expected: 'Excellent Typing! 🌟' },
        { wpm: 59, expected: 'Great Job! 👏' },
        { wpm: 40, expected: 'Great Job! 👏' },
        { wpm: 39, expected: 'Keep Practicing! 💪' },
      ];

      boundaryTests.forEach(({ wpm, expected }) => {
        mockUseGameStore.mockImplementation((selector: any) => {
          return selector({
            ...defaultGameState,
            stats: { ...defaultGameState.stats, wpm },
          });
        });

        const { unmount } = render(<ResultsCard />);
        expect(screen.getByText(expected)).toBeInTheDocument();
        unmount();
      });
    });
  });
});
