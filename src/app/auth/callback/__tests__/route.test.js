/**
 * OAuth Callback Route Handler Tests
 * Following TDD approach - these tests are written BEFORE implementation
 */

import { GET } from '../route';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Mock dependencies
jest.mock('@/lib/supabase/server');
jest.mock('next/server', () => ({
  NextResponse: {
    redirect: jest.fn((url) => ({
      type: 'redirect',
      url: url.toString(),
    })),
  },
}));

describe('OAuth Callback Route Handler', () => {
  let mockSupabase;
  let mockRequest;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create mock Supabase client
    mockSupabase = {
      auth: {
        exchangeCodeForSession: jest.fn(),
        getUser: jest.fn(),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
    };

    // Mock createClient to return our mock Supabase instance
    createClient.mockResolvedValue(mockSupabase);

    // Create base mock request
    mockRequest = {
      url: 'http://localhost:4000/auth/callback',
    };
  });

  describe('RED Phase - Watch these tests fail', () => {
    test('exchanges OAuth code for session', async () => {
      // Arrange
      const authCode = 'test-oauth-code-123';
      mockRequest.url = `http://localhost:4000/auth/callback?code=${authCode}`;

      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
        data: { session: { access_token: 'mock-token' } },
        error: null,
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Mock organization check - user has organization
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { organization_id: 'org-123', is_active: true },
              error: null,
            }),
          }),
        }),
      });

      // Act
      await GET(mockRequest);

      // Assert
      expect(createClient).toHaveBeenCalled();
      expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledWith(authCode);
    });

    test('redirects to dashboard when user has organization', async () => {
      // Arrange
      const authCode = 'test-oauth-code-123';
      mockRequest.url = `http://localhost:4000/auth/callback?code=${authCode}`;

      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
        data: { session: { access_token: 'mock-token' } },
        error: null,
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Mock organization check - user has organization
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { organization_id: 'org-123', is_active: true },
              error: null,
            }),
          }),
        }),
      });

      // Act
      const response = await GET(mockRequest);

      // Assert
      expect(NextResponse.redirect).toHaveBeenCalled();
      const redirectUrl = NextResponse.redirect.mock.calls[0][0].pathname;
      expect(redirectUrl).toBe('/');
    });

    test('redirects to organization-setup when user has no organization', async () => {
      // Arrange
      const authCode = 'test-oauth-code-123';
      mockRequest.url = `http://localhost:4000/auth/callback?code=${authCode}`;

      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
        data: { session: { access_token: 'mock-token' } },
        error: null,
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Mock organization check - user has NO organization
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }, // No rows returned
            }),
          }),
        }),
      });

      // Act
      const response = await GET(mockRequest);

      // Assert
      expect(NextResponse.redirect).toHaveBeenCalled();
      const redirectUrl = NextResponse.redirect.mock.calls[0][0].pathname;
      expect(redirectUrl).toBe('/organization-setup');
    });

    test('redirects to login with error when code exchange fails', async () => {
      // Arrange
      const authCode = 'invalid-code';
      mockRequest.url = `http://localhost:4000/auth/callback?code=${authCode}`;

      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid authorization code' },
      });

      // Act
      const response = await GET(mockRequest);

      // Assert
      expect(NextResponse.redirect).toHaveBeenCalled();
      const redirectUrl = NextResponse.redirect.mock.calls[0][0];
      expect(redirectUrl.pathname).toBe('/authentication/default/jwt/login');
      expect(redirectUrl.searchParams.get('error')).toBe('auth_failed');
    });

    test('redirects to login when no code provided', async () => {
      // Arrange - no code in URL
      mockRequest.url = 'http://localhost:4000/auth/callback';

      // Act
      const response = await GET(mockRequest);

      // Assert
      expect(NextResponse.redirect).toHaveBeenCalled();
      const redirectUrl = NextResponse.redirect.mock.calls[0][0];
      expect(redirectUrl.pathname).toBe('/authentication/default/jwt/login');
      expect(mockSupabase.auth.exchangeCodeForSession).not.toHaveBeenCalled();
    });

    test('handles database errors gracefully when checking organization', async () => {
      // Arrange
      const authCode = 'test-oauth-code-123';
      mockRequest.url = `http://localhost:4000/auth/callback?code=${authCode}`;

      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
        data: { session: { access_token: 'mock-token' } },
        error: null,
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Mock database error when checking organization
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database connection error', code: 'DB_ERROR' },
            }),
          }),
        }),
      });

      // Act
      const response = await GET(mockRequest);

      // Assert
      expect(NextResponse.redirect).toHaveBeenCalled();
      const redirectUrl = NextResponse.redirect.mock.calls[0][0];
      expect(redirectUrl.pathname).toBe('/authentication/default/jwt/login');
      expect(redirectUrl.searchParams.get('error')).toBe('server_error');
    });
  });
});
