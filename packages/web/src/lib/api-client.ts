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
}

export const apiClient = new ApiClient();

// Export convenience functions
export const { registerUser, loginUser } = apiClient;
