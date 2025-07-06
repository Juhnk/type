import { render, screen, fireEvent } from '@testing-library/react';
import { TypingArea } from '../TypingArea';
import { useGameStore } from '@/store/useGameStore';
import { vi } from 'vitest';

// Mock the game store
vi.mock('@/store/useGameStore');

const mockUseGameStore = useGameStore as any;

describe('TypingArea', () => {
  const mockPrepareGame = vi.fn();
  const mockHandleKeyPress = vi.fn();
  const mockUseFallbackWords = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseGameStore.mockImplementation((selector: any) => {
      const state = {
        charStates: [
          { char: 't', status: 'current' },
          { char: 'e', status: 'default' },
          { char: 's', status: 'default' },
          { char: 't', status: 'default' },
        ],
        gameStatus: 'ready',
        isPreparingGame: false,
        gamePreparationError: null,
        prepareGame: mockPrepareGame,
        handleKeyPress: mockHandleKeyPress,
        useFallbackWords: mockUseFallbackWords,
      };
      return selector(state);
    });
  });

  it('renders typing area correctly', () => {
    render(<TypingArea />);

    expect(screen.getByText('t')).toBeInTheDocument();
    expect(screen.getByText('e')).toBeInTheDocument();
    expect(screen.getByText('s')).toBeInTheDocument();
    expect(
      screen.getByText('Start typing to begin the test...')
    ).toBeInTheDocument();
  });

  it('shows loading state when preparing game', () => {
    mockUseGameStore.mockImplementation((selector: any) => {
      const state = {
        charStates: [],
        gameStatus: 'idle',
        isPreparingGame: true,
        gamePreparationError: null,
        prepareGame: mockPrepareGame,
        handleKeyPress: mockHandleKeyPress,
        useFallbackWords: mockUseFallbackWords,
      };
      return selector(state);
    });

    render(<TypingArea />);

    expect(screen.getByText('Preparing game...')).toBeInTheDocument();
  });

  it('shows error state when game preparation fails', () => {
    mockUseGameStore.mockImplementation((selector: any) => {
      const state = {
        charStates: [],
        gameStatus: 'idle',
        isPreparingGame: false,
        gamePreparationError: 'Network error',
        prepareGame: mockPrepareGame,
        handleKeyPress: mockHandleKeyPress,
        useFallbackWords: mockUseFallbackWords,
      };
      return selector(state);
    });

    render(<TypingArea />);

    expect(
      screen.getByText('Game preparation failed: Network error')
    ).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
    expect(screen.getByText('Use fallback words')).toBeInTheDocument();
  });

  it('calls prepareGame on mount', () => {
    render(<TypingArea />);

    expect(mockPrepareGame).toHaveBeenCalledTimes(1);
  });

  it('handles retry button click', () => {
    mockUseGameStore.mockImplementation((selector: any) => {
      const state = {
        charStates: [],
        gameStatus: 'idle',
        isPreparingGame: false,
        gamePreparationError: 'Network error',
        prepareGame: mockPrepareGame,
        handleKeyPress: mockHandleKeyPress,
        useFallbackWords: mockUseFallbackWords,
      };
      return selector(state);
    });

    render(<TypingArea />);

    fireEvent.click(screen.getByText('Try again'));
    expect(mockPrepareGame).toHaveBeenCalledTimes(2); // Once on mount + once on retry
  });

  it('handles fallback words button click', () => {
    mockUseGameStore.mockImplementation((selector: any) => {
      const state = {
        charStates: [],
        gameStatus: 'idle',
        isPreparingGame: false,
        gamePreparationError: 'Network error',
        prepareGame: mockPrepareGame,
        handleKeyPress: mockHandleKeyPress,
        useFallbackWords: mockUseFallbackWords,
      };
      return selector(state);
    });

    render(<TypingArea />);

    fireEvent.click(screen.getByText('Use fallback words'));
    expect(mockUseFallbackWords).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard input', () => {
    render(<TypingArea />);

    fireEvent.keyDown(document, { key: 't' });
    expect(mockHandleKeyPress).toHaveBeenCalledWith('t');
  });
});
