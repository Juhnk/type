import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigurationBar } from '../ConfigurationBar';
import { useGameStore } from '@/store/useGameStore';

// Mock the api-client to prevent actual API calls
vi.mock('@/lib/api-client', () => ({
  getWords: vi.fn().mockResolvedValue({
    words: ['test'],
    metadata: { list: 'english1k', count: 1, total_available: 1024 },
  }),
}));

describe('ConfigurationBar', () => {
  beforeEach(() => {
    // Reset store to default state
    useGameStore.setState({
      testConfig: {
        mode: 'time',
        duration: 60,
        wordCount: 50,
        difficulty: 'Normal',
        textSource: 'english1k',
        punctuation: false,
      },
    });
  });

  it('should display current configuration', () => {
    render(<ConfigurationBar />);

    expect(screen.getByText('Mode:')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('Difficulty:')).toBeInTheDocument();
    expect(screen.getByText('Normal')).toBeInTheDocument();
    expect(screen.getByText('Duration:')).toBeInTheDocument();
    expect(screen.getByText('60s')).toBeInTheDocument();
    expect(screen.getByText('Word List:')).toBeInTheDocument();
    expect(screen.getByText('English 1K')).toBeInTheDocument();
    expect(screen.getByText('Punctuation')).toBeInTheDocument();
  });

  it('should cycle through modes when clicked', async () => {
    const user = userEvent.setup();
    render(<ConfigurationBar />);

    const modeBadge = screen.getByText('Time');

    // Click to change to 'words'
    await user.click(modeBadge);
    expect(screen.getByText('Words')).toBeInTheDocument();

    // Click to change to 'quote'
    await user.click(screen.getByText('Words'));
    expect(screen.getByText('Quote')).toBeInTheDocument();

    // Click to cycle back to 'time'
    await user.click(screen.getByText('Quote'));
    expect(screen.getByText('Time')).toBeInTheDocument();
  });

  it('should cycle through difficulties when clicked', async () => {
    const user = userEvent.setup();
    render(<ConfigurationBar />);

    const difficultyBadge = screen.getByText('Normal');

    // Click to change to 'Expert'
    await user.click(difficultyBadge);
    expect(screen.getByText('Expert')).toBeInTheDocument();

    // Click to change to 'Master'
    await user.click(screen.getByText('Expert'));
    expect(screen.getByText('Master')).toBeInTheDocument();

    // Click to cycle back to 'Normal'
    await user.click(screen.getByText('Master'));
    expect(screen.getByText('Normal')).toBeInTheDocument();
  });

  it('should cycle through durations in time mode', async () => {
    const user = userEvent.setup();
    render(<ConfigurationBar />);

    const durationBadge = screen.getByText('60s');

    // Click to change to 120s
    await user.click(durationBadge);
    expect(screen.getByText('120s')).toBeInTheDocument();

    // Click to change to 15s
    await user.click(screen.getByText('120s'));
    expect(screen.getByText('15s')).toBeInTheDocument();
  });

  it('should show word count options in words mode', async () => {
    const user = userEvent.setup();

    // Change to words mode
    useGameStore.setState({
      testConfig: {
        ...useGameStore.getState().testConfig,
        mode: 'words',
      },
    });

    render(<ConfigurationBar />);

    expect(screen.getByText('Word Count:')).toBeInTheDocument();
    expect(screen.getByText('50 words')).toBeInTheDocument();

    // Click to cycle through word counts
    const wordCountBadge = screen.getByText('50 words');
    await user.click(wordCountBadge);
    expect(screen.getByText('100 words')).toBeInTheDocument();
  });

  it('should cycle through text sources', async () => {
    const user = userEvent.setup();
    render(<ConfigurationBar />);

    const textSourceBadge = screen.getByText('English 1K');

    // Click to change to English 10K
    await user.click(textSourceBadge);
    expect(screen.getByText('English 10K')).toBeInTheDocument();

    // Click to change to JavaScript
    await user.click(screen.getByText('English 10K'));
    expect(screen.getByText('JavaScript')).toBeInTheDocument();

    // Click to change to Python
    await user.click(screen.getByText('JavaScript'));
    expect(screen.getByText('Python')).toBeInTheDocument();

    // Click to cycle back to English 1K
    await user.click(screen.getByText('Python'));
    expect(screen.getByText('English 1K')).toBeInTheDocument();
  });

  it('should toggle punctuation', async () => {
    const user = userEvent.setup();
    render(<ConfigurationBar />);

    const punctuationBadge = screen.getByText('Punctuation');

    // Initially should have outline variant (off state)
    expect(punctuationBadge).toHaveAttribute('data-slot', 'badge');

    // Click to toggle on
    await user.click(punctuationBadge);

    // Verify state changed
    const state = useGameStore.getState();
    expect(state.testConfig.punctuation).toBe(true);
  });

  it('should hide duration in words mode and show word count', () => {
    // Set to words mode
    useGameStore.setState({
      testConfig: {
        ...useGameStore.getState().testConfig,
        mode: 'words',
      },
    });

    render(<ConfigurationBar />);

    // Duration should not be shown
    expect(screen.queryByText('Duration:')).not.toBeInTheDocument();

    // Word count should be shown
    expect(screen.getByText('Word Count:')).toBeInTheDocument();
  });

  it('should update store when configuration changes', async () => {
    const user = userEvent.setup();
    render(<ConfigurationBar />);

    // Change mode
    await user.click(screen.getByText('Time'));

    // Check that store was updated
    const state = useGameStore.getState();
    expect(state.testConfig.mode).toBe('words');
  });
});
