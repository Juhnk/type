import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LearnPage from './page';

// Mock all external dependencies
vi.mock('@/lib/api-client', () => ({
  generateChallenge: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/store/useGameStore', () => ({
  useGameStore: vi.fn(),
}));

vi.mock('@/store/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Import mocked modules
import { generateChallenge } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/useGameStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

describe('LearnPage', () => {
  const mockPush = vi.fn();
  const mockSetTextToType = vi.fn();
  const mockSetTestConfig = vi.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Setup default mock implementations
    (useRouter as any).mockReturnValue({
      push: mockPush,
    });

    (useGameStore as any).mockReturnValue({
      setTextToType: mockSetTextToType,
      setTestConfig: mockSetTestConfig,
    });

    (useAuthStore as any).mockReturnValue({
      token: 'mock-auth-token',
    });
  });

  it('should allow a user to generate text and start a practice session', async () => {
    const user = userEvent.setup();
    const mockGeneratedText =
      'This is a sample AI-generated text about space exploration.';

    // Mock successful API response
    (generateChallenge as any).mockResolvedValue({
      text: mockGeneratedText,
      metadata: {
        source: 'ai',
        difficulty: 'medium',
        context: 'space exploration',
      },
    });

    // Render the component
    render(<LearnPage />);

    // Find and interact with the input field
    const input = screen.getByPlaceholderText(
      'Enter a topic for AI-generated practice text...'
    );
    await user.type(input, 'space exploration');

    // Find and click the Generate button
    const generateButton = screen.getByRole('button', { name: /generate/i });
    expect(generateButton).toBeEnabled();
    await user.click(generateButton);

    // Wait for the loading state to finish and API call to complete

    // Wait for the API call to complete
    await waitFor(() => {
      expect(generateChallenge).toHaveBeenCalledWith(
        'space exploration',
        'mock-auth-token'
      );
    });

    // Wait for the generated text to appear
    await waitFor(() => {
      expect(screen.getByText(/generated text:/i)).toBeInTheDocument();
    });

    // Check that the textarea contains the generated text
    const textarea = screen.getByPlaceholderText(
      'Your generated text will appear here...'
    );
    expect(textarea).toHaveValue(mockGeneratedText);
    expect(textarea).toHaveAttribute('readOnly');

    // Check that success toast was called
    expect(toast.success).toHaveBeenCalledWith('Text generated successfully!');

    // Find and click the Practice button
    const practiceButton = screen.getByRole('button', {
      name: /practice this text/i,
    });
    expect(practiceButton).toBeInTheDocument();
    await user.click(practiceButton);

    // Verify game store actions were called
    expect(mockSetTestConfig).toHaveBeenCalledWith({ mode: 'quote' });
    expect(mockSetTextToType).toHaveBeenCalledWith(mockGeneratedText);

    // Verify navigation occurred
    expect(mockPush).toHaveBeenCalledWith('/');

    // Verify success toast for practice session
    expect(toast.success).toHaveBeenCalledWith(
      'Starting practice session with AI-generated text!'
    );
  });

  it('should show error when trying to generate without authentication', async () => {
    const user = userEvent.setup();

    // Mock no auth token
    (useAuthStore as any).mockReturnValue({
      token: null,
    });

    render(<LearnPage />);

    // Type a topic
    const input = screen.getByPlaceholderText(
      'Enter a topic for AI-generated practice text...'
    );
    await user.type(input, 'test topic');

    // Click generate
    const generateButton = screen.getByRole('button', { name: /generate/i });
    await user.click(generateButton);

    // Verify error toast
    expect(toast.error).toHaveBeenCalledWith(
      'Please log in to use AI text generation'
    );

    // Verify API was not called
    expect(generateChallenge).not.toHaveBeenCalled();
  });

  it('should show error when trying to generate with empty topic', async () => {
    const user = userEvent.setup();

    render(<LearnPage />);

    // Click generate without entering topic
    const generateButton = screen.getByRole('button', { name: /generate/i });
    await user.click(generateButton);

    // Verify error toast
    expect(toast.error).toHaveBeenCalledWith(
      'Please enter a topic to generate text'
    );

    // Verify API was not called
    expect(generateChallenge).not.toHaveBeenCalled();
  });

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup();

    // Mock API error
    (generateChallenge as any).mockRejectedValue(
      new Error('Failed to generate text')
    );

    render(<LearnPage />);

    // Enter topic and generate
    const input = screen.getByPlaceholderText(
      'Enter a topic for AI-generated practice text...'
    );
    await user.type(input, 'test topic');

    const generateButton = screen.getByRole('button', { name: /generate/i });
    await user.click(generateButton);

    // Wait for error handling
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to generate text. Please try again.'
      );
    });

    // Verify loading state is cleared
    expect(screen.queryByText(/generating.../i)).not.toBeInTheDocument();

    // Verify Practice button is not shown
    expect(
      screen.queryByRole('button', { name: /practice this text/i })
    ).not.toBeInTheDocument();
  });
});
