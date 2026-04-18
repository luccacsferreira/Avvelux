import { supabase } from '@/lib/supabase';

export const videoService = {
  async uploadFile(file, bucket = 'videos') {
    try {
      console.log(`Starting upload to bucket: ${bucket}, file: ${file.name}`);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) {
        console.error(`Supabase Storage Error (${bucket}):`, error);
        throw error;
      }

      console.log(`File uploaded successfully to ${bucket}/${filePath}`);
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error(`Detailed Upload Error (${bucket}):`, error);
      throw error;
    }
  },

  async uploadVideo(videoData) {
    try {
      console.log('Inserting video metadata:', videoData);
      // Ensure we only send fields that exist in the database to avoid errors
      const insertData = {
        creator_id: videoData.creator_id,
        creator_name: videoData.creator_name,
        creator_avatar: videoData.creator_avatar,
        title: videoData.title,
        description: videoData.description,
        video_url: videoData.video_url,
        thumbnail_url: videoData.thumbnail_url,
        category: videoData.category,
        subcategory: videoData.subcategory,
        privacy: videoData.privacy || 'public',
        views: videoData.views || 0,
        likes_count: videoData.likes_count || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('videos')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Supabase Database Error (videos):', error);
        throw error;
      }
      
      console.log('Video metadata inserted successfully, ID:', data.id);
      return data.id;
    } catch (error) {
      console.error('Detailed Video Insert Error:', error);
      throw error;
    }
  },

  async uploadClip(clipData) {
    try {
      console.log('Inserting clip metadata:', clipData);
      const insertData = {
        creator_id: clipData.creator_id,
        creator_name: clipData.creator_name,
        creator_avatar: clipData.creator_avatar,
        title: clipData.title,
        description: clipData.description,
        video_url: clipData.video_url,
        thumbnail_url: clipData.thumbnail_url,
        category: clipData.category,
        subcategory: clipData.subcategory,
        privacy: clipData.privacy || 'public',
        views: clipData.views || 0,
        likes_count: clipData.likes_count || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('clips')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Supabase Database Error (clips):', error);
        throw error;
      }

      console.log('Clip metadata inserted successfully, ID:', data.id);
      return data.id;
    } catch (error) {
      console.error('Detailed Clip Insert Error:', error);
      throw error;
    }
  },

  async getVideos(category = 'All', limitCount = 50) {
    try {
      let query = supabase
        .from('videos')
        .select('*')
        .eq('privacy', 'public') // Only show public videos in general feeds
        .order('created_at', { ascending: false });

      if (category && category !== 'All') {
        // Use ilike for partial matches to handle subcategories or minor name differences
        query = query.ilike('category', `%${category}%`);
      }

      const { data, error } = await query.limit(limitCount);
      if (error) throw error;
      
      console.log(`Fetched ${data?.length || 0} real videos from Supabase for category: ${category}`);
      return data || [];
    } catch (error) {
      console.error('Error getting videos:', error);
      return [];
    }
  },

  async getVideoById(id) {
    console.log('Fetching video with ID:', id);
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Supabase error in getVideoById:', error);
        throw error;
      }
      console.log('Successfully fetched video data:', data);
      return data;
    } catch (error) {
      console.error('Error getting video by id:', error);
      return null;
    }
  },

  async getClips(limitCount = 50) {
    try {
      const { data, error } = await supabase
        .from('clips')
        .select('*')
        .eq('privacy', 'public') // Only show public clips in discovery feeds
        .order('created_at', { ascending: false })
        .limit(limitCount);

      if (error) {
        console.error('Supabase Query Error (clips):', error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} real clips from Supabase`);
      return data || [];
    } catch (error) {
      console.error('Error getting clips:', error);
      if (error.details) console.error('Error details:', error.details);
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
  },
  
  async getVideosByUser(userId, currentUserId = null) {
    let query = supabase.from('videos').select('*').eq('creator_id', userId);
    
    // If not the owner, only show public/unlisted
    if (userId !== currentUserId) {
      query = query.in('privacy', ['public', 'unlisted']);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getClipsByUser(userId, currentUserId = null) {
    let query = supabase.from('clips').select('*').eq('creator_id', userId);
    
    if (userId !== currentUserId) {
      query = query.in('privacy', ['public', 'unlisted']);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getPostsByUser(userId, currentUserId = null) {
    let query = supabase.from('posts').select('*').eq('creator_id', userId);
    
    if (userId !== currentUserId) {
      query = query.in('privacy', ['public', 'unlisted']);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }
};
