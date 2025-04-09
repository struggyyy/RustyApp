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
  updateUserProfile: (displayName: string, avatarUrl?: string) => Promise<void>;
  uploadProfileImage: (uri: string) => Promise<string>;
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
  uploadProfileImage: async () => '',
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
      console.log('Sending password reset email to:', email);
      
      // Create a proper redirect URL for the password reset
      const redirectUrl = 'rusty://reset-password';
      console.log('Using redirect URL:', redirectUrl);
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      if (resetError) {
        console.error('Error sending reset email:', resetError.message);
        throw resetError;
      }
      
      console.log('Password reset email sent successfully');
    } catch (err: any) {
      console.error('Password reset failed:', err.message);
      setError(err.message || 'An error occurred during password reset');
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (displayName: string, avatarUrl?: string) => {
    setError(null);
    setLoading(true);
    try {
      // Get the current user first
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        const updates = {
          data: {
            user_metadata: {
              ...(currentUser.user_metadata || {}),
              displayName,
              ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
            },
          },
        };
        
        const { error: updateError } = await supabase.auth.updateUser(updates);
        
        if (updateError) {
          throw updateError;
        }
        
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

  // Upload profile image
  const uploadProfileImage = async (uri: string) => {
    setError(null);
    setLoading(true);
    try {
      if (!user) throw new Error('No user logged in');

      // Convert the image to a blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Generate a unique filename
      const fileExt = uri.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user profile with the new avatar URL
      await updateUserProfile(user.user_metadata?.displayName || '', publicUrl);

      return publicUrl;
    } catch (err: any) {
      setError(err.message || 'Failed to upload profile image');
      throw err;
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
    uploadProfileImage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 