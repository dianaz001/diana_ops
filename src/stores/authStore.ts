import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

interface AuthState {
  isAuthenticated: boolean;
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
  login: (password: string, rememberMe: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      sessionId: null,
      isLoading: true,
      error: null,

      login: async (password: string, rememberMe: boolean) => {
        set({ isLoading: true, error: null });
        try {
          // Check password against config
          const { data: configData, error: configError } = await supabase
            .from('juliz_portal_config')
            .select('value')
            .eq('key', 'password_hash')
            .single();

          if (configError || !configData) {
            // If no password configured, create a default one (for initial setup)
            // In production, you'd want to set this up properly
            set({ error: 'Portal not configured. Please set up password.', isLoading: false });
            return false;
          }

          // Simple password check (in production, use proper bcrypt comparison)
          // For now, we'll do a simple hash comparison
          const inputHash = await hashPassword(password);
          if (inputHash !== configData.value) {
            set({ error: 'Incorrect password', isLoading: false });
            return false;
          }

          // Create session
          const expiresAt = new Date();
          if (rememberMe) {
            expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
          } else {
            expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours
          }

          const { data: sessionData, error: sessionError } = await supabase
            .from('juliz_portal_sessions')
            .insert({
              expires_at: expiresAt.toISOString(),
              remember_me: rememberMe,
            })
            .select()
            .single();

          if (sessionError || !sessionData) {
            set({ error: 'Failed to create session', isLoading: false });
            return false;
          }

          set({
            isAuthenticated: true,
            sessionId: sessionData.id,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (err) {
          set({ error: 'Login failed', isLoading: false });
          return false;
        }
      },

      logout: async () => {
        const { sessionId } = get();
        if (sessionId) {
          await supabase
            .from('juliz_portal_sessions')
            .delete()
            .eq('id', sessionId);
        }
        set({
          isAuthenticated: false,
          sessionId: null,
          error: null,
        });
      },

      checkSession: async () => {
        const { sessionId } = get();
        if (!sessionId) {
          set({ isAuthenticated: false, isLoading: false });
          return false;
        }

        try {
          const { data, error } = await supabase
            .from('juliz_portal_sessions')
            .select('*')
            .eq('id', sessionId)
            .single();

          if (error || !data) {
            set({ isAuthenticated: false, sessionId: null, isLoading: false });
            return false;
          }

          // Check if session expired
          if (new Date(data.expires_at) < new Date()) {
            await supabase
              .from('juliz_portal_sessions')
              .delete()
              .eq('id', sessionId);
            set({ isAuthenticated: false, sessionId: null, isLoading: false });
            return false;
          }

          set({ isAuthenticated: true, isLoading: false });
          return true;
        } catch {
          set({ isAuthenticated: false, sessionId: null, isLoading: false });
          return false;
        }
      },
    }),
    {
      name: 'juliz-portal-auth',
      partialize: (state) => ({ sessionId: state.sessionId }),
    }
  )
);

// Simple hash function for demo (in production, use bcrypt on server)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
