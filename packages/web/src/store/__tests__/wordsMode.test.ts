import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../useGameStore';

describe('Words Mode functionality', () => {
  beforeEach(() => {
    // Reset store to initial state
    useGameStore.setState({
      testConfig: {
        mode: 'words',
        duration: 60,
        wordCount: 25,
        difficulty: 'Normal',
        textSource: 'english1k',
        punctuation: false,
      },
      gameStatus: 'ready',
      textToType: 'the quick brown fox jumps over the lazy dog',
      charStates: [],
      userInput: '',
      wordsCompleted: 0,
      wordsProgress: 0,
      currentWordIndex: 0,
      targetWordCount: 25,
      wordBoundaries: [],
    });
  });

  describe('Word boundary calculation', () => {
    it('calculates word boundaries correctly', () => {
      const { calculateWordBoundaries } = useGameStore.getState();

      const text = 'hello world test';
      const boundaries = calculateWordBoundaries(text);

      expect(boundaries).toEqual([0, 6, 12]); // Start positions of each word
    });

    it('handles multiple spaces between words', () => {
      const { calculateWordBoundaries } = useGameStore.getState();

      const text = 'hello   world    test';
      const boundaries = calculateWordBoundaries(text);

      expect(boundaries).toEqual([0, 8, 17]); // Should skip multiple spaces
    });

    it('handles leading and trailing spaces', () => {
      const { calculateWordBoundaries } = useGameStore.getState();

      const text = '  hello world  ';
      const boundaries = calculateWordBoundaries(text);

      expect(boundaries).toEqual([2, 8]); // Should ignore leading/trailing spaces
    });

    it('handles punctuation as part of words', () => {
      const { calculateWordBoundaries } = useGameStore.getState();

      const text = 'hello, world! test.';
      const boundaries = calculateWordBoundaries(text);

      expect(boundaries).toEqual([0, 7, 14]); // Punctuation doesn't create boundaries
    });
  });

  describe('Word progress tracking', () => {
    it('tracks completed words correctly', () => {
      const text = 'hello world test';
      const charStates = text.split('').map((char, i) => ({
        char,
        status: (i < 5 ? 'correct' : 'default') as const,
      }));

      useGameStore.setState({
        textToType: text,
        charStates,
        userInput: 'hello',
        wordBoundaries: [0, 6, 12],
      });

      const { updateWordProgress } = useGameStore.getState();
      updateWordProgress();

      const state = useGameStore.getState();
      expect(state.wordsCompleted).toBe(0); // Word not fully typed yet
      expect(state.currentWordIndex).toBe(0);
    });

    it('counts word as complete when fully typed correctly', () => {
      const text = 'hello world test';
      const charStates = text.split('').map((char, i) => ({
        char,
        status: (i <= 5 ? 'correct' : 'default') as const,
      }));

      useGameStore.setState({
        textToType: text,
        charStates,
        userInput: 'hello ',
        wordBoundaries: [0, 6, 12],
      });

      const { updateWordProgress } = useGameStore.getState();
      updateWordProgress();

      const state = useGameStore.getState();
      expect(state.wordsCompleted).toBe(1);
      expect(state.currentWordIndex).toBe(1);
    });

    it('does not count incorrect words', () => {
      const text = 'hello world test';
      const charStates = text.split('').map((char, i) => ({
        char,
        status: (i < 5
          ? i === 2
            ? 'incorrect'
            : 'correct'
          : 'default') as const,
      }));

      useGameStore.setState({
        textToType: text,
        charStates,
        userInput: 'heLlo ', // Wrong capitalization
        wordBoundaries: [0, 6, 12],
      });

      const { updateWordProgress } = useGameStore.getState();
      updateWordProgress();

      const state = useGameStore.getState();
      expect(state.wordsCompleted).toBe(0); // Word has errors
    });

    it('calculates progress percentage correctly', () => {
      useGameStore.setState({
        testConfig: { ...useGameStore.getState().testConfig, wordCount: 10 },
        targetWordCount: 10,
      });

      const { updateWordProgress } = useGameStore.getState();

      // Simulate completing 3 words
      useGameStore.setState({ wordsCompleted: 3 });
      updateWordProgress();

      const state = useGameStore.getState();
      expect(state.wordsProgress).toBe(30); // 3/10 = 30%
    });
  });

  describe('Automatic game completion', () => {
    it('completes game when target word count is reached', () => {
      const completeGameSpy = vi.fn();

      useGameStore.setState({
        testConfig: { ...useGameStore.getState().testConfig, wordCount: 10 },
        targetWordCount: 3,
        wordsCompleted: 3,
        completeGame: completeGameSpy,
      });

      const { checkWordCompletion } = useGameStore.getState();
      checkWordCompletion();

      expect(completeGameSpy).toHaveBeenCalled();
    });

    it('does not complete game before target is reached', () => {
      const completeGameSpy = vi.fn();

      useGameStore.setState({
        testConfig: { ...useGameStore.getState().testConfig, wordCount: 10 },
        targetWordCount: 10,
        wordsCompleted: 5,
        completeGame: completeGameSpy,
      });

      const { checkWordCompletion } = useGameStore.getState();
      checkWordCompletion();

      expect(completeGameSpy).not.toHaveBeenCalled();
    });

    it('does not complete game in other modes', () => {
      const completeGameSpy = vi.fn();

      useGameStore.setState({
        testConfig: { ...useGameStore.getState().testConfig, mode: 'time' },
        wordsCompleted: 50,
        completeGame: completeGameSpy,
      });

      const { checkWordCompletion } = useGameStore.getState();
      checkWordCompletion();

      expect(completeGameSpy).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('handles backspace corrections properly', () => {
      const text = 'hello world';
      const charStates = text.split('').map((char, i) => ({
        char,
        status: (i < 5 ? 'correct' : 'default') as const,
      }));

      useGameStore.setState({
        textToType: text,
        charStates,
        userInput: 'hello',
        wordBoundaries: [0, 6],
        wordsCompleted: 1,
      });

      // Simulate backspace
      charStates[4].status = 'default';
      useGameStore.setState({
        userInput: 'hell',
        charStates: charStates as any,
      });

      const { updateWordProgress } = useGameStore.getState();
      updateWordProgress();

      const state = useGameStore.getState();
      expect(state.wordsCompleted).toBe(0); // Word no longer complete
    });

    it('handles very short texts correctly', () => {
      const text = 'hi';

      useGameStore.setState({
        textToType: text,
        wordBoundaries: [0],
        testConfig: { ...useGameStore.getState().testConfig, wordCount: 10 },
        targetWordCount: 1,
      });

      const { updateWordProgress } = useGameStore.getState();
      updateWordProgress();

      // Should not crash or have errors
      expect(useGameStore.getState().currentWordIndex).toBe(0);
    });

    it('limits word count to available words in text', () => {
      const text = 'one two three';
      const boundaries = [0, 4, 8];

      useGameStore.setState({
        textToType: text,
        wordBoundaries: boundaries,
        testConfig: { ...useGameStore.getState().testConfig, wordCount: 10 },
        targetWordCount: 10,
      });

      // Type all three words correctly
      const charStates = text
        .split('')
        .map((char) => ({ char, status: 'correct' as const }));
      useGameStore.setState({
        charStates,
        userInput: text,
      });

      const { updateWordProgress } = useGameStore.getState();
      updateWordProgress();

      const state = useGameStore.getState();
      expect(state.wordsCompleted).toBe(3); // Only 3 words available
    });
  });

  describe('Different word counts', () => {
    const wordCounts = [10, 25, 50, 100] as const;

    wordCounts.forEach((count) => {
      it(`tracks progress correctly for ${count} words`, () => {
        useGameStore.setState({
          testConfig: {
            ...useGameStore.getState().testConfig,
            wordCount: count,
          },
          targetWordCount: count,
          wordsCompleted: Math.floor(count / 2),
        });

        const { updateWordProgress } = useGameStore.getState();
        updateWordProgress();

        const state = useGameStore.getState();
        expect(state.wordsProgress).toBe(50); // Half completed
      });
    });
  });
});
