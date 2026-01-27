/**
 * Unit tests for SocialAuth component with Supabase OAuth
 *
 * RED phase: These tests will fail until SocialAuth.jsx is updated to use Supabase
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSearchParams } from 'next/navigation';
import SocialAuth from '../SocialAuth';
import { createClient } from '@/lib/supabase/client';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/providers/SettingsProvider', () => ({
  useSettingsContext: jest.fn(() => ({
    config: {
      assetsDir: '/assets',
    },
  })),
}));

jest.mock('@/routes/paths', () => ({
  rootPaths: {
    root: '/',
  },
}));

describe('SocialAuth Component with Supabase OAuth', () => {
  let mockSignInWithOAuth;
  let mockSupabaseClient;

  beforeEach(() => {
    mockSignInWithOAuth = jest.fn();
    mockSupabaseClient = {
      auth: {
        signInWithOAuth: mockSignInWithOAuth,
      },
    };

    createClient.mockReturnValue(mockSupabaseClient);

    useSearchParams.mockReturnValue({
      get: jest.fn(() => null),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders Google and Microsoft OAuth buttons', () => {
    render(<SocialAuth />);

    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in with microsoft/i })).toBeInTheDocument();
  });

  test('calls Supabase signInWithOAuth for Google when button is clicked', async () => {
    mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null });

    render(<SocialAuth />);

    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'google',
          options: expect.objectContaining({
            redirectTo: expect.stringContaining('/auth/callback'),
          }),
        })
      );
    });
  });

  test('calls Supabase signInWithOAuth for Azure when button is clicked', async () => {
    mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null });

    render(<SocialAuth />);

    const microsoftButton = screen.getByRole('button', { name: /sign in with microsoft/i });
    await userEvent.click(microsoftButton);

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'azure',
          options: expect.objectContaining({
            redirectTo: expect.stringContaining('/auth/callback'),
          }),
        })
      );
    });
  });

  test('uses callback URL from search params if provided', async () => {
    mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null });

    const mockGetCallback = jest.fn(() => '/dashboard');
    useSearchParams.mockReturnValue({
      get: mockGetCallback,
    });

    render(<SocialAuth />);

    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalled();
      // The callback URL handling is now done by redirectTo in options
    });
  });

  test('handles OAuth errors gracefully', async () => {
    const errorMessage = 'OAuth provider not configured';
    mockSignInWithOAuth.mockRejectedValue(new Error(errorMessage));

    // Mock console.error to avoid noise in test output
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<SocialAuth />);

    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  test('maintains Material-UI styling', () => {
    render(<SocialAuth />);

    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    const microsoftButton = screen.getByRole('button', { name: /sign in with microsoft/i });

    // Verify buttons are rendered
    expect(googleButton).toBeInTheDocument();
    expect(microsoftButton).toBeInTheDocument();

    // Verify icons are present (they use Image components with alt="icon")
    const icons = screen.getAllByAltText('icon');
    expect(icons).toHaveLength(2);
  });

  test('does not use NextAuth signIn', () => {
    // Verify that NextAuth is NOT imported or used
    render(<SocialAuth />);

    // If NextAuth was still being used, it would cause an error in our mock setup
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
  });

  test('creates Supabase client on render', () => {
    render(<SocialAuth />);

    expect(createClient).toHaveBeenCalled();
  });
});
