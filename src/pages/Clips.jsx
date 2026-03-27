import React, { useState, useEffect, useRef } from 'react';
import { apiClient as base44 } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Heart, MessageCircle, Share2, Bookmark, Play, ChevronUp, ChevronDown, X, Send } from 'lucide-react';
import { createPageUrl } from '../utils';
import { Link } from 'react-router-dom';

const sampleClips = [
  { id: '1', title: 'Quick Morning Stretch Routine', description: 'Start your day right with this energizing stretch sequence.', thumbnail_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600', duration: '0:45', views: 120000, likes: 8500, creator_name: 'FitLife', creator_id: 'u1', creator_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop' },
  { id: '2', title: '3 Tips for Better Sleep', description: 'Simple habits to transform your sleep quality overnight.', thumbnail_url: 'https://images.unsplash.com/photo-1515894203077-9cd36032142f?w=600', duration: '0:58', views: 89000, likes: 6200, creator_name: 'Mindful Living', creator_id: 'u2', creator_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop' },
  { id: '3', title: 'Mindset Shift That Changed Everything', description: 'One perspective change that rewired how I approach challenges.', thumbnail_url: 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=600', duration: '0:32', views: 250000, likes: 19000, creator_name: 'Success Mindset', creator_id: 'u3', creator_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop' },
  { id: '4', title: 'Office Prank Gone Wrong 😂', description: 'This one trick saves me 2 hours every single day.', thumbnail_url: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=600', duration: '0:28', views: 1800000, likes: 142000, creator_name: 'PrankKing', creator_id: 'u4', creator_avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=80&h=80&fit=crop' },
  { id: '5', title: 'Morning Motivation Boost', description: 'Fuel your ambition with this daily mindset practice.', thumbnail_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600', duration: '0:35', views: 320000, likes: 24100, creator_name: 'Daily Drive', creator_id: 'u5', creator_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop' },
  { id: '6', title: 'Business Tip of the Day', description: 'Scale smarter, not harder — here is how.', thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600', duration: '0:42', views: 95000, likes: 7800, creator_name: 'BizGrowth', creator_id: 'u6', creator_avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop' },
  { id: '7', title: 'Quick Workout - No Equipment', description: 'Full body burn in under a minute, anywhere.', thumbnail_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600', duration: '0:55', views: 210000, likes: 16500, creator_name: 'FitLife', creator_id: 'u1', creator_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop' },
  { id: '8', title: 'Breathing Exercise for Calm', description: 'Reset your nervous system in 40 seconds.', thumbnail_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600', duration: '0:40', views: 145000, likes: 11200, creator_name: 'Mindful Living', creator_id: 'u2', creator_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop' },
];

function formatCount(n) {
  if (!n) return '0';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function ClipItem({ clip, isActive, onLike, liked, saved, onSave, onShare, muted: isMuted, isLandscape }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    { id: 1, user: 'Alex', text: 'This is amazing! 🔥' },
    { id: 2, user: 'Sarah', text: 'Trying this tomorrow for sure' },
    { id: 3, user: 'Mike', text: 'Level up content 💪' },
  ]);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.muted = isMuted;
      videoRef.current.play().catch(() => {});
      setPlaying(true);
    } else {
      videoRef.current.pause();
      setPlaying(false);
      setShowComments(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); setPlaying(false); }
    else { videoRef.current.play(); setPlaying(true); }
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    setComments(prev => [...prev, { id: Date.now(), user: 'You', text: commentText }]);
    setCommentText('');
  };

  const CreatorAvatar = ({ size = 10 }) => (
    <Link to={createPageUrl(`Profile?id=${clip.creator_id}`)} onClick={e => e.stopPropagation()}>
      {clip.creator_avatar ? (
        <img src={clip.creator_avatar} alt={clip.creator_name} className={`w-${size} h-${size} rounded-full object-cover ring-2 ring-white/30`} />
      ) : (
        <div className={`w-${size} h-${size} rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold ring-2 ring-white/30`}>
          {clip.creator_name?.[0]?.toUpperCase()}
        </div>
      )}
    </Link>
  );

  // PORTRAIT layout
  if (!isLandscape) {
    return (
      <div className="relative w-full h-full bg-black flex items-center justify-center">
        {clip.video_url ? (
          <video ref={videoRef} src={clip.video_url} poster={clip.thumbnail_url} loop playsInline className="h-full object-contain" onClick={togglePlay} />
        ) : (
          <img src={clip.thumbnail_url} alt={clip.title} className="h-full object-contain cursor-pointer" onClick={togglePlay} />
        )}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/20" />

        {!playing && (
          <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center pointer-events-auto z-10">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-8 h-8 text-white fill-white" />
            </div>
          </button>
        )}

        {/* Top info */}
        <div className="absolute top-4 left-4 right-16 pointer-events-none z-20">
          <p className="text-white font-semibold text-sm drop-shadow line-clamp-2">{clip.title}</p>
          {clip.description && <p className="text-gray-300 text-xs mt-1 line-clamp-1 drop-shadow">{clip.description}</p>}
          <Link to={createPageUrl(`Profile?id=${clip.creator_id}`)} className="flex items-center gap-1.5 mt-1.5 pointer-events-auto">
            <span className="text-gray-300 text-xs">@{clip.creator_name?.toLowerCase().replace(/\s/g, '')}</span>
          </Link>
        </div>

        {/* Right actions */}
        <div className="absolute right-3 bottom-8 z-20 flex flex-col items-center gap-4">
          <CreatorAvatar size={10} />
          <button onClick={onLike} className="flex flex-col items-center gap-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${liked ? 'bg-red-500/30' : 'bg-black/30 backdrop-blur-sm'}`}>
              <Heart className={`w-5 h-5 ${liked ? 'text-red-400 fill-red-400' : 'text-white'}`} />
            </div>
            <span className="text-white text-xs font-medium drop-shadow">{formatCount((clip.likes || 0) + (liked ? 1 : 0))}</span>
          </button>
          <button onClick={() => setShowComments(v => !v)} className="flex flex-col items-center gap-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${showComments ? 'bg-cyan-500/30' : 'bg-black/30 backdrop-blur-sm'}`}>
              <MessageCircle className={`w-5 h-5 ${showComments ? 'text-cyan-300' : 'text-white'}`} />
            </div>
            <span className="text-white text-xs font-medium drop-shadow">{comments.length}</span>
          </button>
          <button onClick={onShare} className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-xs font-medium drop-shadow">Share</span>
          </button>
          <button onClick={onSave} className="flex flex-col items-center gap-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${saved ? 'bg-purple-500/30' : 'bg-black/30 backdrop-blur-sm'}`}>
              <Bookmark className={`w-5 h-5 ${saved ? 'text-purple-300 fill-purple-300' : 'text-white'}`} />
            </div>
            <span className="text-white text-xs font-medium drop-shadow">Save</span>
          </button>
        </div>

        {/* Comments panel */}
        {showComments && (
          <div className="absolute bottom-0 left-0 right-0 z-30 bg-black/80 backdrop-blur-md rounded-t-2xl p-4 max-h-[55%] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-semibold">{comments.length} Comments</span>
              <button onClick={() => setShowComments(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 mb-3">
              {comments.map(c => (
                <div key={c.id} className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{c.user[0]}</div>
                  <div><p className="text-white text-xs font-medium">{c.user}</p><p className="text-gray-300 text-xs">{c.text}</p></div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleComment()} placeholder="Add a comment..." className="flex-1 bg-white/10 text-white text-sm px-3 py-2 rounded-full placeholder:text-gray-400 outline-none" />
              <button onClick={handleComment} className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 flex items-center justify-center"><Send className="w-4 h-4 text-white" /></button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // LANDSCAPE layout — clip centered at natural 9:16 ratio on left, wider info panel on right
  return (
    <div className="relative w-full h-full bg-black flex flex-row">
      {/* Clip: natural 9:16 aspect ratio, centered in left portion */}
      <div className="flex items-center justify-center bg-black" style={{ width: '45%' }}>
        <div className="relative h-full" style={{ aspectRatio: '9/16', maxHeight: '100%' }}>
          {clip.video_url ? (
            <video ref={videoRef} src={clip.video_url} poster={clip.thumbnail_url} loop playsInline className="w-full h-full object-cover" onClick={togglePlay} />
          ) : (
            <img src={clip.thumbnail_url} alt={clip.title} className="w-full h-full object-cover cursor-pointer" onClick={togglePlay} />
          )}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 to-transparent" />
          {!playing && (
            <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center pointer-events-auto z-10">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Play className="w-7 h-7 text-white fill-white" />
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Right panel — wider info area */}
      <div className="flex-1 flex flex-col bg-black/70 backdrop-blur-md p-5 overflow-hidden">
        {/* Creator */}
        <div className="flex items-center gap-3 mb-4">
          {clip.creator_avatar ? (
            <Link to={createPageUrl(`Profile?id=${clip.creator_id}`)}>
              <img src={clip.creator_avatar} alt={clip.creator_name} className="w-10 h-10 rounded-full object-cover" />
            </Link>
          ) : (
            <Link to={createPageUrl(`Profile?id=${clip.creator_id}`)} className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
              {clip.creator_name?.[0]?.toUpperCase()}
            </Link>
          )}
          <div>
            <p className="text-white font-semibold text-sm">@{clip.creator_name?.toLowerCase().replace(/\s/g, '')}</p>
            <p className="text-gray-400 text-xs">{formatCount(clip.views)} views</p>
          </div>
        </div>

        <p className="text-white font-semibold text-base line-clamp-2 leading-snug mb-1">{clip.title}</p>
        {clip.description && <p className="text-gray-400 text-sm mb-4 line-clamp-3">{clip.description}</p>}

        {/* Actions */}
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onLike} className="flex flex-col items-center gap-0.5">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${liked ? 'bg-red-500/30' : 'bg-white/10'}`}>
              <Heart className={`w-5 h-5 ${liked ? 'text-red-400 fill-red-400' : 'text-white'}`} />
            </div>
            <span className="text-white text-xs">{formatCount((clip.likes || 0) + (liked ? 1 : 0))}</span>
          </button>
          <button onClick={() => setShowComments(v => !v)} className="flex flex-col items-center gap-0.5">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${showComments ? 'bg-cyan-500/30' : 'bg-white/10'}`}>
              <MessageCircle className={`w-5 h-5 ${showComments ? 'text-cyan-300' : 'text-white'}`} />
            </div>
            <span className="text-white text-xs">{comments.length}</span>
          </button>
          <button onClick={onShare} className="flex flex-col items-center gap-0.5">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-xs">Share</span>
          </button>
          <button onClick={onSave} className="flex flex-col items-center gap-0.5">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${saved ? 'bg-purple-500/30' : 'bg-white/10'}`}>
              <Bookmark className={`w-5 h-5 ${saved ? 'text-purple-300 fill-purple-300' : 'text-white'}`} />
            </div>
            <span className="text-white text-xs">Save</span>
          </button>
        </div>

        {/* Comments always visible in landscape */}
        <div className="flex-1 flex flex-col min-h-0">
          <p className="text-white text-sm font-semibold mb-2">{comments.length} Comments</p>
          <div className="flex-1 overflow-y-auto space-y-2 mb-3">
            {comments.map(c => (
              <div key={c.id} className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{c.user[0]}</div>
                <div><p className="text-white text-xs font-medium">{c.user}</p><p className="text-gray-400 text-xs">{c.text}</p></div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleComment()} placeholder="Comment..." className="flex-1 bg-white/10 text-white text-sm px-3 py-2 rounded-full placeholder:text-gray-500 outline-none" />
            <button onClick={handleComment} className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 flex items-center justify-center flex-shrink-0"><Send className="w-4 h-4 text-white" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Clips() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [likedClips, setLikedClips] = useState({});
  const [savedClips, setSavedClips] = useState({});
  const [muted, setMuted] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const containerRef = useRef(null);

  const { data: clips = sampleClips } = useQuery({
    queryKey: ['clips'],
    queryFn: () => base44.entities.Clip.list('-created_date', 50),
    initialData: sampleClips,
  });

  useEffect(() => {
    const check = () => setIsLandscape(window.innerWidth > window.innerHeight && window.innerWidth >= 640);
    check();
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  const goNext = () => setActiveIndex(i => Math.min(i + 1, clips.length - 1));
  const goPrev = () => setActiveIndex(i => Math.max(i - 1, 0));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let startY = 0;
    const onTouchStart = (e) => { startY = e.touches[0].clientY; };
    const onTouchEnd = (e) => {
      const dy = startY - e.changedTouches[0].clientY;
      if (dy > 60) goNext();
      else if (dy < -60) goPrev();
    };
    const onWheel = (e) => {
      e.preventDefault();
      if (e.deltaY > 0) goNext(); else goPrev();
    };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('wheel', onWheel);
    };
  }, [clips.length]);

  useEffect(() => {
    if (!clips[activeIndex]) return;
    const saveHistory = async () => {
      try {
        const user = await base44.auth.me();
        await base44.entities.WatchHistory.create({
          user_id: user.id,
          content_type: 'clip',
          content_id: clips[activeIndex].id,
          watched_at: new Date().toISOString(),
        });
      } catch (e) {}
    };
    saveHistory();
  }, [activeIndex, clips]);

  const handleShare = (clip) => {
    const url = `${window.location.origin}${createPageUrl(`ClipPlayer?id=${clip.id}`)}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  const handleSave = async (clip) => {
    try {
      const user = await base44.auth.me();
      const existing = await base44.entities.WatchLater.filter({ user_id: user.id, content_id: clip.id, content_type: 'clip' });
      if (existing.length > 0) {
        await base44.entities.WatchLater.delete(existing[0].id);
        setSavedClips(prev => ({ ...prev, [clip.id]: false }));
      } else {
        await base44.entities.WatchLater.create({ user_id: user.id, content_id: clip.id, content_type: 'clip' });
        setSavedClips(prev => ({ ...prev, [clip.id]: true }));
      }
    } catch (e) {}
  };

  return (
    <div
      ref={containerRef}
      className="fixed bg-black"
      style={{ top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }}
    >
      <div className="w-full h-full flex">
        {/* Portrait layout */}
        {!isLandscape ? (
          <div className="w-full h-full flex">
            {/* Desktop: sidebar spacer so clip doesn't go under sidebar */}
            <div className="hidden md:block w-56 flex-shrink-0 bg-black" />

            {/* Clip area — full height, centered, natural 9:16 */}
            <div className="flex-1 flex items-center justify-center bg-black relative overflow-hidden">
              <div className="relative h-full w-full max-w-sm md:max-w-xs overflow-hidden" style={{ aspectRatio: '9/16' }}>
                {clips.map((clip, idx) => (
                  <div
                    key={clip.id}
                    className="absolute inset-0 transition-transform duration-500"
                    style={{ transform: `translateY(${(idx - activeIndex) * 100}%)` }}
                  >
                    <ClipItem
                      clip={clip}
                      isActive={idx === activeIndex}
                      liked={!!likedClips[clip.id]}
                      saved={!!savedClips[clip.id]}
                      onLike={() => setLikedClips(prev => ({ ...prev, [clip.id]: !prev[clip.id] }))}
                      onSave={() => handleSave(clip)}
                      onShare={() => handleShare(clip)}
                      muted={muted}
                      isLandscape={false}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop right panel: nav + counter */}
            <div className="hidden md:flex flex-col justify-center items-center gap-3 px-4 flex-shrink-0 w-48 bg-black">
              <button onClick={goPrev} disabled={activeIndex === 0} className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white ${activeIndex === 0 ? 'opacity-30' : 'hover:bg-white/20'}`}>
                <ChevronUp className="w-5 h-5" />
              </button>
              <span className="text-white/50 text-sm">{activeIndex + 1} / {clips.length}</span>
              <button onClick={goNext} disabled={activeIndex === clips.length - 1} className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white ${activeIndex === clips.length - 1 ? 'opacity-30' : 'hover:bg-white/20'}`}>
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          /* Landscape: full screen with clip + right panel layout */
          <div className="w-full h-full relative overflow-hidden">
            {clips.map((clip, idx) => (
              <div
                key={clip.id}
                className="absolute inset-0 transition-transform duration-500"
                style={{ transform: `translateY(${(idx - activeIndex) * 100}%)` }}
              >
                <ClipItem
                  clip={clip}
                  isActive={idx === activeIndex}
                  liked={!!likedClips[clip.id]}
                  saved={!!savedClips[clip.id]}
                  onLike={() => setLikedClips(prev => ({ ...prev, [clip.id]: !prev[clip.id] }))}
                  onSave={() => handleSave(clip)}
                  onShare={() => handleShare(clip)}
                  muted={muted}
                  isLandscape={true}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}