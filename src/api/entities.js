import { supabase } from '@/lib/supabase';

const createEntityWrapper = (tableName) => ({
  list: async (orderBy = '-created_at', limit = 20) => {
    let query = supabase.from(tableName).select('*');
    
    if (orderBy) {
      const isDescending = orderBy.startsWith('-');
      const column = isDescending ? orderBy.substring(1) : orderBy;
      query = query.order(column, { ascending: !isDescending });
    }
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  get: async (id) => {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
  create: async (data) => {
    const { data: created, error } = await supabase
      .from(tableName)
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return created;
  },
  update: async (id, data) => {
    const { data: updated, error } = await supabase
      .from(tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return updated;
  },
  delete: async (id) => {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },
  find: async (filter = {}) => {
    let query = supabase.from(tableName).select('*');
    Object.entries(filter).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  filter: async (filter = {}, orderBy = '-created_at', limit = 20) => {
    let query = supabase.from(tableName).select('*');
    Object.entries(filter).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    if (orderBy) {
      const isDescending = orderBy.startsWith('-');
      const column = isDescending ? orderBy.substring(1) : orderBy;
      query = query.order(column, { ascending: !isDescending });
    }
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
});

export const Video = createEntityWrapper('videos');
export const Profile = createEntityWrapper('profiles');
export const VideoSummary = createEntityWrapper('video_summaries');
export const Comment = createEntityWrapper('comments');
export const Like = createEntityWrapper('likes');
export const Post = createEntityWrapper('posts');
export const Clip = createEntityWrapper('clips');
export const Ad = createEntityWrapper('ads');
export const WatchHistory = createEntityWrapper('watch_history');
export const WatchLater = createEntityWrapper('watch_later');

// Legacy mappings for compatibility
export const User = Profile;
export const Story = Video;
export const Course = createEntityWrapper('courses');
export const Group = createEntityWrapper('groups');
export const ForumPost = createEntityWrapper('forum_posts');
export const DirectMessage = createEntityWrapper('direct_messages');
export const Wishlist = createEntityWrapper('wishlists');
export const LikedContent = Like;
export const Playlist = createEntityWrapper('playlists');
export const AIChat = createEntityWrapper('ai_chats');
export const ChatMessage = createEntityWrapper('chat_messages');
export const Note = createEntityWrapper('notes');
export const Follow = createEntityWrapper('follows');
