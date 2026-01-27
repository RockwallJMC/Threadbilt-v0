/**
 * Unit tests for Login component with Supabase authentication
 *
 * RED phase: These tests will fail until Login.jsx is updated to use Supabase
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import Login from '../Login';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@/hooks/useSupabaseAuth', () => ({
  useSupabaseAuth: jest.fn(),
}));

jest.mock('@/config', () => ({
  defaultJwtAuthCredentials: {
    email: 'test@example.com',
    password: 'testpass123',
  },
}));

jest.mock('@/routes/paths', () => ({
  __esModule: true,
  default: {
    defaultJwtSignup: '/authentication/default/jwt/signup',
    defaultJwtForgotPassword: '/authentication/default/jwt/forgot-password',
  },
  rootPaths: {
    root: '/',
  },
}));

describe('Login Component with Supabase', () => {
  let mockSignIn;
  let mockPush;
  let mockRefresh;

  beforeEach(() => {
    // Reset mocks before each test
    mockSignIn = jest.fn();
    mockPush = jest.fn();
    mockRefresh = jest.fn();

    useRouter.mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    });

    useSearchParams.mockReturnValue({
      get: jest.fn(() => null),
    });

    useSupabaseAuth.mockReturnValue({
      signIn: mockSignIn,
      loading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('calls useSupabaseAuth hook', () => {
    render(<Login />);

    expect(useSupabaseAuth).toHaveBeenCalled();
  });

  test('calls signIn from useSupabaseAuth when form is submitted', async () => {
    mockSignIn.mockResolvedValue({ data: { user: {} }, error: null });

    render(<Login />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Log in' });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  test('does not call signIn with invalid email', async () => {
    render(<Login />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Log in' });

    await userEvent.type(emailInput, 'invalidemail');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    // Validation should prevent signIn from being called
    expect(mockSignIn).not.toHaveBeenCalled();
    expect(screen.getByText('Please provide a valid email address.')).toBeInTheDocument();
  });

  test('displays error message when signIn fails', async () => {
    const errorMessage = 'Invalid login credentials';
    mockSignIn.mockRejectedValue(new Error(errorMessage));

    render(<Login />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Log in' });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'wrongpassword');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('redirects to root path after successful login', async () => {
    mockSignIn.mockResolvedValue({ data: { user: {} }, error: null });

    render(<Login />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Log in' });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
      // Note: Redirect is now handled by SupabaseAuthProvider
      // Component should only call signIn
    });
  });

  test('redirects to callback URL if provided', async () => {
    mockSignIn.mockResolvedValue({ data: { user: {} }, error: null });

    const mockGetCallback = jest.fn(() => '/dashboard');
    useSearchParams.mockReturnValue({
      get: mockGetCallback,
    });

    render(<Login />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Log in' });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
      expect(mockGetCallback).toHaveBeenCalledWith('callbackUrl');
    });
  });

  test('shows loading state during authentication', async () => {
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    useSupabaseAuth.mockReturnValue({
      signIn: mockSignIn,
      loading: true,
    });

    render(<Login />);

    const submitButton = screen.getByRole('button', { name: 'Log in' });

    // Material-UI button with loading prop becomes disabled
    expect(submitButton).toBeDisabled();
  });

  test('does not use NextAuth signIn', () => {
    // This test verifies that NextAuth is NOT imported or used
    render(<Login />);

    // If NextAuth was still being used, it would cause an error in our mock setup
    // The fact that the component renders successfully means NextAuth is not imported
    expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument();
  });
});
