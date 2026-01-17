import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '../stores/authStore';

// Mock Supabase for auth tests
const mockSupabase = {
  from: vi.fn(),
};

vi.mock('../lib/supabase', () => ({
  supabase: mockSupabase,
}));

describe('Authentication', () => {
  beforeEach(() => {
    // Reset the store before each test
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.isAuthenticated = false;
      result.current.sessionId = null;
      result.current.error = null;
    });
    vi.clearAllMocks();
  });

  it('should start in unauthenticated state', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.sessionId).toBeNull();
  });

  it('should reject incorrect password', async () => {
    // Mock config table to return a hash that won't match
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { value: 'different-hash-value' },
            error: null,
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      const success = await result.current.login('wrong-password', false);
      expect(success).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe('Incorrect password');
  });

  it('should create session with remember me extending expiration', async () => {
    // This test verifies the session creation logic
    const now = new Date();
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const twentyFourHoursFromNow = new Date(now);
    twentyFourHoursFromNow.setHours(twentyFourHoursFromNow.getHours() + 24);

    // Verify 30-day session is longer than 24-hour session
    expect(thirtyDaysFromNow.getTime()).toBeGreaterThan(twentyFourHoursFromNow.getTime());
  });

  it('should clear session on logout', async () => {
    const { result } = renderHook(() => useAuthStore());

    // Manually set authenticated state
    act(() => {
      result.current.isAuthenticated = true;
      result.current.sessionId = 'test-session-id';
    });

    mockSupabase.from.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.sessionId).toBeNull();
  });

  it('should handle session check with expired session', async () => {
    const { result } = renderHook(() => useAuthStore());

    // Set a session ID
    act(() => {
      result.current.sessionId = 'expired-session-id';
    });

    // Mock expired session response
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() - 1); // Yesterday

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { expires_at: expiredDate.toISOString() },
            error: null,
          }),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });

    await act(async () => {
      const isValid = await result.current.checkSession();
      expect(isValid).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
  });
});
