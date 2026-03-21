import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AuthState {
  isAuthenticated: boolean;
  userEmail: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  isAuthenticated: false,
  userEmail: null,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ error: error.message, isLoading: false });
        return false;
      }

      set({
        isAuthenticated: true,
        userEmail: data.user?.email ?? null,
        isLoading: false,
        error: null,
      });
      return true;
    } catch {
      set({ error: 'Login failed', isLoading: false });
      return false;
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({
      isAuthenticated: false,
      userEmail: null,
      error: null,
    });
  },

  checkSession: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        set({
          isAuthenticated: true,
          userEmail: session.user.email ?? null,
          isLoading: false,
        });
        return true;
      }

      set({ isAuthenticated: false, userEmail: null, isLoading: false });
      return false;
    } catch {
      set({ isAuthenticated: false, userEmail: null, isLoading: false });
      return false;
    }
  },
}));
