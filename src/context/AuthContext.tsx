import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
}

// Default context value
const defaultContextValue: AuthContextType = {
  user: null,
  session: null,
  loading: true,
  error: null,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updateUserProfile: async () => {},
};

// Create context
const AuthContext = createContext<AuthContextType>(defaultContextValue);

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for active session on mount
    setLoading(true);
    
    // Get the current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up
  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        throw error;
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Sign in
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      console.log('Starting sign in process for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('Sign in response:', { 
        success: !error, 
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        errorMessage: error?.message
      });
      
      if (error) {
        console.error('Supabase auth error:', error.message);
        throw error;
      } else if (data?.user) {
        console.log('Sign in successful, setting user:', data.user.email);
        setUser(data.user);
        setSession(data.session);
      }
    } catch (error: any) {
      console.error('Sign in catch block error:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setError(null);
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Password reset function
  const resetPassword = async (email: string) => {
    setError(null);
    setLoading(true);
    try {
      await supabase.auth.resetPasswordForEmail(email);
    } catch (err: any) {
      setError(err.message || 'An error occurred during password reset');
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (displayName: string) => {
    setError(null);
    setLoading(true);
    try {
      // Get the current user first
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        await supabase.auth.updateUser({
          data: {
            user_metadata: {
              ...(currentUser.user_metadata || {}),
              displayName,
            },
          },
        });
        
        // Refresh the user data
        const { data: { user: updatedUser } } = await supabase.auth.getUser();
        if (updatedUser) {
          setUser(updatedUser);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred updating profile');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 