import { supabase } from '@/lib/supabase';

export const videoService = {
  async uploadFile(file, bucket = 'videos') {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  async uploadVideo(videoData) {
    try {
      const { data, error } = await supabase
        .from('videos')
        .insert([{
          ...videoData,
          likes_count: videoData.likes || 0,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  },

  async uploadClip(clipData) {
    try {
      const { data, error } = await supabase
        .from('clips')
        .insert([{
          ...clipData,
          likes_count: clipData.likes || 0,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error uploading clip:', error);
      throw error;
    }
  },

  async getVideos(category = 'All', limitCount = 20) {
    try {
      let query = supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limitCount);

      if (category !== 'All') {
        query = query.ilike('category', `%${category}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting videos:', error);
      return [];
    }
  },

  async getClips(limitCount = 50) {
    try {
      const { data, error } = await supabase
        .from('clips')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limitCount);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting clips:', error);
      return [];
    }
  },

  async getAds() {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting ads:', error);
      return [];
    }
  },

  async incrementViews(tableName, docId) {
    try {
      // Supabase doesn't have a direct increment operator like Firebase in a single call without RPC
      // But we can do it with a simple update if we don't care about race conditions for now
      // Or use an RPC function if defined in Supabase
      const { data: current } = await supabase
        .from(tableName)
        .select('views')
        .eq('id', docId)
        .single();
      
      const newViews = (current?.views || 0) + 1;
      
      await supabase
        .from(tableName)
        .update({ views: newViews })
        .eq('id', docId);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  },
  // Playlist Management
  async getPlaylists(userId) {
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createPlaylist(userId, name, isPublic = false) {
    const { data, error } = await supabase
      .from('playlists')
      .insert([{ user_id: userId, name, is_public: isPublic }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Likes
  async toggleLike(userId, contentId, contentType) {
    // Check if already liked
    const { data: existing } = await supabase
      .from('likes')
      .select('*')
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('id', existing.id);
      if (error) throw error;
      return { liked: false };
    } else {
      const { error } = await supabase
        .from('likes')
        .insert([{ user_id: userId, content_id: contentId, content_type: contentType }]);
      if (error) throw error;
      return { liked: true };
    }
  },

  // Watch History
  async addToHistory(userId, contentId, contentType = 'video') {
    const { error } = await supabase
      .from('watch_history')
      .upsert({
        user_id: userId,
        content_id: contentId,
        content_type: contentType,
        watched_at: new Date().toISOString()
      }, { onConflict: 'user_id, content_id, content_type' });
    if (error) console.error('Error adding to history:', error);
  },

  async getWatchHistory(userId) {
    const { data, error } = await supabase
      .from('watch_history')
      .select('*, videos(*), clips(*)')
      .eq('user_id', userId)
      .order('watched_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};
