import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  name?: string;
  email_verified: boolean;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,

      signIn: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            throw new Error(error.message || 'Failed to sign in');
          }

          if (!data.session || !data.user) {
            throw new Error('No session or user returned');
          }

          const user: User = {
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.name || data.user.user_metadata?.full_name,
            email_verified: data.user.email_confirmed_at !== null,
          };

          set({
            user,
            session: data.session,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      signUp: async (email: string, password: string, name?: string) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: name || '',
                full_name: name || '',
              },
            },
          });

          if (error) {
            throw new Error(error.message || 'Failed to sign up');
          }

          if (!data.session || !data.user) {
            // User might need to verify email first
            throw new Error('Please check your email to verify your account');
          }

          const user: User = {
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || name,
            email_verified: data.user.email_confirmed_at !== null,
          };

          set({
            user,
            session: data.session,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      signOut: async () => {
        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.error('Sign out error:', error);
        } finally {
          set({
            user: null,
            session: null,
            isAuthenticated: false,
          });
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error || !session || !session.user) {
            set({ isAuthenticated: false, user: null, session: null, isLoading: false });
            return;
          }

          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.user_metadata?.full_name,
            email_verified: session.user.email_confirmed_at !== null,
          };

          set({
            user,
            session,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isAuthenticated: false, user: null, session: null, isLoading: false });
        }
      },

      forgotPassword: async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
          throw new Error(error.message || 'Failed to send reset email');
        }
      },

      resetPassword: async (_token: string, password: string) => {
        // Note: With Supabase, password reset is handled through URL callbacks
        // The ResetPassword component handles this directly
        // This function is kept for compatibility but may not be used
        const { error } = await supabase.auth.updateUser({
          password: password,
        });

        if (error) {
          throw new Error(error.message || 'Failed to reset password');
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        session: state.session,
        user: state.user 
      }),
    }
  )
);

// Listen to auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  const store = useAuthStore.getState();
  
  if (event === 'SIGNED_IN' && session) {
    store.checkAuth();
  } else if (event === 'SIGNED_OUT') {
    store.signOut();
  }
});
