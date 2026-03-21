import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '../stores/authStore';

// Mock Supabase for auth tests
const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();
const mockGetSession = vi.fn();

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
  },
}));

describe('Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useAuthStore.setState({
      isAuthenticated: false,
      userEmail: null,
      isLoading: true,
      error: null,
    });
  });

  it('should start in unauthenticated state', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.userEmail).toBeNull();
  });

  it('should reject invalid credentials', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    });

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      const success = await result.current.login('bad@email.com', 'wrong');
      expect(success).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe('Invalid login credentials');
  });

  it('should authenticate with valid credentials', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: {
        user: { email: 'julian@treedigits.ca' },
        session: { access_token: 'token' },
      },
      error: null,
    });

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      const success = await result.current.login('julian@treedigits.ca', 'password');
      expect(success).toBe(true);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.userEmail).toBe('julian@treedigits.ca');
  });

  it('should clear state on logout', async () => {
    mockSignOut.mockResolvedValue({ error: null });

    useAuthStore.setState({
      isAuthenticated: true,
      userEmail: 'julian@treedigits.ca',
    });

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.userEmail).toBeNull();
  });

  it('should restore session on checkSession', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: { email: 'liz@treedigits.ca' },
        },
      },
    });

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      const valid = await result.current.checkSession();
      expect(valid).toBe(true);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.userEmail).toBe('liz@treedigits.ca');
  });

  it('should handle no active session', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
    });

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      const valid = await result.current.checkSession();
      expect(valid).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
  });
});
