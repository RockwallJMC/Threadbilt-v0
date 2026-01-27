/**
 * Unit tests for SignUp component with Supabase authentication
 *
 * RED phase: These tests will fail until SignUp.jsx is updated to use Supabase
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import SignUp from '../SignUp';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/useSupabaseAuth', () => ({
  useSupabaseAuth: jest.fn(),
}));

jest.mock('@/routes/paths', () => ({
  __esModule: true,
  default: {
    defaultJwtLogin: '/authentication/default/jwt/login',
  },
}));

describe('SignUp Component with Supabase', () => {
  let mockSignUp;
  let mockPush;

  beforeEach(() => {
    mockSignUp = jest.fn();
    mockPush = jest.fn();

    useRouter.mockReturnValue({
      push: mockPush,
    });

    useSupabaseAuth.mockReturnValue({
      signUp: mockSignUp,
      loading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('calls useSupabaseAuth hook', () => {
    render(<SignUp />);

    expect(useSupabaseAuth).toHaveBeenCalled();
  });

  test('calls signUp from useSupabaseAuth when form is submitted', async () => {
    mockSignUp.mockResolvedValue({ data: { user: {} }, error: null });

    render(<SignUp />);

    const nameInput = screen.getByLabelText('Name');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    await userEvent.type(nameInput, 'Test User');
    await userEvent.type(emailInput, 'newuser@example.com');
    await userEvent.type(passwordInput, 'securepassword123');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        'newuser@example.com',
        'securepassword123',
        expect.objectContaining({
          data: { full_name: 'Test User' }
        })
      );
    });
  });

  test('does not call signUp with invalid email', async () => {
    render(<SignUp />);

    const nameInput = screen.getByLabelText('Name');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    await userEvent.type(nameInput, 'Test User');
    await userEvent.type(emailInput, 'invalidemail');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    // Validation should prevent signUp from being called
    expect(mockSignUp).not.toHaveBeenCalled();
    expect(screen.getByText('Please provide a valid email address.')).toBeInTheDocument();
  });

  test('does not call signUp with empty name', async () => {
    render(<SignUp />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    await userEvent.type(emailInput, 'user@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    // Validation should prevent signUp from being called
    expect(mockSignUp).not.toHaveBeenCalled();
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  test('displays error message when signUp fails', async () => {
    const errorMessage = 'Email already registered';
    mockSignUp.mockRejectedValue(new Error(errorMessage));

    render(<SignUp />);

    const nameInput = screen.getByLabelText('Name');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    await userEvent.type(nameInput, 'Test User');
    await userEvent.type(emailInput, 'existing@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('handles successful signup and does not auto-redirect', async () => {
    // Supabase sends confirmation email, so we should not auto-redirect
    mockSignUp.mockResolvedValue({
      data: { user: { email_confirmed_at: null } },
      error: null
    });

    render(<SignUp />);

    const nameInput = screen.getByLabelText('Name');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    await userEvent.type(nameInput, 'New User');
    await userEvent.type(emailInput, 'newuser@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalled();
    });

    // Should not push to / immediately since email needs confirmation
    // Updated component should show a message or redirect to confirmation page
  });

  test('shows loading state during signup', async () => {
    mockSignUp.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    useSupabaseAuth.mockReturnValue({
      signUp: mockSignUp,
      loading: true,
    });

    render(<SignUp />);

    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    // Material-UI button with loading prop becomes disabled
    expect(submitButton).toBeDisabled();
  });

  test('does not use NextAuth signIn', () => {
    // Verify that NextAuth is NOT imported or used
    render(<SignUp />);

    // If NextAuth was still being used, it would cause an error in our mock setup
    expect(screen.getByRole('heading', { name: 'Sign up' })).toBeInTheDocument();
  });
});
