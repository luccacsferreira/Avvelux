import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/lib/theme';
import { supabase } from '@/lib/supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';

export default function ClipPlayer() {
  const { isLight } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [clip, setClip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [muted] = useState(false);
  const [playing, setPlaying] = useState(true);
  const videoRef = useRef(null);
  
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

  const textColor = isLight ? 'text-black' : 'text-white';
  const textMuted = isLight ? 'text-gray-600' : 'text-gray-400';
  const sectionBg = isLight ? 'bg-gray-100' : 'bg-white/5';

  return (
    <div className={`h-[calc(100vh-56px)] mt-14 flex items-center justify-center overflow-hidden ${isLight ? 'bg-white' : 'bg-[#252525]'}`}>
      <div className="relative h-[92%] aspect-[9/16] bg-black shadow-2xl flex items-center justify-center rounded-3xl overflow-hidden border border-white/5">
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
    </div>
  );
}
