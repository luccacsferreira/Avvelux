import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Play, Volume2, VolumeX } from 'lucide-react';

export default function ClipPlayer() {
  const [user, setUser] = useState(null);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [muted, setMuted] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const clipId = urlParams.get('id') || '1';

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {}
    };
    loadUser();
  }, []);

  // Sample clip data
  const clip = {
    id: clipId,
    title: 'Quick Morning Stretch Routine',
    thumbnail_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600',
    duration: '0:45',
    views: 120000,
    likes: 8500,
    creator_name: 'FitLife',
  };

  return (
    <div className="flex justify-center items-start gap-8">
      {/* Clip Video */}
      <div className="relative w-[350px] aspect-[9/16] bg-black rounded-xl overflow-hidden">
        <img 
          src={clip.thumbnail_url}
          alt={clip.title}
          className="w-full h-full object-cover"
        />
        
        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
            <Play className="w-8 h-8 text-white fill-white" />
          </button>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <h2 className="text-white font-medium mb-1">{clip.title}</h2>
          <p className="text-gray-300 text-sm">{clip.creator_name}</p>
        </div>

        {/* Mute Button */}
        <button 
          onClick={() => setMuted(!muted)}
          className="absolute bottom-4 right-4 p-2 rounded-full bg-black/50"
        >
          {muted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
        </button>
      </div>

      {/* Actions Sidebar */}
      <div className="flex flex-col gap-4 items-center py-8">
        <div className="flex flex-col items-center gap-1">
          <button 
            onClick={() => setLiked(!liked)}
            className={`p-3 rounded-full ${liked ? 'bg-red-500/20' : 'bg-[#2a2a2a]'}`}
          >
            <Heart className={`w-6 h-6 ${liked ? 'text-red-500 fill-red-500' : 'text-white'}`} />
          </button>
          <span className="text-white text-sm">{((clip.likes || 0) + (liked ? 1 : 0)).toLocaleString()}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button className="p-3 rounded-full bg-[#2a2a2a]">
            <MessageCircle className="w-6 h-6 text-white" />
          </button>
          <span className="text-white text-sm">24</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button className="p-3 rounded-full bg-[#2a2a2a]">
            <Share2 className="w-6 h-6 text-white" />
          </button>
          <span className="text-white text-sm">Share</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button 
            onClick={() => setSaved(!saved)}
            className={`p-3 rounded-full ${saved ? 'bg-purple-500/20' : 'bg-[#2a2a2a]'}`}
          >
            <Bookmark className={`w-6 h-6 ${saved ? 'text-purple-500 fill-purple-500' : 'text-white'}`} />
          </button>
          <span className="text-white text-sm">Save</span>
        </div>

        {/* Creator */}
        <div className="mt-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-medium border-2 border-white">
            {clip.creator_name?.[0]}
          </div>
        </div>
      </div>
    </div>
  );
}