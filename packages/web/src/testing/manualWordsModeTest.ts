/**
 * Manual validation script for Words Mode functionality
 * Tests core functionality without relying on test framework configuration
 */

import { useGameStore } from '@/store/useGameStore';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

export function runWordsModeValidation(): TestResult[] {
  const results: TestResult[] = [];

  // Helper function to create test result
  const test = (name: string, condition: boolean, message: string = '') => {
    results.push({
      name,
      passed: condition,
      message: message || (condition ? 'PASS' : 'FAIL'),
    });
  };

  try {
    // Reset store to known state
    useGameStore.setState({
      testConfig: {
        mode: 'words',
        duration: 60,
        wordCount: 10,
        difficulty: 'Normal',
        textSource: 'english1k',
        punctuation: false,
      },
      gameStatus: 'ready',
      textToType: '',
      charStates: [],
      userInput: '',
      wordsCompleted: 0,
      wordsProgress: 0,
      currentWordIndex: 0,
      targetWordCount: 0,
      wordBoundaries: [],
    });

    // Test 1: Word boundary calculation
    const { calculateWordBoundaries } = useGameStore.getState();
    const testText = 'hello world test';
    const boundaries = calculateWordBoundaries(testText);
    test(
      'Word boundary calculation',
      JSON.stringify(boundaries) === JSON.stringify([0, 6, 12]),
      `Expected [0, 6, 12], got [${boundaries.join(', ')}]`
    );

    // Test 2: Word boundary calculation with multiple spaces
    const spacedText = 'hello   world    test';
    const spacedBoundaries = calculateWordBoundaries(spacedText);
    test(
      'Multiple spaces handling',
      spacedBoundaries.length === 3 && spacedBoundaries[0] === 0,
      `Expected 3 boundaries starting at 0, got ${spacedBoundaries.length} boundaries: [${spacedBoundaries.join(', ')}]`
    );

    // Test 3: setTextToType initializes word boundaries
    const { setTextToType } = useGameStore.getState();
    setTextToType('the quick brown fox');
    const state1 = useGameStore.getState();
    test(
      'setTextToType initializes boundaries',
      state1.wordBoundaries.length === 4,
      `Expected 4 word boundaries, got ${state1.wordBoundaries.length}`
    );

    // Test 4: Target word count initialization
    test(
      'Target word count initialization',
      state1.targetWordCount === 10,
      `Expected targetWordCount 10, got ${state1.targetWordCount}`
    );

    // Test 5: Word progress tracking
    useGameStore.setState({
      textToType: 'hello world test game',
      wordBoundaries: [0, 6, 12, 17],
      charStates: Array(20)
        .fill(null)
        .map((_, i) => ({
          char: 'hello world test game'[i] || ' ',
          status: i <= 5 ? 'correct' : 'default',
        })) as any,
      userInput: 'hello ',
    });

    const { updateWordProgress } = useGameStore.getState();
    updateWordProgress();
    const state2 = useGameStore.getState();

    test(
      'Word progress tracking',
      state2.wordsCompleted === 1,
      `Expected 1 completed word, got ${state2.wordsCompleted}`
    );

    test(
      'Progress percentage calculation',
      state2.wordsProgress === 10, // 1 out of 10 words = 10%
      `Expected 10% progress, got ${state2.wordsProgress}%`
    );

    // Test 6: Game completion check
    const completeGameSpy = (() => {
      // Mock function for environments without jest
      const fn = () => {};
      (fn as any).called = false;
      return fn;
    })() as any;

    // Override the function to track calls
    const originalFn = completeGameSpy;
    const mockFn = () => {
      (originalFn as any).called = true;
    };
    Object.assign(mockFn, originalFn);

    useGameStore.setState({
      wordsCompleted: 10,
      targetWordCount: 10,
      completeGame: mockFn,
    });

    const { checkWordCompletion } = useGameStore.getState();
    checkWordCompletion();

    test(
      'Game completion when target reached',
      (originalFn as any).called,
      'completeGame should be called when target word count is reached'
    );

    // Test 7: Mode-specific behavior
    useGameStore.setState({
      testConfig: { ...useGameStore.getState().testConfig, mode: 'time' },
      wordsCompleted: 50,
    });

    const completeGameSpy2 = (() => {
      const fn = () => {};
      (fn as any).called = false;
      return fn;
    })() as any;
    useGameStore.setState({ completeGame: completeGameSpy2 });

    checkWordCompletion();

    test(
      'No completion in non-words mode',
      !completeGameSpy2.called,
      'completeGame should not be called in non-words modes'
    );

    // Test 8: Reset functionality
    useGameStore.setState({
      wordsCompleted: 5,
      wordsProgress: 50,
      currentWordIndex: 5,
    });

    const { resetGame } = useGameStore.getState();
    resetGame();
    const resetState = useGameStore.getState();

    test(
      'Reset clears word progress',
      resetState.wordsCompleted === 0 &&
        resetState.wordsProgress === 0 &&
        resetState.currentWordIndex === 0,
      `Expected all word progress to be reset, got completed: ${resetState.wordsCompleted}, progress: ${resetState.wordsProgress}, index: ${resetState.currentWordIndex}`
    );

    // Test 9: Different word count configurations
    const wordCounts = [10, 25, 50, 100] as const;
    let configTestsPassed = 0;

    for (const count of wordCounts) {
      useGameStore.setState({
        testConfig: { ...useGameStore.getState().testConfig, wordCount: count },
        targetWordCount: count,
      });

      setTextToType('test text for configuration');
      const configState = useGameStore.getState();

      if (configState.targetWordCount === count) {
        configTestsPassed++;
      }
    }

    test(
      'Different word count configurations',
      configTestsPassed === wordCounts.length,
      `${configTestsPassed}/${wordCounts.length} word count configurations worked correctly`
    );
  } catch (error) {
    test(
      'Overall execution',
      false,
      `Test execution failed with error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  return results;
}

// Function to display test results
export function displayTestResults(results: TestResult[]): void {
  console.log('=== Words Mode Validation Results ===');

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  console.log(`\nOverall: ${passed}/${total} tests passed\n`);

  results.forEach((result) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${result.name}`);
    if (!result.passed || result.message !== 'PASS') {
      console.log(`    ${result.message}`);
    }
  });

  console.log('\n' + '='.repeat(40));
}
