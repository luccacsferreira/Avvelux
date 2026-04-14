import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Video, Comment, Note } from '@/api/entities';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useAuth } from '@/lib/AuthContext';
import { 
  Heart, Share2, Bookmark, Play, Pause, Settings,
  Volume2, Maximize,
  Send, FileText, Lightbulb
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

function formatCount(n) {
  if (!n) return '0';
  if (n >= 1000000) return `${(n / 1000000).toFixed(n % 1000000 >= 100000 ? 1 : 0)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0)}K`;
  return String(n);
}
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const AILogo = () => (
  <div className="w-full h-full flex items-center justify-center">
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  </div>
);

const sampleRelatedVideos = [
  { id: '2', title: '5-Minute Meditation for Anxiety Relief', thumbnail_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600', duration: '5:30', views: 8500000, creator_name: 'Mindful Living' },
  { id: '1', title: 'Full Body Workout - Build Muscle at Home (30 Min)', thumbnail_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600', duration: '32:18', views: 5200000, creator_name: 'FitLife' },
  { id: '3', title: 'How to Overcome Fear and Take Action', thumbnail_url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600', duration: '18:33', views: 4200000, creator_name: 'Success Mindset' },
];

import { videoService } from '../services/videoService';
import VideoAd from '../components/video/VideoAd';

export default function VideoPlayer() {
  const { user, requireAuth } = useAuth();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [rightTab, setRightTab] = useState('ai');
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiStreamingIdx, setAiStreamingIdx] = useState(null);
  const [aiStreamingText, setAiStreamingText] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [theme, setTheme] = useState('system');
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(320);
  const MIN_SIDEBAR = 260;
  const MAX_SIDEBAR = 400;

  // Ad logic
  const [showAd, setShowAd] = useState(false);
  const [currentAd, setCurrentAd] = useState(null);
  const [lastAdTime, setLastAdTime] = useState(0);
  const [ads, setAds] = useState([]);
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setTheme(localStorage.getItem('avvelux-theme') || 'system');
    videoService.getAds().then(setAds);
  }, []);

  const isLight = theme === 'light';
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get('id') || '1';

  const { data: videoData } = useQuery({
    queryKey: ['video', videoId],
    queryFn: () => videoService.getVideoById(videoId),
  });

  const video = videoData || { id: '1', title: 'Loading...', description: '', thumbnail_url: '', video_url: '', duration: '0:00', views: 0, likes: 0, creator_name: 'Loading...', creator_avatar: '' };

  useEffect(() => {
    if (videoId && user) {
      videoService.incrementViews('videos', videoId);
    }
  }, [videoId, user]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    // Ad every 10 minutes (600 seconds)
    if (time - lastAdTime >= 600 && ads.length > 0) {
      triggerAd();
    }
  };

  const triggerAd = () => {
    if (ads.length === 0) return;
    const randomAd = ads[Math.floor(Math.random() * ads.length)];
    setCurrentAd(randomAd);
    setShowAd(true);
    setPlaying(false);
    videoRef.current?.pause();
    setLastAdTime(currentTime);
  };

  const handleVideoEnded = () => {
    // If video < 10 mins and no ad shown yet, show ad at end
    if (currentTime < 600 && lastAdTime === 0 && ads.length > 0) {
      triggerAd();
    }
  };

  const onAdComplete = () => {
    setShowAd(false);
    setCurrentAd(null);
    setPlaying(true);
    videoRef.current?.play();
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play();
      setPlaying(true);
    }
  };

  const { data: relatedVideos = [] } = useQuery({
    queryKey: ['related-videos', video?.category, videoId],
    queryFn: async () => {
      if (!video?.category) return [];
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('category', video.category)
        .eq('privacy', 'public') // Only show public videos in related section
        .neq('id', videoId)
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!video?.category,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', videoId],
    queryFn: () => Comment.find({ video_id: videoId }),
  });

  const { data: notes = [] } = useQuery({
    queryKey: ['video-notes', videoId, user?.id],
    queryFn: () => user ? Note.find({ video_id: videoId, user_id: user.id }) : [],
    enabled: !!user,
  });

  const addCommentMutation = useMutation({
    mutationFn: (data) => Comment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', videoId]);
      setCommentText('');
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: (data) => Note.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['video-notes', videoId, user?.id]);
      setNoteTitle('');
      setNoteContent('');
    },
  });

  const handleAddComment = () => {
    if (!commentText.trim() || !user) return;
    addCommentMutation.mutate({
      video_id: videoId,
      author_id: user.id,
      author_name: user.display_name || user.username || user.email.split('@')[0],
      body: commentText,
    });
  };

  const handleAddNote = () => {
    if (!noteTitle.trim() || !noteContent.trim() || !user) return;
    addNoteMutation.mutate({
      title: noteTitle,
      content: noteContent,
      video_id: videoId,
      user_id: user.id,
    });
  };

  const streamAiResponse = useCallback((fullText, msgIdx) => {
    const phrases = fullText.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g) || [fullText];
    let phraseIdx = 0;
    let charIdx = 0;
    let accumulated = '';
    setAiStreamingIdx(msgIdx);
    setAiStreamingText('');

    const streamChar = () => {
      if (phraseIdx >= phrases.length) { setAiStreamingIdx(null); return; }
      const phrase = phrases[phraseIdx];
      if (charIdx < phrase.length) {
        accumulated += phrase[charIdx];
        setAiStreamingText(accumulated);
        charIdx++;
        setTimeout(streamChar, 18);
      } else {
        phraseIdx++; charIdx = 0;
        const pause = Math.min(Math.max(phrase.length * 10, 250), 700);
        setTimeout(streamChar, pause);
      }
    };
    streamChar();
  }, []);

  const handleDragStart = useCallback((e) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = sidebarWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMove = (mv) => {
      if (!isDragging.current) return;
      const delta = dragStartX.current - mv.clientX; // dragging left = wider sidebar
      const newW = Math.min(MAX_SIDEBAR, Math.max(MIN_SIDEBAR, dragStartWidth.current + delta));
      setSidebarWidth(newW);
    };
    const onUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [sidebarWidth]);

  const sendAiMessage = async () => {
    if (!aiInput.trim() || isAiLoading) return;

    const userMsg = { role: 'user', content: aiInput };
    const newMsgs = [...aiMessages, userMsg];
    setAiMessages(newMsgs);
    setAiInput('');
    setIsAiLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are an AI assistant helping with a video titled "${video.title}". 
        Video description: ${video.description}
        
        Help the user with questions about this video.
        
        User question: ${aiInput}`,
      });

      const responseText = response.text;
      const assistantMsg = { role: 'assistant', content: responseText };
      setAiMessages(prev => {
        const next = [...prev, assistantMsg];
        streamAiResponse(responseText, next.length - 1);
        return next;
      });
    } catch (error) {
      console.error('AI Error:', error);
      const errMsg = 'Sorry, I encountered an error.';
      setAiMessages(prev => {
        const next = [...prev, { role: 'assistant', content: errMsg }];
        streamAiResponse(errMsg, next.length - 1);
        return next;
      });
    }

    setIsAiLoading(false);
  };

  return (
    <div className="flex gap-0">
      {/* Main Video Area */}
      <div className="flex-1 pr-3">
        {/* Video Player */}
        <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-4 group">
          {showAd && currentAd ? (
            <VideoAd ad={currentAd} onComplete={onAdComplete} />
          ) : (
            <>
              <video
                ref={videoRef}
                src={video.video_url}
                poster={video.thumbnail_url}
                className="w-full h-full cursor-pointer"
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
                onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
              />
              
              {/* Custom Controls Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${playing ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <button 
                    onClick={togglePlay}
                    className="w-16 h-16 bg-purple-600/80 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
                  >
                    {playing ? <Pause className="w-8 h-8 fill-white" /> : <Play className="w-8 h-8 fill-white ml-1" />}
                  </button>
                </div>
                
                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="h-1 bg-white/20 rounded-full mb-4 relative cursor-pointer group/progress">
                    <div 
                      className="absolute h-full bg-purple-500 rounded-full" 
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                    <div 
                      className="absolute w-3 h-3 bg-white rounded-full -top-1 opacity-0 group-hover/progress:opacity-100 transition-opacity"
                      style={{ left: `${(currentTime / duration) * 100}%`, transform: 'translateX(-50%)' }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-white text-sm">
                    <div className="flex items-center gap-4">
                      <button onClick={togglePlay}>
                        {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </button>
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-5 h-5" />
                        <div className="w-20 h-1 bg-white/20 rounded-full">
                          <div className="w-3/4 h-full bg-white rounded-full" />
                        </div>
                      </div>
                      <span className="font-mono">
                        {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} / {video.duration}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Settings className="w-5 h-5 cursor-pointer hover:rotate-45 transition-transform" />
                      <Maximize className="w-5 h-5 cursor-pointer" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Video Info */}
        <h1 className={`text-xl font-semibold mb-3 ${isLight ? 'text-black' : 'text-white'}`}>{video.title}</h1>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link 
              to={createPageUrl(`Profile?id=${video.creator_id}`)}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-medium hover:opacity-80"
            >
              {video.creator_name?.[0]}
            </Link>
            <div>
              <Link 
                to={createPageUrl(`Profile?id=${video.creator_id}`)}
                className={`font-medium hover:underline ${isLight ? 'text-black' : 'text-white'}`}
              >
                {video.creator_name}
              </Link>
              <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>120K subscribers</p>
            </div>
            <Button 
              onClick={() => requireAuth(() => setSubscribed(!subscribed))}
              className={`transition-colors ${
                subscribed
                  ? isLight ? 'bg-transparent border border-gray-400 text-gray-700' : 'bg-transparent border border-gray-600 text-gray-300'
                  : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:from-purple-700 hover:to-cyan-700 border-0'
              }`}
            >
              {subscribed ? 'Subscribed' : 'Subscribe'}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              onClick={() => requireAuth(() => setLiked(!liked))}
              className={liked
                ? 'bg-red-500/10 border border-red-500 text-red-500'
                : isLight ? 'bg-gray-100 border border-gray-200 text-black hover:bg-gray-200' : 'bg-[#333] border-[#333] text-gray-200 hover:bg-[#3a3a3a]'
              }
            >
              <Heart className={`w-4 h-4 mr-2 ${liked ? 'fill-current' : ''}`} />
              {formatCount((video.likes_count || 0) + (liked ? 1 : 0))}
            </Button>
            <Button className={isLight ? 'bg-gray-100 border border-gray-200 text-black hover:bg-gray-200' : 'bg-[#333] border-[#333] text-gray-200 hover:bg-[#3a3a3a]'}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button 
              onClick={() => requireAuth(() => setSaved(!saved))}
              className={saved
                ? 'bg-purple-500/10 border border-purple-500 text-purple-400'
                : isLight ? 'bg-gray-100 border border-gray-200 text-black hover:bg-gray-200' : 'bg-[#333] border-[#333] text-gray-200 hover:bg-[#3a3a3a]'
              }
            >
              <Bookmark className={`w-4 h-4 mr-2 ${saved ? 'fill-current' : ''}`} />
              Save
            </Button>
          </div>
        </div>

        {/* Video Description */}
        <div className={`rounded-xl p-4 mb-6 ${isLight ? 'bg-gray-100' : 'bg-[#2a2a2a]'}`}>
          <p className={`text-sm mb-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            {formatCount(video.views)} views • 7 days ago
          </p>
          <p className={isLight ? 'text-black' : 'text-white'}>{video.description}</p>
        </div>

        {/* Comments */}
        <div>
          <h2 className={`font-medium mb-4 ${isLight ? 'text-black' : 'text-white'}`}>{comments.length} Comments</h2>
          
          {/* Add Comment */}
          <div className="flex gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex-shrink-0 flex items-center justify-center text-white font-medium">
              {user?.display_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && requireAuth(handleAddComment)}
                onClick={() => !user && requireAuth(() => {})}
                placeholder="Add a comment..."
                className={`bg-transparent border-0 border-b rounded-none placeholder:text-gray-500 focus-visible:ring-0 focus-visible:border-purple-500 ${
                  isLight ? 'border-gray-300 text-black' : 'border-gray-700 text-white'
                }`}
              />
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex-shrink-0 flex items-center justify-center text-white font-medium">
                  {comment.author_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className={`text-sm ${isLight ? 'text-black' : 'text-white'}`}>
                    <span className="font-medium">{comment.author_name}</span>
                    <span className="text-gray-500 ml-2">1 hour ago</span>
                  </p>
                  <p className={`text-sm mt-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>{comment.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Drag Handle */}
      <div
        onMouseDown={handleDragStart}
        className="w-3 flex items-start justify-center pt-8 cursor-col-resize group flex-shrink-0"
        title="Drag to resize"
      >
        <div className="w-0.5 h-16 rounded-full bg-gray-700 group-hover:bg-purple-500 transition-colors mt-4" />
      </div>

      {/* Right Sidebar */}
      <div className="flex flex-col flex-shrink-0" style={{ width: sidebarWidth }}>
        {/* AI Assistant / Notes Tabs */}
        <Tabs value={rightTab} onValueChange={setRightTab} className="mb-4">
          <TabsList className={`bg-transparent border-b w-full justify-start rounded-none h-auto p-0 ${isLight ? 'border-gray-200' : 'border-gray-800'}`}>
            <TabsTrigger 
              value="ai" 
              className={`rounded-none pb-2 data-[state=active]:border-b-2 ${
                isLight 
                  ? 'data-[state=active]:text-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 data-[state=active]:bg-clip-text data-[state=active]:border-purple-500 text-gray-500' 
                  : 'data-[state=active]:text-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-cyan-400 data-[state=active]:bg-clip-text data-[state=active]:border-purple-500 text-gray-400'
              }`}
            >
              AI Assistant
            </TabsTrigger>
            <TabsTrigger 
              value="notes"
              className={`rounded-none pb-2 data-[state=active]:border-b-2 ${
                isLight 
                  ? 'data-[state=active]:text-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 data-[state=active]:bg-clip-text data-[state=active]:border-purple-500 text-gray-500' 
                  : 'data-[state=active]:text-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-cyan-400 data-[state=active]:bg-clip-text data-[state=active]:border-purple-500 text-gray-400'
              }`}
            >
              Notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="mt-4">
            <div className={`rounded-xl p-4 ${isLight ? 'bg-gray-100' : 'bg-[#2a2a2a]'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                  <AILogo />
                </div>
                <div>
                  <p className={`font-medium ${isLight ? 'text-black' : 'text-white'}`}>AI Assistant</p>
                  <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Ask about this video</p>
                </div>
              </div>

              <ScrollArea className="h-64 mb-4">
                {aiMessages.length === 0 ? (
                  <div className={`text-sm ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                    <p className="mb-2">💡 I can help you with this video:</p>
                    <ul className={`space-y-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                      <li>• <span className="bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">Summarize</span> the key points</li>
                      <li>• <span className="bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">Answer questions</span> about the content</li>
                      <li>• <span className="bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">Suggest related topics</span> to explore</li>
                    </ul>
                    <p className="mt-3">I've watched the video and can provide detailed insights. What would you like to know?</p>
                    
                    <div className="mt-4 space-y-2">
                      <button 
                        onClick={() => setAiInput('Summarize this video')}
                        className={`w-full p-3 rounded-lg text-left text-sm flex items-center gap-2 ${
                          isLight ? 'bg-white hover:bg-gray-50 text-black' : 'bg-[#1a1a1a] hover:bg-[#252525] text-white'
                        }`}
                      >
                        <FileText className={`w-4 h-4 ${isLight ? 'text-gray-600' : 'text-gray-400'}`} />
                        Summarize this video
                      </button>
                      <button 
                        onClick={() => setAiInput('What are related topics I should explore?')}
                        className={`w-full p-3 rounded-lg text-left text-sm flex items-center gap-2 ${
                          isLight ? 'bg-white hover:bg-gray-50 text-black' : 'bg-[#1a1a1a] hover:bg-[#252525] text-white'
                        }`}
                      >
                        <Lightbulb className={`w-4 h-4 ${isLight ? 'text-gray-600' : 'text-gray-400'}`} />
                        Related topics
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {aiMessages.map((msg, idx) => {
                      const isStreaming = aiStreamingIdx === idx;
                      const content = isStreaming ? aiStreamingText : msg.content;
                      return (
                        <div key={idx} className={`${msg.role === 'user' ? 'text-right' : ''}`}>
                          <div className={`inline-block p-3 rounded-xl text-sm ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                              : isLight ? 'bg-white text-black' : 'bg-[#1a1a1a] text-white'
                          }`}>
                            {content}{isStreaming && <span className="animate-pulse">▌</span>}
                          </div>
                        </div>
                      );
                    })}
                    {isAiLoading && (
                      <div className="flex gap-1 p-3">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              <div className="flex gap-2">
                <Input
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendAiMessage()}
                  placeholder="Ask about this video..."
                  className={`text-sm ${isLight ? 'bg-white border-gray-300 text-black' : 'bg-[#1a1a1a] border-gray-700 text-white'}`}
                />
                <Button 
                  onClick={sendAiMessage}
                  disabled={isAiLoading}
                  size="icon"
                  className="bg-gradient-to-r from-purple-600 to-cyan-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <div className={`rounded-xl p-4 ${isLight ? 'bg-gray-100' : 'bg-[#2a2a2a]'}`}>
              <h3 className={`font-medium mb-4 ${isLight ? 'text-black' : 'text-white'}`}>Notes</h3>
              
              {/* Existing Notes */}
              <div className="space-y-3 mb-4">
                {notes.map((note) => (
                  <div key={note.id} className={`rounded-lg p-3 ${isLight ? 'bg-white' : 'bg-[#1a1a1a]'}`}>
                    <h4 className={`font-medium text-sm ${isLight ? 'text-black' : 'text-white'}`}>{note.title}</h4>
                    <p className={`text-sm mt-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{note.content}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-500 text-xs">about 1 hour ago</span>
                      <div className="flex gap-2">
                        <button className="text-cyan-400 text-xs">Edit</button>
                        <button className="text-red-400 text-xs">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Note */}
              <div className="space-y-2">
                <Input
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Note title..."
                  className={`text-sm ${isLight ? 'bg-white border-gray-300 text-black' : 'bg-[#1a1a1a] border-gray-700 text-white'}`}
                />
                <Textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write your note..."
                  className={`text-sm min-h-[80px] resize-none ${isLight ? 'bg-white border-gray-300 text-black' : 'bg-[#1a1a1a] border-gray-700 text-white'}`}
                />
                <Button 
                  onClick={() => requireAuth(handleAddNote)}
                  className="w-full bg-gradient-to-r from-purple-600 to-cyan-600"
                >
                  Add Note
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Related Videos */}
        <div>
          <h3 className={`font-semibold mb-4 ${isLight ? 'text-black' : 'text-white'}`}>Related Videos</h3>
          <div className="space-y-4">
            {relatedVideos.map((relVideo) => (
              <Link 
                key={relVideo.id} 
                to={createPageUrl(`VideoPlayer?id=${relVideo.id}`)}
                className="flex gap-3 group"
              >
                <div className="relative w-40 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={relVideo.thumbnail_url} 
                    alt={relVideo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-md border border-white/10 px-1.5 py-0.5 rounded-md text-[10px] text-white font-bold tracking-wider">
                    {relVideo.duration}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium line-clamp-2 group-hover:text-purple-400 ${isLight ? 'text-black' : 'text-white'}`}>
                    {relVideo.title}
                  </h4>
                  <p className={`text-xs mt-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{relVideo.creator_name}</p>
                  <p className="text-gray-500 text-xs">
                    {relVideo.views?.toLocaleString()} views • {relVideo.created_at ? new Date(relVideo.created_at).toLocaleDateString() : 'Just now'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}