import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { Heart, MessageCircle, Share2, Bookmark, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';

export default function ClipPlayer() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [clip, setClip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [muted, setMuted] = useState(false);

  const clipId = searchParams.get('id');

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
    <div className="max-w-4xl mx-auto py-4">
      <Link to={createPageUrl('Clips')} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-5 h-5" />
        Back to Clips
      </Link>

      <div className="flex flex-col md:flex-row justify-center items-start gap-8">
        {/* Clip Video */}
        <div className="relative w-full max-w-[350px] aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl mx-auto md:mx-0">
          {clip.video_url ? (
            <video 
              src={clip.video_url}
              poster={clip.thumbnail_url}
              autoPlay
              loop
              muted={muted}
              className="w-full h-full object-contain"
            />
          ) : (
            <img 
              src={clip.thumbnail_url}
              alt={clip.title}
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Bottom Gradient */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
            <h2 className="text-white font-bold text-lg mb-1 drop-shadow-lg">{clip.title}</h2>
            <p className="text-gray-300 text-sm drop-shadow-md">@{clip.creator_name?.toLowerCase().replace(/\s/g, '')}</p>
          </div>

          {/* Mute Button */}
          <button 
            onClick={() => setMuted(!muted)}
            className="absolute bottom-6 right-6 p-2 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-black/60 transition-colors"
          >
            {muted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
          </button>
        </div>

        {/* Actions & Info */}
        <div className="flex-1 w-full space-y-8">
          <div className="flex items-center justify-between bg-[#2a2a2a]/50 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl(`Profile?id=${clip.creator_id}`)}>
                {clip.creator_avatar ? (
                  <img src={clip.creator_avatar} alt={clip.creator_name} className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/20" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                    {clip.creator_name?.[0]?.toUpperCase()}
                  </div>
                )}
              </Link>
              <div>
                <Link to={createPageUrl(`Profile?id=${clip.creator_id}`)} className="text-white font-bold hover:text-purple-400 transition-colors">
                  {clip.creator_name}
                </Link>
                <p className="text-gray-400 text-sm">{clip.views?.toLocaleString() || 0} views</p>
              </div>
            </div>
            <button className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors">
              Follow
            </button>
          </div>

          <div className="bg-[#2a2a2a]/30 p-6 rounded-2xl border border-white/5">
            <h3 className="text-white font-bold mb-2">Description</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {clip.description || 'No description provided.'}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-1.5">
              <button 
                onClick={() => setLiked(!liked)}
                className={`p-4 rounded-full transition-all hover:scale-110 ${liked ? 'bg-red-500/20' : 'bg-[#2a2a2a] border border-white/5'}`}
              >
                <Heart className={`w-6 h-6 ${liked ? 'text-red-500 fill-red-500' : 'text-white'}`} />
              </button>
              <span className="text-gray-400 text-xs font-medium">{((clip.likes || 0) + (liked ? 1 : 0)).toLocaleString()}</span>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <button className="p-4 rounded-full bg-[#2a2a2a] border border-white/5 transition-all hover:scale-110">
                <MessageCircle className="w-6 h-6 text-white" />
              </button>
              <span className="text-gray-400 text-xs font-medium">24</span>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied!');
                }}
                className="p-4 rounded-full bg-[#2a2a2a] border border-white/5 transition-all hover:scale-110"
              >
                <Share2 className="w-6 h-6 text-white" />
              </button>
              <span className="text-gray-400 text-xs font-medium">Share</span>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <button 
                onClick={() => setSaved(!saved)}
                className={`p-4 rounded-full transition-all hover:scale-110 ${saved ? 'bg-purple-500/20' : 'bg-[#2a2a2a] border border-white/5'}`}
              >
                <Bookmark className={`w-6 h-6 ${saved ? 'text-purple-500 fill-purple-500' : 'text-white'}`} />
              </button>
              <span className="text-gray-400 text-xs font-medium">Save</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
