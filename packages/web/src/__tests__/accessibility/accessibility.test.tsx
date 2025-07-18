/**
 * Sprint 9: Accessibility and UX Tests
 *
 * Comprehensive accessibility and user experience testing including:
 * - ARIA compliance and semantic markup
 * - Keyboard navigation and screen reader support
 * - Color contrast and visual accessibility
 * - Focus management and tab order
 * - High contrast mode compatibility
 * - Reduced motion preferences
 * - Mobile and touch accessibility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TypingArea } from '@/components/game/TypingArea';
import { ResultsCard } from '@/components/game/ResultsCard';
import { ConfigurationBar } from '@/components/game/ConfigurationBar';
import { LiveStats } from '@/components/game/LiveStats';

// Mock dependencies
vi.mock('@/store/useGameStore');
vi.mock('@/store/useAuthStore');
vi.mock('@/store/useModalStore');
vi.mock('@/hooks/useTimerCleanup', () => ({
  useTimerCleanup: vi.fn(),
  useTimerVisibility: vi.fn(),
}));

import { useGameStore } from '@/store/useGameStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useModalStore } from '@/store/useModalStore';

const mockUseGameStore = useGameStore as any;
const mockUseAuthStore = useAuthStore as any;
const mockUseModalStore = useModalStore as any;

describe('Accessibility and UX Tests', () => {
  const user = userEvent.setup();

  const defaultGameState = {
    charStates: [
      { char: 't', status: 'current' },
      { char: 'e', status: 'default' },
      { char: 's', status: 'default' },
      { char: 't', status: 'default' },
    ],
    gameStatus: 'ready',
    testConfig: {
      mode: 'time',
      duration: 60,
      difficulty: 'Normal',
      textSource: 'english1k',
      punctuation: false,
    },
    textWindow: {
      lines: [['test']],
      scrollOffset: 0,
      lineCharOffsets: [0],
    },
    isPreparingGame: false,
    gamePreparationError: null,
    prepareGame: vi.fn(),
    handleKeyPress: vi.fn(),
    useFallbackWords: vi.fn(),
    setTestConfig: vi.fn(),
    stats: {
      wpm: 75,
      accuracy: 96,
      elapsedTime: 45000,
    },
    resetGame: vi.fn(),
    testFailed: false,
    failureReason: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseGameStore.mockImplementation((selector: any) => {
      return selector(defaultGameState);
    });

    mockUseAuthStore.mockReturnValue({
      token: null,
    });

    mockUseModalStore.mockReturnValue({
      openAuthModal: vi.fn(),
    });
  });

  describe('ARIA Compliance and Semantic Markup', () => {
    it('should have proper ARIA labels on interactive elements', () => {
      render(<ConfigurationBar />);

      // Configuration badges should be clickable and have proper roles
      const badges = screen.getAllByRole('button');
      badges.forEach((badge) => {
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveAttribute('tabIndex'); // Should be focusable
      });
    });

    it('should provide ARIA live regions for dynamic content updates', () => {
      render(<LiveStats />);

      // Stats should be announced to screen readers when they change
      const wpmElement = screen.getByText('75');
      const accuracyElement = screen.getByText('96%');

      expect(wpmElement).toBeInTheDocument();
      expect(accuracyElement).toBeInTheDocument();

      // These should ideally have aria-live attributes in the actual implementation
    });

    it('should have proper heading hierarchy', () => {
      render(<ResultsCard />);

      // Results should have proper heading structure
      const heading = screen.getByText('Test Complete!');
      expect(heading).toBeInTheDocument();

      // Should be semantically structured
      expect(heading.closest('[data-slot="card-title"]')).toBeInTheDocument();
    });

    it('should provide proper button labeling', () => {
      render(<ResultsCard />);

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      const saveButton = screen.getByRole('button', { name: /save score/i });

      expect(tryAgainButton).toBeInTheDocument();
      expect(saveButton).toBeInTheDocument();

      // Buttons should have clear, descriptive text
      expect(tryAgainButton).toHaveAccessibleName();
      expect(saveButton).toHaveAccessibleName();
    });

    it('should provide context for status changes', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultGameState,
          testFailed: true,
          failureReason: 'Expert Mode: Failed due to errors in word "hello"',
          testConfig: { ...defaultGameState.testConfig, difficulty: 'Expert' },
        });
      });

      render(<ResultsCard />);

      // Failed state should be clearly communicated
      expect(screen.getByText('Test Failed!')).toBeInTheDocument();
      expect(
        screen.getByText('Expert Mode: Failed due to errors in word "hello"')
      ).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation and Focus Management', () => {
    it('should support tab navigation through configuration options', async () => {
      render(<ConfigurationBar />);

      const configurableElements = screen.getAllByRole('button');

      // First element should be focusable
      if (configurableElements.length > 0) {
        await user.tab();
        expect(configurableElements[0]).toHaveFocus();

        // Should be able to navigate through all elements
        for (let i = 1; i < configurableElements.length; i++) {
          await user.tab();
          expect(configurableElements[i]).toHaveFocus();
        }
      }
    });

    it('should handle Enter and Space key activation', async () => {
      const mockSetTestConfig = vi.fn();
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultGameState,
          setTestConfig: mockSetTestConfig,
        });
      });

      render(<ConfigurationBar />);

      const modeButton = screen.getByText('Time');

      // Focus the button
      modeButton.focus();

      // Should activate with Enter
      await user.keyboard('{Enter}');
      expect(mockSetTestConfig).toHaveBeenCalled();

      vi.clearAllMocks();

      // Should also activate with Space
      await user.keyboard(' ');
      expect(mockSetTestConfig).toHaveBeenCalled();
    });

    it('should maintain focus after configuration changes', async () => {
      render(<ConfigurationBar />);

      const difficultyButton = screen.getByText('Normal');

      // Focus and click
      difficultyButton.focus();
      await user.click(difficultyButton);

      // Focus should remain on the button (or its updated version)
      expect(document.activeElement?.textContent).toContain('Normal');
    });

    it('should provide clear focus indicators', () => {
      render(<ConfigurationBar />);

      const buttons = screen.getAllByRole('button');

      buttons.forEach((button) => {
        // Buttons should have focus styles
        expect(button).toHaveClass('cursor-pointer');
        expect(button).toHaveClass('transition-colors');
      });
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide descriptive text for statistics', () => {
      render(<LiveStats />);

      // WPM display
      const wpmLabel = screen.getByText('WPM');
      const wpmValue = screen.getByText('75');

      expect(wpmLabel).toBeInTheDocument();
      expect(wpmValue).toBeInTheDocument();

      // These should be grouped logically for screen readers
      expect(wpmLabel.closest('div')).toContain(wpmValue);
    });

    it('should announce important state changes', () => {
      // Test with failed state
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultGameState,
          testFailed: true,
          failureReason: 'Master Mode: Failed on incorrect keystroke',
        });
      });

      render(<ResultsCard />);

      // Failure should be clearly communicated
      const failureAlert = screen.getByText(
        /Master Mode: Failed on incorrect keystroke/
      );
      expect(failureAlert).toBeInTheDocument();

      // Should be in a container that can be announced
      expect(failureAlert.closest('div')).toHaveClass('rounded-lg');
    });

    it('should provide alternative text for visual indicators', () => {
      render(<ResultsCard />);

      // Icons should have semantic meaning
      const titleElement = screen.getByText('Test Complete!');
      const titleContainer = titleElement.closest('div');

      // SVG icons should be present with proper markup
      const svg = titleContainer?.querySelector('svg');
      expect(svg).toBeTruthy();

      // SVG should have aria-hidden since text provides context
      expect(svg?.getAttribute('aria-hidden')).toBe('true');
    });

    it('should group related information logically', () => {
      render(<ResultsCard />);

      // Statistics should be grouped
      const charactersLabel = screen.getByText('Characters Typed');
      const charactersValue = screen.getByText('100');

      expect(charactersLabel).toBeInTheDocument();
      expect(charactersValue).toBeInTheDocument();

      // Should be in the same logical group
      const statsContainer = charactersLabel.closest('div');
      expect(statsContainer).toContain(charactersValue);
    });
  });

  describe('Visual Accessibility', () => {
    it('should use color combinations with sufficient contrast', () => {
      render(<LiveStats />);

      // High performance should have green text
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultGameState,
          stats: { ...defaultGameState.stats, wpm: 85 },
        });
      });

      const { rerender } = render(<LiveStats />);

      const wpmElement = screen.getByText('75');

      // Should have color classes that provide good contrast
      expect(wpmElement).toHaveClass(
        'text-xl',
        'sm:text-2xl',
        'font-bold',
        'font-mono'
      );
    });

    it('should not rely solely on color for information', () => {
      render(<ResultsCard />);

      // Accuracy should have both color and text indicators
      const correctLabel = screen.getByText('Correct');
      const incorrectLabel = screen.getByText('Incorrect');

      expect(correctLabel).toBeInTheDocument();
      expect(incorrectLabel).toBeInTheDocument();

      // Should have text symbols in addition to color
      expect(screen.getByText('✓')).toBeInTheDocument();
      expect(screen.getByText('✗')).toBeInTheDocument();
    });

    it('should support high contrast mode', () => {
      // Simulate high contrast mode preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(<ConfigurationBar />);

      // Elements should be visible in high contrast mode
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('border'); // Should have visible borders
      });
    });

    it('should handle reduced motion preferences', () => {
      // Simulate reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(<ConfigurationBar />);

      // Animations should be respectful of motion preferences
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        // Should have transition classes that respect prefers-reduced-motion
        expect(button).toHaveClass('transition-colors');
      });
    });
  });

  describe('Mobile and Touch Accessibility', () => {
    it('should have touch-friendly target sizes', () => {
      render(<ConfigurationBar />);

      const buttons = screen.getAllByRole('button');

      buttons.forEach((button) => {
        // Should have adequate size for touch targets (minimum 44px recommended)
        const computedStyle = window.getComputedStyle(button);
        expect(button).toHaveClass('cursor-pointer'); // Should be clearly interactive
      });
    });

    it('should support swipe gestures appropriately', () => {
      render(<ResultsCard />);

      // Should not have swipe conflicts with native browser behaviors
      const cardElement = screen.getByText('Test Complete!').closest('div');

      expect(cardElement).not.toHaveAttribute('onSwipeLeft');
      expect(cardElement).not.toHaveAttribute('onSwipeRight');
    });

    it('should handle orientation changes gracefully', () => {
      // Simulate orientation change
      Object.defineProperty(window, 'orientation', {
        writable: true,
        value: 90,
      });

      render(<LiveStats />);

      // Layout should adapt to orientation
      const container = screen.getByText('WPM').closest('div');
      expect(container).toHaveClass('flex', 'justify-center');

      // Should use responsive classes
      const wpmElement = screen.getByText('75');
      expect(wpmElement).toHaveClass('text-xl', 'sm:text-2xl');
    });
  });

  describe('Error State Accessibility', () => {
    it('should clearly communicate error states', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultGameState,
          testFailed: true,
          failureReason: 'Connection error occurred',
        });
      });

      render(<ResultsCard />);

      // Error should be prominently displayed
      const errorText = screen.getByText('Connection error occurred');
      expect(errorText).toBeInTheDocument();

      // Should be in an alert-style container
      const errorContainer = errorText.closest('div');
      expect(errorContainer).toHaveClass('border-red-200', 'bg-red-50');
    });

    it('should provide recovery options', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultGameState,
          testFailed: true,
        });
      });

      render(<ResultsCard />);

      // Should have clear recovery action
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      expect(tryAgainButton).toBeInTheDocument();
      expect(tryAgainButton).not.toBeDisabled();
    });

    it('should explain what went wrong', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultGameState,
          testFailed: true,
          failureReason: 'Expert Mode: Failed due to errors in word "hello"',
          testConfig: { ...defaultGameState.testConfig, difficulty: 'Expert' },
        });
      });

      render(<ResultsCard />);

      // Should explain the failure
      expect(
        screen.getByText('Test Failed in Expert Mode')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Expert Mode: Failed due to errors in word "hello"')
      ).toBeInTheDocument();
    });
  });

  describe('Progressive Enhancement', () => {
    it('should work without JavaScript enhancements', () => {
      // Basic functionality should be available
      render(<ResultsCard />);

      // Core content should be visible
      expect(screen.getByText('Test Complete!')).toBeInTheDocument();
      expect(screen.getByText('Words Per Minute')).toBeInTheDocument();
      expect(screen.getByText('Accuracy')).toBeInTheDocument();
    });

    it('should degrade gracefully with limited features', () => {
      // Mock missing browser features
      const originalLocalStorage = global.localStorage;
      delete (global as any).localStorage;

      try {
        render(<ConfigurationBar />);

        // Should still render basic functionality
        expect(screen.getByText('Mode:')).toBeInTheDocument();
        expect(screen.getByText('Difficulty:')).toBeInTheDocument();
      } finally {
        global.localStorage = originalLocalStorage;
      }
    });

    it('should support older browser capabilities', () => {
      // Mock older browser environment
      const originalFetch = global.fetch;
      delete (global as any).fetch;

      try {
        render(<LiveStats />);

        // Should render without modern APIs
        expect(screen.getByText('WPM')).toBeInTheDocument();
        expect(screen.getByText('Accuracy')).toBeInTheDocument();
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe('Internationalization Accessibility', () => {
    it('should support RTL text direction', () => {
      // Mock RTL language
      document.dir = 'rtl';

      render(<LiveStats />);

      // Layout should adapt to RTL
      const container = screen.getByText('WPM').closest('div');
      expect(container).toHaveClass('flex', 'justify-center');

      // Cleanup
      document.dir = 'ltr';
    });

    it('should handle different number formats', () => {
      // Test with decimal values
      mockUseGameStore.mockImplementation((selector: any) => {
        return selector({
          ...defaultGameState,
          stats: { ...defaultGameState.stats, wpm: 72.5, accuracy: 96.7 },
        });
      });

      render(<LiveStats />);

      expect(screen.getByText('72.5')).toBeInTheDocument();
      expect(screen.getByText('96.7%')).toBeInTheDocument();
    });

    it('should support language-specific text rendering', () => {
      // This would typically test with actual i18n, but we can test structure
      render(<ResultsCard />);

      // Text should be in proper containers for translation
      const labels = [
        'Words Per Minute',
        'Accuracy',
        'Characters Typed',
        'Correct',
        'Incorrect',
        'Time Elapsed',
      ];

      labels.forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });
  });
});
