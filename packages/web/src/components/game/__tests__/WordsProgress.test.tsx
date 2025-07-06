import { render, screen } from '@testing-library/react';
import { WordsProgress, CompactWordsProgress } from '../WordsProgress';
import { useGameStore } from '@/store/useGameStore';
import { vi } from 'vitest';

// Mock the game store
vi.mock('@/store/useGameStore');

const mockUseGameStore = useGameStore as any;

describe('WordsProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('WordsProgress component', () => {
    it('does not render for non-words modes', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        const state = {
          testConfig: { mode: 'time' },
          wordsCompleted: 0,
          wordsProgress: 0,
          targetWordCount: 0,
          gameStatus: 'running',
        };
        return selector(state);
      });

      const { container } = render(<WordsProgress />);
      expect(container.firstChild).toBeNull();
    });

    it('does not render when game is not started', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        const state = {
          testConfig: { mode: 'words' },
          wordsCompleted: 0,
          wordsProgress: 0,
          targetWordCount: 25,
          gameStatus: 'ready',
        };
        return selector(state);
      });

      const { container } = render(<WordsProgress />);
      expect(container.firstChild).toBeNull();
    });

    it('renders progress correctly for words mode', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        const state = {
          testConfig: { mode: 'words' },
          wordsCompleted: 5,
          wordsProgress: 20,
          targetWordCount: 25,
          gameStatus: 'running',
        };
        return selector(state);
      });

      render(<WordsProgress />);

      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('5/25 words')).toBeInTheDocument();
      expect(screen.getByText('20% complete')).toBeInTheDocument();
    });

    it('shows urgency styling when near completion', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        const state = {
          testConfig: { mode: 'words' },
          wordsCompleted: 90,
          wordsProgress: 90,
          targetWordCount: 100,
          gameStatus: 'running',
        };
        return selector(state);
      });

      render(<WordsProgress />);

      const progressText = screen.getByText('90/100 words');
      expect(progressText).toHaveClass('text-green-600');
    });

    it('renders progress bar with correct width', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        const state = {
          testConfig: { mode: 'words' },
          wordsCompleted: 15,
          wordsProgress: 30,
          targetWordCount: 50,
          gameStatus: 'running',
        };
        return selector(state);
      });

      render(<WordsProgress />);

      // Find the progress bar fill element
      const progressBar = document.querySelector('[style*="width: 30%"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('shows milestone markers', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        const state = {
          testConfig: { mode: 'words' },
          wordsCompleted: 10,
          wordsProgress: 40,
          targetWordCount: 25,
          gameStatus: 'running',
        };
        return selector(state);
      });

      render(<WordsProgress />);

      // Should have 3 milestone markers (25%, 50%, 75%)
      const markers = document.querySelectorAll('[style*="marginLeft"]');
      expect(markers).toHaveLength(3);
    });
  });

  describe('CompactWordsProgress component', () => {
    it('renders compact format correctly', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        const state = {
          testConfig: { mode: 'words' },
          wordsCompleted: 12,
          wordsProgress: 48,
          targetWordCount: 25,
          gameStatus: 'running',
        };
        return selector(state);
      });

      render(<CompactWordsProgress />);

      expect(screen.getByText('12/25')).toBeInTheDocument();
    });

    it('shows urgency styling in compact mode', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        const state = {
          testConfig: { mode: 'words' },
          wordsCompleted: 45,
          wordsProgress: 90,
          targetWordCount: 50,
          gameStatus: 'running',
        };
        return selector(state);
      });

      render(<CompactWordsProgress />);

      const container = screen.getByText('45/50').closest('div');
      expect(container).toHaveClass('text-green-700');
    });

    it('does not render for non-words modes', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        const state = {
          testConfig: { mode: 'time' },
          wordsCompleted: 0,
          wordsProgress: 0,
          targetWordCount: 0,
          gameStatus: 'running',
        };
        return selector(state);
      });

      const { container } = render(<CompactWordsProgress />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Progress calculation display', () => {
    it('shows 0% at start', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        const state = {
          testConfig: { mode: 'words' },
          wordsCompleted: 0,
          wordsProgress: 0,
          targetWordCount: 100,
          gameStatus: 'running',
        };
        return selector(state);
      });

      render(<WordsProgress />);
      expect(screen.getByText('0% complete')).toBeInTheDocument();
    });

    it('shows 100% when completed', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        const state = {
          testConfig: { mode: 'words' },
          wordsCompleted: 50,
          wordsProgress: 100,
          targetWordCount: 50,
          gameStatus: 'finished',
        };
        return selector(state);
      });

      render(<WordsProgress />);
      expect(screen.getByText('100% complete')).toBeInTheDocument();
    });

    it('rounds percentage correctly', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        const state = {
          testConfig: { mode: 'words' },
          wordsCompleted: 7,
          wordsProgress: 28.57,
          targetWordCount: 25,
          gameStatus: 'running',
        };
        return selector(state);
      });

      render(<WordsProgress />);
      expect(screen.getByText('29% complete')).toBeInTheDocument(); // Should round up
    });
  });
});
