// Test result interface matching GDD Section 4.2 schema
export interface TestResult {
  id: string; // Unique identifier for the test
  timestamp: number; // Unix timestamp
  mode: 'time' | 'words' | 'quote'; // Test mode
  duration?: number; // Test duration (for time mode)
  wordCount?: number; // Word count (for words mode)
  textSource: string; // Text source used
  difficulty: string; // Difficulty level
  punctuation: boolean; // Whether punctuation was enabled
  wpm: number; // Words per minute
  accuracy: number; // Accuracy percentage
  totalChars: number; // Total characters typed
  correctChars: number; // Correct characters
  incorrectChars: number; // Incorrect characters
}

// Storage key for localStorage
const STORAGE_KEY = 'typeamp-data';

/**
 * Retrieves test history from localStorage
 * @returns Array of test results, empty array if no data exists
 */
export function getTestHistory(): TestResult[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedData = localStorage.getItem(STORAGE_KEY);

    if (!storedData) {
      return [];
    }

    const parsedData = JSON.parse(storedData);

    // Ensure we have a testHistory array
    if (!parsedData.testHistory || !Array.isArray(parsedData.testHistory)) {
      return [];
    }

    return parsedData.testHistory;
  } catch (error) {
    console.error('Error retrieving test history:', error);
    return [];
  }
}

/**
 * Saves a new test result to localStorage
 * @param result - The test result to save
 */
export function saveTestResult(result: TestResult): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Get existing history
    const existingHistory = getTestHistory();

    // Add new result to the beginning of the array (most recent first)
    const updatedHistory = [result, ...existingHistory];

    // Limit history to last 100 results to prevent excessive storage
    const limitedHistory = updatedHistory.slice(0, 100);

    // Create the full data structure
    const dataToStore = {
      testHistory: limitedHistory,
      lastUpdated: Date.now(),
    };

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
  } catch (error) {
    console.error('Error saving test result:', error);
  }
}

/**
 * Clears all test history from localStorage
 */
export function clearTestHistory(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing test history:', error);
  }
}

/**
 * Gets statistics from test history
 * @returns Object with calculated statistics
 */
export function getTestStatistics() {
  const history = getTestHistory();

  if (history.length === 0) {
    return {
      totalTests: 0,
      averageWpm: 0,
      averageAccuracy: 0,
      bestWpm: 0,
      totalTimeTyping: 0,
    };
  }

  const totalTests = history.length;
  const totalWpm = history.reduce((sum, test) => sum + test.wpm, 0);
  const totalAccuracy = history.reduce((sum, test) => sum + test.accuracy, 0);
  const bestWpm = Math.max(...history.map((test) => test.wpm));

  // Calculate total time spent typing (in seconds)
  const totalTimeTyping = history.reduce((sum, test) => {
    if (test.mode === 'time' && test.duration) {
      return sum + test.duration;
    }
    // For words/quote modes, estimate based on WPM
    const estimatedTime = (test.totalChars / 5 / test.wpm) * 60;
    return sum + estimatedTime;
  }, 0);

  return {
    totalTests,
    averageWpm: Math.round(totalWpm / totalTests),
    averageAccuracy: Math.round(totalAccuracy / totalTests),
    bestWpm,
    totalTimeTyping: Math.round(totalTimeTyping),
  };
}
