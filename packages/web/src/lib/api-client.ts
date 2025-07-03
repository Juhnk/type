import { getTestHistory, clearTestHistory, type TestResult } from './history';

const API_BASE_URL = 'http://localhost:3001';

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

interface ApiError {
  error: string;
}

interface BulkSyncResponse {
  count: number;
  message: string;
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
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'An error occurred');
    }

    return data;
  }

  async registerUser(data: AuthRequest): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async loginUser(data: AuthRequest): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async syncLocalHistory(token: string): Promise<BulkSyncResponse | null> {
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
  }
}

export const apiClient = new ApiClient();

// Export convenience functions
export const { registerUser, loginUser, syncLocalHistory } = apiClient;

// SWR fetcher function for authenticated GET requests
export async function fetcher(url: string, token: string) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    const data = await response.json();
    (error as any).info = data;
    (error as any).status = response.status;
    throw error;
  }

  return response.json();
}
