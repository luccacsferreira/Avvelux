import { supabase } from '@/lib/supabase';
import * as entities from './entities';

export const apiClient = {
  auth: {
    ...supabase.auth,
    me: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (!user) return null;
      
      // Fetch profile data for full compatibility
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile in auth.me:', profileError);
      }
      
      return {
        ...user,
        ...profile,
        id: user.id, // Ensure ID is present
      };
    }
  },
  entities,
  storage: supabase.storage,
};

export const auth = apiClient.auth;
export const entitiesList = apiClient.entities;
export const storage = apiClient.storage;
