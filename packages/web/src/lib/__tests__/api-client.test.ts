import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient, registerUser, loginUser } from '../api-client';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Client Authentication', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('registerUser', () => {
    it('should successfully register a user', async () => {
      const mockResponse = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          createdAt: '2023-01-01T00:00:00Z',
        },
        token: 'mock-jwt-token',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await registerUser({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/register',
        {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it('should throw an error when registration fails', async () => {
      const mockError = { error: 'User already exists' };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: vi.fn().mockResolvedValueOnce(mockError),
      });

      await expect(
        registerUser({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('User already exists');
    });

    it('should preserve this context when destructured', async () => {
      // This test verifies that arrow functions preserve 'this' context
      const mockResponse = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          createdAt: '2023-01-01T00:00:00Z',
        },
        token: 'mock-jwt-token',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      // Extract the function and call it directly (simulating destructuring)
      const { registerUser: extractedRegisterUser } = apiClient;

      const result = await extractedRegisterUser({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('loginUser', () => {
    it('should successfully login a user', async () => {
      const mockResponse = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          createdAt: '2023-01-01T00:00:00Z',
        },
        token: 'mock-jwt-token',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await loginUser({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/login',
        {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it('should throw an error when login fails', async () => {
      const mockError = { error: 'Invalid credentials' };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: vi.fn().mockResolvedValueOnce(mockError),
      });

      await expect(
        loginUser({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should preserve this context when destructured', async () => {
      const mockResponse = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          createdAt: '2023-01-01T00:00:00Z',
        },
        token: 'mock-jwt-token',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      // Extract the function and call it directly (simulating destructuring)
      const { loginUser: extractedLoginUser } = apiClient;

      const result = await extractedLoginUser({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('makeRequest (private method)', () => {
    it('should handle generic error responses', async () => {
      const mockError = { error: 'Network error' };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: vi.fn().mockResolvedValueOnce(mockError),
      });

      await expect(
        registerUser({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Network error');
    });

    it('should handle responses without error message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: vi.fn().mockResolvedValueOnce({}),
      });

      await expect(
        registerUser({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('An error occurred');
    });
  });
});
