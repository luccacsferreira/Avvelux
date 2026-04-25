import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/lib/theme';
import { supabase } from '@/lib/supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import VideoSidebar from '../components/video/VideoSidebar';
import { Heart, Share2, Bookmark, MessageCircle, Send } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Comment } from '@/api/entities';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

export default function ClipPlayer() {
  const { isLight } = useTheme();
  const navigate = useNavigate();
  const { user, requireAuth } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [clip, setClip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [muted] = useState(false);
  const [playing, setPlaying] = useState(true);
  const videoRef = useRef(null);
  
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [commentText, setCommentText] = useState('');

  const clipId = searchParams.get('id');

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', clipId],
    queryFn: () => Comment.find({ video_id: clipId }),
    enabled: !!clipId,
  });

  const addCommentMutation = useMutation({
    mutationFn: (data) => Comment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', clipId]);
      setCommentText('');
    },
  });

  const handleAddComment = () => {
    if (!commentText.trim() || !user) return;
    addCommentMutation.mutate({
      video_id: clipId,
      author_id: user.id,
      author_name: user.display_name || user.username || user.email.split('@')[0],
      body: commentText,
    });
  };

  useEffect(() => {
    if (!clipId) {
      navigate(createPageUrl('Clips'));
      return;
    }

    const fetchClip = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('clips')
          .select('*')
          .eq('id', clipId)
          .single();

        if (error) throw error;
        setClip(data);
      } catch (error) {
        console.error('Error fetching clip:', error);
        toast.error('Failed to load clip');
        navigate(createPageUrl('Clips'));
      } finally {
        setLoading(false);
      }
    };

    fetchClip();
  }, [clipId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!clip) return null;

  return (
    <div className={`h-[calc(100vh-56px)] mt-14 flex items-center justify-center overflow-hidden ${isLight ? 'bg-white' : 'bg-[#252525]'}`}>
      <div className="flex items-center justify-center gap-12 w-full h-full max-w-[1800px] px-12 relative">
        {/* Metadata Overlay (Left Side) */}
        <div className="flex-1 max-w-[400px] hidden xl:flex flex-col gap-5 self-start pt-12">
          <h2 className={`text-3xl font-bold leading-tight ${isLight ? 'text-black' : 'text-white'}`}>
            {clip.title}
          </h2>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-base shadow-lg shrink-0">
                {clip.creator_name?.[0]}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className={`font-bold text-base truncate ${isLight ? 'text-black' : 'text-white'}`}>{clip.creator_name}</span>
                <span className="text-gray-500 text-[10px] truncate">@{clip.creator_name?.toLowerCase().replace(/\s+/g, '')}</span>
              </div>
            </div>
            <button className={`px-5 py-1.5 rounded-full text-xs transition-all shadow-md shrink-0 ${isLight ? 'bg-black text-white hover:bg-gray-800' : 'bg-white text-black hover:bg-gray-200'}`}>
              Subscribe
            </button>
          </div>

          <div className="flex gap-3 items-start mt-2">
            <div className={`flex-1 rounded-2xl p-4 flex flex-col gap-2 min-h-[180px] ${isLight ? 'bg-gray-100' : 'bg-white/5'}`}>
              <p className={`text-[11px] font-black ${isLight ? 'text-black' : 'text-white'} opacity-70`}>
                {clip.views || 0} views • {clip.created_at ? new Date(clip.created_at).toLocaleDateString() : 'Just now'}
              </p>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>
                {clip.description}
              </p>
            </div>
            
            {/* Interaction Buttons next to description */}
            <div className="flex flex-col gap-3 shrink-0">
                <button 
                  onClick={() => requireAuth(() => setLiked(!liked))}
                  className={`flex flex-col items-center gap-1 group transition-all ${liked ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}
                >
                  <div className={`p-3 rounded-full ${isLight ? 'bg-gray-100' : 'bg-white/5'} group-hover:bg-red-500/10`}>
                    <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                  </div>
                  <span className="text-[10px] font-bold">{liked ? (clip.likes_count || 0) + 1 : (clip.likes_count || 0)}</span>
                </button>

                <button className={`flex flex-col items-center gap-1 group transition-all text-gray-400 hover:text-white`}>
                  <div className={`p-3 rounded-full ${isLight ? 'bg-gray-100' : 'bg-white/5'} group-hover:bg-white/10`}>
                    <Share2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold">Share</span>
                </button>

                <button 
                  onClick={() => requireAuth(() => setSaved(!saved))}
                  className={`flex flex-col items-center gap-1 group transition-all ${saved ? 'text-purple-400' : 'text-gray-400 hover:text-white'}`}
                >
                  <div className={`p-3 rounded-full ${isLight ? 'bg-gray-100' : 'bg-white/5'} group-hover:bg-purple-500/10`}>
                    <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
                  </div>
                  <span className="text-[10px] font-bold">Save</span>
                </button>
              </div>
            </div>
        </div>

        {/* Video Player */}
        <div className="relative h-[92%] aspect-[9/16] bg-black shadow-2xl flex items-center justify-center rounded-3xl overflow-hidden shrink-0 z-20">
          <video 
            ref={videoRef}
            src={clip.video_url}
            poster={clip.thumbnail_url}
            autoPlay
            loop
            muted={muted}
            playsInline
            className="h-full w-full object-cover cursor-pointer"
            onClick={() => {
              if (videoRef.current.paused) { videoRef.current.play(); setPlaying(true); }
              else { videoRef.current.pause(); setPlaying(false); }
            }}
          />
        </div>

        {/* AI & Notes Sidebar (Right Side) */}
        <div className="flex-1 max-w-[400px] hidden xl:flex flex-col gap-6 h-[92%] pt-4">
          <div className="h-1/2 flex flex-col min-h-0">
            <VideoSidebar video={clip} isLight={isLight} />
          </div>
          
          <div className={`flex-1 flex flex-col min-h-0 rounded-2xl p-4 border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#1a1a1a] border-white/5'}`}>
            <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${isLight ? 'text-black' : 'text-white'}`}>
              <MessageCircle className="w-4 h-4" />
              Comments <span className="text-gray-500 font-normal">{comments.length}</span>
            </h3>

            <ScrollArea className="flex-1 min-h-0 mb-4">
              <div className="space-y-4 pr-3">
                {comments.length === 0 ? (
                  <p className="text-center text-gray-500 text-xs py-10">No comments yet. Be the first!</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">
                        {comment.author_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-xs font-bold truncate ${isLight ? 'text-black' : 'text-white'}`}>
                            {comment.author_name}
                          </span>
                          <span className="text-gray-500 text-[10px] shrink-0">
                            {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : 'Just now'}
                          </span>
                        </div>
                        <p className={`text-xs leading-relaxed ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                          {comment.body}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-2 items-center">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && requireAuth(handleAddComment)}
                placeholder="Add a comment..."
                className={`text-xs h-9 ${isLight ? 'bg-white border-gray-200' : 'bg-black border-white/5 text-white'}`}
              />
              <button 
                onClick={() => requireAuth(handleAddComment)}
                className="p-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:opacity-90 transition-opacity"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
