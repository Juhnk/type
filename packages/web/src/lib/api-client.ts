import { getTestHistory, clearTestHistory, type TestResult } from './history';

const API_BASE_URL = 'http://localhost:3003';

interface AuthResponse {
  user: {
    id: string;
    email: string;
    createdAt: string;
  };
  token: string;
}

interface AuthRequest {
  email: string;
  password: string;
}

interface BulkSyncResponse {
  count: number;
  message: string;
}

interface GenerateChallengeResponse {
  text: string;
  metadata: {
    source: string;
    difficulty: string;
    context: string;
  };
}

interface WordsResponse {
  words: string[];
  metadata: {
    list: string;
    count: number;
    total_available: number;
  };
}

interface WordListsResponse {
  lists: Array<{
    id: string;
    name: string;
    description: string;
    total_words: number;
  }>;
}

class ApiClient {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      // Add timeout and better error handling
      signal: AbortSignal.timeout(10000), // 10 second timeout
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Handle non-JSON responses or network errors
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error(
          `Server returned invalid response. Status: ${response.status}`
        );
      }

      if (!response.ok) {
        // Provide more specific error messages based on status code
        if (response.status === 0 || response.status >= 500) {
          throw new Error(
            'Server is currently unavailable. Please try again later.'
          );
        } else if (response.status === 404) {
          throw new Error('The requested resource was not found.');
        } else if (response.status === 401) {
          throw new Error(
            'Invalid credentials. Please check your email and password.'
          );
        } else if (response.status === 409) {
          throw new Error('An account with this email already exists.');
        } else {
          throw new Error(
            data?.error || `Request failed with status ${response.status}`
          );
        }
      }

      return data;
    } catch (error) {
      // Handle network errors and timeouts
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.name === 'TimeoutError') {
          throw new Error(
            'Request timed out. Please check your connection and try again.'
          );
        } else if (
          error.message.includes('Failed to fetch') ||
          error.message.includes('NetworkError')
        ) {
          throw new Error(
            'Network error. Please check your internet connection and ensure the server is running.'
          );
        }
        // Re-throw our custom errors
        throw error;
      }
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }

  // Use arrow functions to preserve 'this' context when destructured
  registerUser = async (data: AuthRequest): Promise<AuthResponse> => {
    return this.makeRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  loginUser = async (data: AuthRequest): Promise<AuthResponse> => {
    return this.makeRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  syncLocalHistory = async (
    token: string
  ): Promise<BulkSyncResponse | null> => {
    const localHistory = getTestHistory();

    // If no local history exists, return null
    if (localHistory.length === 0) {
      return null;
    }

    // Transform local TestResult format to match API expected format
    const transformedHistory = localHistory.map((test: TestResult) => ({
      wpm: test.wpm,
      accuracy: test.accuracy,
      rawWpm: test.wpm, // Using wpm as rawWpm for now
      consistency: null, // Not tracked in local format
      config: {
        mode: test.mode,
        duration: test.duration,
        wordCount: test.wordCount,
        textSource: test.textSource,
        difficulty: test.difficulty,
        punctuation: test.punctuation,
      },
      tags: [], // Not tracked in local format
      timestamp: new Date(test.timestamp).toISOString(),
    }));

    const response = await this.makeRequest<BulkSyncResponse>(
      '/api/me/tests/bulk',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          testResults: transformedHistory,
        }),
      }
    );

    // Clear local history after successful sync
    clearTestHistory();

    return response;
  };

  generateChallenge = async (
    prompt: string,
    token: string
  ): Promise<GenerateChallengeResponse> => {
    return this.makeRequest<GenerateChallengeResponse>(
      '/api/generate-challenge',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt }),
      }
    );
  };

  saveSingleTest = async (
    result: TestResult,
    token: string
  ): Promise<{ message: string }> => {
    // Transform local TestResult format to match API expected format
    const transformedResult = {
      wpm: result.wpm,
      accuracy: result.accuracy,
      rawWpm: result.wpm, // Using wpm as rawWpm for now
      consistency: null, // Not tracked in local format
      config: {
        mode: result.mode,
        duration: result.duration,
        wordCount: result.wordCount,
        textSource: result.textSource,
        difficulty: result.difficulty,
        punctuation: result.punctuation,
      },
      tags: [], // Not tracked in local format
      timestamp: new Date(result.timestamp).toISOString(),
    };

    return this.makeRequest<{ message: string }>('/api/me/tests', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(transformedResult),
    });
  };

  // Word Source API methods
  getWords = async (
    list: string = 'english1k',
    limit: number = 100,
    randomize: boolean = true
  ): Promise<WordsResponse> => {
    const params = new URLSearchParams({
      list,
      limit: limit.toString(),
      randomize: randomize.toString(),
    });

    return this.makeRequest<WordsResponse>(`/api/words?${params.toString()}`);
  };

  getWordLists = async (): Promise<WordListsResponse> => {
    return this.makeRequest<WordListsResponse>('/api/words/lists');
  };
}

export const apiClient = new ApiClient();

// Export convenience functions with proper binding
export const {
  registerUser,
  loginUser,
  syncLocalHistory,
  generateChallenge,
  saveSingleTest,
  getWords,
  getWordLists,
} = apiClient;

// SWR fetcher function for authenticated GET requests
export async function fetcher(url: string, token: string) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const data = await response.json();
    const error = new Error(
      'An error occurred while fetching the data.'
    ) as Error & {
      info: unknown;
      status: number;
    };
    error.info = data;
    error.status = response.status;
    throw error;
  }

  return response.json();
}
