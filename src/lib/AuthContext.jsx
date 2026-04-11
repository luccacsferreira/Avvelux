import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    // Safety timeout to prevent getting stuck on initializing screen
    const timeoutId = setTimeout(() => {
      console.warn('Auth initialization timed out, unblocking UI');
      setIsLoadingAuth(false);
    }, 3000);

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          // Set user basic info first so app can render
          setUser({ id: session.user.id, email: session.user.email, ...session.user.user_metadata });
          // Then fetch full profile in background
          fetchProfile(session.user.id, session.user.email, session.user.user_metadata);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        clearTimeout(timeoutId);
        setIsLoadingAuth(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          // Update user info safely
          setUser(prev => ({ 
            ...(prev || {}), 
            id: session.user.id, 
            email: session.user.email, 
            ...session.user.user_metadata 
          }));
          fetchProfile(session.user.id, session.user.email, session.user.user_metadata);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error in onAuthStateChange:', err);
      } finally {
        setIsLoadingAuth(false);
      }
    });

    return () => {
      clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId, email, metadata) => {
    try {
      // Try to get the profile. The trigger on auth.users should have created it.
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist yet (trigger might be slow or failed)
        // Fallback: create it manually
        const newProfile = {
          id: userId,
          username: metadata?.display_name?.toLowerCase().replace(/\s+/g, '_') || email.split('@')[0],
          display_name: metadata?.display_name || email.split('@')[0],
          avatar_url: metadata?.avatar_url || '',
          bio: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) {
          // If insert fails (maybe trigger just finished), try selecting one last time
          const { data: retryData, error: retryError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          
          if (retryError) throw retryError;
          data = retryData;
        } else {
          data = createdProfile;
        }
      } else if (error) {
        throw error;
      }
      
      setUser({ ...data, email });
      trackDeviceAccount(userId);
    } catch (error) {
      console.error('Error fetching/creating profile:', error);
      // Fallback user object if profile fetch fails completely
      setUser({ id: userId, email, display_name: metadata?.display_name || email.split('@')[0] });
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Email sign in error:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email, password, displayName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });
      if (error) throw error;
      
      if (data.user && !data.session) {
        // Confirmation required
        return { confirmationRequired: true };
      }
      return { success: true };
    } catch (error) {
      console.error('Email sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const updateUser = async (data) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
      
      if (error) throw error;
      setUser((prev) => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const trackDeviceAccount = async (userId) => {
    try {
      // Simple device tracking using localStorage as a proxy for "this device"
      let deviceId = localStorage.getItem('avvelux_device_id');
      if (!deviceId) {
        deviceId = Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('avvelux_device_id', deviceId);
      }

      const { error } = await supabase
        .from('user_accounts')
        .upsert({
          user_id: userId,
          device_id: deviceId,
          last_login: new Date().toISOString()
        }, { onConflict: 'user_id, device_id' });

      if (error) console.error('Error tracking device account:', error);
    } catch (e) {
      console.error('Failed to track device account:', e);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoadingAuth,
    authError,
    isLoginModalOpen,
    setIsLoginModalOpen,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    resetPassword,
    updateUser,
    trackDeviceAccount,
    requireAuth: (callback) => {
      if (user) {
        callback();
      } else {
        setIsLoginModalOpen(true);
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
