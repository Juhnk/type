import { getTestHistory, clearTestHistory, type TestResult } from './history';
import { API_CONFIG } from '@/config/app.config';

const API_BASE_URL = API_CONFIG.baseUrl;

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

interface GenerateChallengeRequest {
  prompt: string;
  contentType?: 'facts' | 'scenario' | 'simulation' | 'technical' | 'story';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  focus?: string;
  previousContent?: string[];
  wordCount?: number;
}

interface GenerateChallengeResponse {
  text: string;
  qualityScore?: number;
  qualityIssues?: string[];
  detectedSubject?: string;
  availableSubjects?: number;
  keyTerms?: string[];
  metadata?: {
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
  enhanced_text?: string;
  punctuation_enabled?: boolean;
  numbers_enabled?: boolean;
}

interface WordListsResponse {
  lists: Array<{
    id: string;
    name: string;
    description: string;
    total_words: number;
  }>;
}

interface SettingsResponse {
  // Appearance
  theme: string;
  font: string;
  fontSize: number;
  caretStyle: string;
  caretColor: string;
  colorScheme: string;
  animations: boolean;
  smoothCaret: boolean;
  showWpmCounter: boolean;
  showAccuracyCounter: boolean;
  // Behavior
  soundEffects: boolean;
  keyFeedback: boolean;
  defaultMode: string;
  defaultDifficulty: string;
  defaultDuration: number;
  defaultWordCount: number;
  paceCaretWpm: number;
  paceCaretEnabled: boolean;
  autoSave: boolean;
  focusMode: boolean;
  quickRestart: boolean;
  blindMode: boolean;
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

interface QuoteResponse {
  id: string;
  text: string;
  author: string;
}

class ApiClient {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    // IMPORTANT: Order matters here!
    // 1. Spread options first to get all user-provided options
    // 2. Then override/merge headers to ensure Content-Type is always set
    // 3. Finally add signal to prevent it from being overwritten
    // If the order is wrong (headers before ...options), the entire headers
    // object will be replaced and Content-Type will be lost.
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      // Add timeout and better error handling
      signal: AbortSignal.timeout(API_CONFIG.timeout),
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
        if (response.status === 0) {
          throw new Error(
            'Unable to connect to server. Please check your connection.'
          );
        } else if (response.status >= 500) {
          // For server errors, use the actual error message if available
          throw new Error(
            data?.error ||
              'Server is currently unavailable. Please try again later.'
          );
        } else if (response.status === 404) {
          throw new Error('The requested resource was not found.');
        } else if (response.status === 401) {
          // Check if it's a login/register endpoint vs authenticated endpoint
          const isAuthEndpoint =
            endpoint.includes('/auth/login') ||
            endpoint.includes('/auth/register');
          throw new Error(
            isAuthEndpoint
              ? 'Invalid credentials. Please check your email and password.'
              : 'Authentication required. Please log in again.'
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
    const transformedHistory = localHistory.map((test: TestResult) => {
      // Build config object with only defined values
      const config: any = {
        mode: test.mode,
        textSource: test.textSource,
        difficulty: test.difficulty,
        punctuation: test.punctuation,
      };

      // Only add duration if it's defined
      if (test.duration !== undefined) {
        config.duration = test.duration;
      }

      // Only add wordCount if it's defined
      if (test.wordCount !== undefined) {
        config.wordCount = test.wordCount;
      }

      // Add AI mode specific fields
      if (test.aiSubMode !== undefined) {
        config.aiSubMode = test.aiSubMode;
      }

      if (test.aiTopic !== undefined) {
        config.aiTopic = test.aiTopic;
      }

      return {
        wpm: test.wpm,
        accuracy: test.accuracy,
        rawWpm: test.wpm, // Using wpm as rawWpm for now
        consistency: null, // Not tracked in local format
        config,
        tags: [], // Not tracked in local format
        timestamp: new Date(test.timestamp).toISOString(),
      };
    });

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
    config: GenerateChallengeRequest,
    token: string
  ): Promise<GenerateChallengeResponse> => {
    // Use a longer timeout for AI generation (30 seconds)
    const aiTimeout = 30000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), aiTimeout);

    try {
      const response = await this.makeRequest<GenerateChallengeResponse>(
        '/api/generate-challenge',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(config),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Provide more specific error messages
      if (error.name === 'AbortError') {
        throw new Error(
          'AI generation is taking longer than expected. Please try again with a simpler prompt.'
        );
      } else if (error.message?.includes('AI service is not configured')) {
        throw new Error(
          'AI service is not available. Please ensure the API key is configured.'
        );
      }

      throw error;
    }
  };

