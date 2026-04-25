import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/lib/theme';
import { videoService } from '../services/videoService';

function ClipItem({ clip, isActive, isLight }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
      setPlaying(true);
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); setPlaying(false); }
    else { videoRef.current.play(); setPlaying(true); }
  };

  return (
    <div className={`flex items-center justify-center w-full h-full relative overflow-hidden ${isLight ? 'bg-white' : 'bg-[#252525]'}`}>
      <div className="relative h-[92%] aspect-[9/16] bg-black shadow-2xl flex items-center justify-center rounded-3xl overflow-hidden border border-white/5">
        <video 
          ref={videoRef} 
          src={clip.video_url} 
          poster={clip.thumbnail_url} 
          loop 
          playsInline 
          className="h-full w-full object-cover cursor-pointer" 
          onClick={togglePlay}
        />
      </div>
    </div>
  );
}

export default function Clips() {
  const { isLight } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const [clips, setClips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const fetchedClips = await videoService.getClips();
        setClips(fetchedClips.map(c => ({ ...c, type: 'clip' })));
      } catch (error) {
        console.error('Error fetching clips:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const goNext = () => setActiveIndex(i => Math.min(i + 1, clips.length - 1));
  const goPrev = () => setActiveIndex(i => Math.max(i - 1, 0));

  useEffect(() => {
    const el = containerRef.current;
    if (!el || clips.length === 0) return;
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) < 30) return;
      if (e.deltaY > 0) goNext(); else goPrev();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [clips.length]);

  if (isLoading) return <div className={`flex items-center justify-center h-screen pt-14 ${isLight ? 'bg-white text-purple-600' : 'bg-[#252525] text-purple-400'} font-bold`}>Loading...</div>;
  if (clips.length === 0) return <div className={`flex items-center justify-center h-screen pt-14 ${isLight ? 'bg-white text-gray-500' : 'bg-[#252525] text-gray-400'} font-bold`}>No clips.</div>;

  return (
    <div ref={containerRef} className={`h-[calc(100vh-56px)] mt-14 overflow-hidden relative ${isLight ? 'bg-white' : 'bg-[#252525]'}`}>
      {clips.map((item, idx) => (
        <div
          key={item.id}
          className="absolute inset-0 transition-transform duration-500 ease-in-out"
          style={{ transform: `translateY(${(idx - activeIndex) * 100}%)` }}
        >
          <ClipItem
            clip={item}
            isActive={idx === activeIndex}
            isLight={isLight}
          />
        </div>
      ))}
    </div>
  );
}
