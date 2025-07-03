import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Toaster, toast } from 'sonner';
import { AuthModal } from './AuthModal';
import { useModalStore } from '@/store/useModalStore';
import { registerUser, loginUser } from '@/lib/api-client';

// Mock the API client module
vi.mock('@/lib/api-client', () => ({
  registerUser: vi.fn(),
  loginUser: vi.fn(),
}));

// Mock the toast notifications
vi.mock('sonner', async () => {
  const actual = await vi.importActual('sonner');
  return {
    ...actual,
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

// Get the mocked functions
const mockRegisterUser = vi.mocked(registerUser);
const mockLoginUser = vi.mocked(loginUser);
const mockToast = vi.mocked(toast);

describe('AuthModal', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset modal state before each test
    useModalStore.getState().closeAuthModal();
  });

  const renderAuthModalWithToaster = () => {
    return render(
      <>
        <AuthModal />
        <Toaster />
      </>
    );
  };

  const openModalAndWait = async () => {
    useModalStore.getState().openAuthModal();
    // Wait for modal to be visible
    await waitFor(() => {
      expect(screen.getByText('Welcome to TypeAmp')).toBeInTheDocument();
    });
  };

  describe('Registration', () => {
    it('should call registerUser with form data on register submission', async () => {
      // Mock successful registration response
      const mockResponse = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          createdAt: '2023-01-01T00:00:00.000Z',
        },
        token: 'jwt-token-123',
      };
      mockRegisterUser.mockResolvedValue(mockResponse);

      renderAuthModalWithToaster();
      await openModalAndWait();

      // Click on Register tab
      const registerTab = screen.getByRole('tab', { name: /register/i });
      await user.click(registerTab);

      // Wait for register form to be visible
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /create account/i })
        ).toBeInTheDocument();
      });

      // Fill out the registration form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Assert that registerUser was called with correct data
      await waitFor(() => {
        expect(mockRegisterUser).toHaveBeenCalledTimes(1);
        expect(mockRegisterUser).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      // Assert that success toast was shown
      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          'Registration successful!'
        );
      });
    });

    it('should show error toast on registration failure', async () => {
      // Mock registration failure
      const errorMessage = 'User with this email already exists';
      mockRegisterUser.mockRejectedValue(new Error(errorMessage));

      renderAuthModalWithToaster();
      await openModalAndWait();

      // Click on Register tab
      const registerTab = screen.getByRole('tab', { name: /register/i });
      await user.click(registerTab);

      // Wait for register form to be visible
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /create account/i })
        ).toBeInTheDocument();
      });

      // Fill out the registration form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Assert that error toast was shown
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(errorMessage);
      });

      // Modal should still be open on error
      expect(screen.getByText('Welcome to TypeAmp')).toBeInTheDocument();
    });
  });

  describe('Login', () => {
    it('should call loginUser with form data on login submission', async () => {
      // Mock successful login response
      const mockResponse = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          createdAt: '2023-01-01T00:00:00.000Z',
        },
        token: 'jwt-token-123',
      };
      mockLoginUser.mockResolvedValue(mockResponse);

      renderAuthModalWithToaster();
      await openModalAndWait();

      // Login tab should be active by default
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /sign in/i })
        ).toBeInTheDocument();
      });

      // Fill out the login form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Assert that loginUser was called with correct data
      await waitFor(() => {
        expect(mockLoginUser).toHaveBeenCalledTimes(1);
        expect(mockLoginUser).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      // Assert that success toast was shown
      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Login successful!');
      });
    });

    it('should show error toast on login failure', async () => {
      // Mock login failure
      const errorMessage = 'Invalid credentials';
      mockLoginUser.mockRejectedValue(new Error(errorMessage));

      renderAuthModalWithToaster();
      await openModalAndWait();

      // Login tab should be active by default
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /sign in/i })
        ).toBeInTheDocument();
      });

      // Fill out the login form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      // Assert that error toast was shown
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(errorMessage);
      });

      // Modal should still be open on error
      expect(screen.getByText('Welcome to TypeAmp')).toBeInTheDocument();
    });
  });

  describe('Modal State', () => {
    it('should close modal on successful login', async () => {
      // Mock successful login
      mockLoginUser.mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'test@example.com',
          createdAt: '2023-01-01T00:00:00.000Z',
        },
        token: 'jwt-token-123',
      });

      renderAuthModalWithToaster();
      await openModalAndWait();

      // Fill out and submit login form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Modal should close after successful login
      await waitFor(() => {
        expect(
          screen.queryByText('Welcome to TypeAmp')
        ).not.toBeInTheDocument();
      });
    });

    it('should close modal on successful registration', async () => {
      // Mock successful registration
      mockRegisterUser.mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'test@example.com',
          createdAt: '2023-01-01T00:00:00.000Z',
        },
        token: 'jwt-token-123',
      });

      renderAuthModalWithToaster();
      await openModalAndWait();

      // Switch to register tab and submit
      const registerTab = screen.getByRole('tab', { name: /register/i });
      await user.click(registerTab);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /create account/i })
        ).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Modal should close after successful registration
      await waitFor(() => {
        expect(
          screen.queryByText('Welcome to TypeAmp')
        ).not.toBeInTheDocument();
      });
    });
  });
});
