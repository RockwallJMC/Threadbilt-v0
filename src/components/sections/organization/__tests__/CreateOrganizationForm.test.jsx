/**
 * Unit tests for CreateOrganizationForm component
 *
 * RED phase: These tests will fail until CreateOrganizationForm.jsx is implemented
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import CreateOrganizationForm from '../CreateOrganizationForm';
import { useCreateOrganization } from '@/services/swr/api-hooks/useOrganizationApi';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/services/swr/api-hooks/useOrganizationApi', () => ({
  useCreateOrganization: jest.fn(),
}));

jest.mock('@/hooks/useSupabaseAuth', () => ({
  useSupabaseAuth: jest.fn(),
}));

describe('CreateOrganizationForm', () => {
  let mockTrigger;
  let mockSetOrganization;
  let mockPush;

  beforeEach(() => {
    mockTrigger = jest.fn();
    mockSetOrganization = jest.fn();
    mockPush = jest.fn();

    useRouter.mockReturnValue({
      push: mockPush,
    });

    useCreateOrganization.mockReturnValue({
      trigger: mockTrigger,
      isMutating: false,
      error: null,
    });

    useSupabaseAuth.mockReturnValue({
      setOrganization: mockSetOrganization,
      user: { id: 'user-123' },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders organization name input field', () => {
    render(<CreateOrganizationForm />);

    expect(screen.getByLabelText(/organization name/i)).toBeInTheDocument();
  });

  test('renders submit button', () => {
    render(<CreateOrganizationForm />);

    expect(screen.getByRole('button', { name: /create organization/i })).toBeInTheDocument();
  });

  test('validates organization name is required', async () => {
    render(<CreateOrganizationForm />);

    const submitButton = screen.getByRole('button', { name: /create organization/i });
    await userEvent.click(submitButton);

    expect(mockTrigger).not.toHaveBeenCalled();
    expect(screen.getByText(/organization name is required/i)).toBeInTheDocument();
  });

  test('validates organization name minimum length', async () => {
    render(<CreateOrganizationForm />);

    const nameInput = screen.getByLabelText(/organization name/i);
    const submitButton = screen.getByRole('button', { name: /create organization/i });

    await userEvent.type(nameInput, 'AB');
    await userEvent.click(submitButton);

    expect(mockTrigger).not.toHaveBeenCalled();
    expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument();
  });

  test('validates organization name maximum length', async () => {
    render(<CreateOrganizationForm />);

    const nameInput = screen.getByLabelText(/organization name/i);
    const submitButton = screen.getByRole('button', { name: /create organization/i });

    // Type 51 characters
    await userEvent.type(nameInput, 'A'.repeat(51));
    await userEvent.click(submitButton);

    expect(mockTrigger).not.toHaveBeenCalled();
    expect(screen.getByText(/at most 50 characters/i)).toBeInTheDocument();
  });

  test('trims whitespace from organization name', async () => {
    mockTrigger.mockResolvedValue('org-123');
    mockSetOrganization.mockResolvedValue();

    render(<CreateOrganizationForm />);

    const nameInput = screen.getByLabelText(/organization name/i);
    const submitButton = screen.getByRole('button', { name: /create organization/i });

    await userEvent.type(nameInput, '  My Organization  ');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockTrigger).toHaveBeenCalledWith({ name: 'My Organization' });
    });
  });

  test('calls useCreateOrganization trigger with organization name', async () => {
    mockTrigger.mockResolvedValue('org-123');
    mockSetOrganization.mockResolvedValue();

    render(<CreateOrganizationForm />);

    const nameInput = screen.getByLabelText(/organization name/i);
    const submitButton = screen.getByRole('button', { name: /create organization/i });

    await userEvent.type(nameInput, 'My Organization');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockTrigger).toHaveBeenCalledWith({ name: 'My Organization' });
    });
  });

  test('calls setOrganization with returned org ID on success', async () => {
    mockTrigger.mockResolvedValue('org-123');
    mockSetOrganization.mockResolvedValue();

    render(<CreateOrganizationForm />);

    const nameInput = screen.getByLabelText(/organization name/i);
    const submitButton = screen.getByRole('button', { name: /create organization/i });

    await userEvent.type(nameInput, 'My Organization');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSetOrganization).toHaveBeenCalledWith('org-123');
    });
  });

  test('displays error message when creation fails', async () => {
    const errorMessage = 'Failed to create organization';
    mockTrigger.mockRejectedValue(new Error(errorMessage));

    render(<CreateOrganizationForm />);

    const nameInput = screen.getByLabelText(/organization name/i);
    const submitButton = screen.getByRole('button', { name: /create organization/i });

    await userEvent.type(nameInput, 'My Organization');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('shows loading state during submission', async () => {
    useCreateOrganization.mockReturnValue({
      trigger: mockTrigger,
      isMutating: true,
      error: null,
    });

    render(<CreateOrganizationForm />);

    const submitButton = screen.getByRole('button', { name: /create organization/i });

    expect(submitButton).toBeDisabled();
  });

  test('disables submit button while mutating', async () => {
    mockTrigger.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('org-123'), 100)));

    render(<CreateOrganizationForm />);

    const nameInput = screen.getByLabelText(/organization name/i);
    const submitButton = screen.getByRole('button', { name: /create organization/i });

    await userEvent.type(nameInput, 'My Organization');
    await userEvent.click(submitButton);

    // Check that button is disabled immediately after click
    expect(submitButton).toBeDisabled();
  });
});