  saveSingleTest = async (
    result: TestResult,
    token: string
  ): Promise<{ message: string; result?: any }> => {
    // Transform local TestResult format to match API expected format
    // Build config object with only defined values
    const config: any = {
      mode: result.mode,
      textSource: result.textSource,
      difficulty: result.difficulty,
      punctuation: result.punctuation,
    };

    // Only add duration if it's defined (for time mode)
    if (result.duration !== undefined) {
      config.duration = result.duration;
    }

    // Only add wordCount if it's defined (for words mode)
    if (result.wordCount !== undefined) {
      config.wordCount = result.wordCount;
    }

    // Add failure information if test failed
    if (result.testFailed !== undefined) {
      config.testFailed = result.testFailed;
    }

    if (result.failureReason !== undefined) {
      config.failureReason = result.failureReason;
    }

    // Add AI mode specific fields
    if (result.aiSubMode !== undefined) {
      config.aiSubMode = result.aiSubMode;
    }

    if (result.aiTopic !== undefined) {
      config.aiTopic = result.aiTopic;
    }

    const transformedResult = {
      wpm: result.wpm,
      accuracy: result.accuracy,
      rawWpm: result.wpm, // Using wpm as rawWpm for now
      consistency: null, // Not tracked in local format
      config,
      tags: [], // Not tracked in local format
      timestamp: new Date(result.timestamp).toISOString(),
    };

    // Enhanced debug logging to track mode saving
    console.log('[API Client] === TEST RESULT SAVE DEBUG ===');
    console.log('[API Client] Original result mode:', result.mode);
    console.log('[API Client] Original result details:', {
      mode: result.mode,
      duration: result.duration,
      wordCount: result.wordCount,
      textSource: result.textSource,
      difficulty: result.difficulty,
      punctuation: result.punctuation,
      wpm: result.wpm,
      accuracy: result.accuracy,
      aiSubMode: result.aiSubMode,
      aiTopic: result.aiTopic,
      testFailed: result.testFailed,
      failureReason: result.failureReason,
    });
    console.log(
      '[API Client] Config object built:',
      JSON.stringify(config, null, 2)
    );
    console.log(
      '[API Client] Full transformed result:',
      JSON.stringify(transformedResult, null, 2)
    );
    console.log('[API Client] === END DEBUG ===');

    return this.makeRequest<{ message: string; result?: any }>(
      '/api/me/tests',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ testResult: transformedResult }),
      }
    );
  };

  // Word Source API methods
  getWords = async (
    list: string = 'english1k',
    limit: number = 100,
    randomize: boolean = true,
    options: {
      punctuation?: boolean;
      numbers?: boolean;
      punctuationDensity?: 'light' | 'medium' | 'heavy';
    } = {}
  ): Promise<WordsResponse> => {
    const params = new URLSearchParams({
      list,
      limit: limit.toString(),
      randomize: randomize.toString(),
    });

    // Add enhancement parameters if specified
    if (options.punctuation !== undefined) {
      params.append('punctuation', options.punctuation.toString());
    }
    if (options.numbers !== undefined) {
      params.append('numbers', options.numbers.toString());
    }
    if (options.punctuationDensity) {
      params.append('punctuation_density', options.punctuationDensity);
    }

    return this.makeRequest<WordsResponse>(`/api/words?${params.toString()}`);
  };

  getWordLists = async (): Promise<WordListsResponse> => {
    return this.makeRequest<WordListsResponse>('/api/words/lists');
  };

  // Settings API methods
  getSettings = async (token: string): Promise<SettingsResponse> => {
    return this.makeRequest<SettingsResponse>('/api/me/settings', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  updateSettings = async (
    settings: Partial<SettingsResponse>,
    token: string
  ): Promise<SettingsResponse> => {
    return this.makeRequest<SettingsResponse>('/api/me/settings', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(settings),
    });
  };

  resetSettings = async (token: string): Promise<{ message: string }> => {
    return this.makeRequest<{ message: string }>('/api/me/settings', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  // Quotes API methods
  getRandomQuote = async (): Promise<QuoteResponse> => {
    return this.makeRequest<QuoteResponse>('/api/quotes/random');
  };

  // Generic GET method for endpoints without specific methods
  get = async <T = any>(endpoint: string, token?: string): Promise<T> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return this.makeRequest<T>(endpoint, { headers });
  };

  // Generic PATCH method for endpoints without specific methods
  patch = async <T = any>(
    endpoint: string,
    data: any,
    token?: string
  ): Promise<T> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
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
  getSettings,
  updateSettings,
  resetSettings,
  getRandomQuote,
  get,
  patch,
} = apiClient;

// SWR fetcher function for authenticated GET requests
export async function fetcher(url: string, token: string) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store', // Disable browser caching
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
