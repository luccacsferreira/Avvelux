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

  const saveLocalProfile = (userId, data) => {
    if (!userId) return;
    // Exclude fields we don't want to cache locally or that are sensitive
    const { id, email, ...safeData } = data;
    localStorage.setItem(`avvelux_profile_${userId}`, JSON.stringify(safeData));
  };

  const getLocalProfile = (userId) => {
    if (!userId) return null;
    try {
      const data = localStorage.getItem(`avvelux_profile_${userId}`);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  };

  const fetchProfile = async (userId, email, metadata) => {
    try {
      // Load from localStorage first for immediate UI update
      const localData = getLocalProfile(userId);
      if (localData) {
        setUser(prev => ({ ...(prev || {}), id: userId, email, ...localData }));
      }

      const attemptFetch = async (columns = '*') => {
        const { data, error } = await supabase
          .from('profiles')
          .select(columns)
          .eq('id', userId)
          .single();
        
        if (error) {
          if (error.message?.includes('column') || error.message?.includes('schema cache')) {
            if (columns === '*') {
              console.warn('Selecting all columns failed, retrying with basic set');
              return attemptFetch('id, username, display_name, avatar_url');
            }
          }
          return { data: null, error };
        }
        return { data, error: null };
      };

      let { data, error } = await attemptFetch('*');

      if (error && error.code === 'PGRST116') {
        const baseName = metadata?.display_name?.toLowerCase().replace(/\s+/g, '') || email.split('@')[0].toLowerCase();
        const newProfile = {
          id: userId,
          username: `@${baseName}`,
          display_name: baseName,
          avatar_url: metadata?.avatar_url || '',
          bio: '',
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) {
          const { data: retryData, error: retryError } = await attemptFetch('id, username, display_name, avatar_url');
          if (retryError) throw retryError;
          data = retryData;
        } else {
          data = createdProfile;
        }
      } else if (error) {
        throw error;
      }
      
      const finalData = { ...localData, ...data, id: userId, email };
      setUser(finalData);
      saveLocalProfile(userId, finalData);
      trackDeviceAccount(userId);
    } catch (error) {
      console.error('Error fetching/creating profile:', error);
      const localData = getLocalProfile(userId);
      setUser({ 
        id: userId, 
        email, 
        display_name: metadata?.display_name || email.split('@')[0], 
        onboarding_completed: false,
        ...localData
      });
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
    
    const attemptUpdate = async (updateData) => {
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
      
      if (error) {
        // Check for column missing errors
        if (error.message?.includes('column') || 
            error.message?.includes('schema cache') || 
            error.code === '42703' // PostgreSQL undefined_column
        ) {
          // Identify which column failed from the error message if possible
          const match = error.message.match(/column "(.*?)"/);
          const failingColumn = match ? match[1] : null;
          
          if (failingColumn && updateData[failingColumn] !== undefined) {
            console.warn(`Column "${failingColumn}" missing, retrying without it`);
            const { [failingColumn]: removed, ...rest } = updateData;
            return attemptUpdate(rest);
          }
          
          // If we can't identify the column but it's a schema issue, 
          // try some common optional ones that might be missing in remixed apps
          const commonOptionalCols = ['bio', 'onboarding_completed', 'updated_at'];
          for (const col of commonOptionalCols) {
            if (updateData[col] !== undefined) {
              console.warn(`Attempting retry without common optional column: ${col}`);
              const { [col]: removed, ...rest } = updateData;
              return attemptUpdate(rest);
            }
          }
        }
        throw error;
      }
      return updateData;
    };

    try {
      const finalData = await attemptUpdate(data);
      // Use original 'data' for local state to preserve fields like 'bio' 
      // even if column is missing in DB
      setUser((prev) => {
        const newUser = { ...prev, ...data };
        saveLocalProfile(user.id, newUser);
        return newUser;
      });
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
