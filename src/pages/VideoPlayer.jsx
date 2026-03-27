import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient as base44 } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useAuth } from '@/lib/AuthContext';
import { 
  Heart, Share2, Bookmark, Play, 
  Volume2, Maximize, MoreVertical,
  Send, FileText, Lightbulb
} from 'lucide-react';

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
  
  useEffect(() => {
    setTheme(localStorage.getItem('avvelux-theme') || 'system');
  }, []);
  
  const isLight = theme === 'light';
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get('id') || '1';

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Save to watch history
        if (videoId && user) {
          await base44.entities.WatchHistory.create({
            content_type: 'video',
            content_id: videoId,
            watched_at: new Date().toISOString(),
            progress_seconds: 0,
          });
        }
      } catch (e) {}
    };
    loadUser();
  }, [videoId, user]);

  // Sample video data - indexed by id so each video has unique content
  const SAMPLE_VIDEOS = {
    '1': { id: '1', title: 'Full Body Workout - Build Muscle at Home (30 Min)', description: 'A complete at-home workout designed to build muscle and burn fat. No equipment needed — just your bodyweight and determination.', thumbnail_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200', video_url: '', duration: '32:18', views: 5200000, likes: 312000, creator_name: 'FitLife', creator_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop' },
    '2': { id: '2', title: '5-Minute Meditation for Anxiety Relief', description: 'A short but powerful guided meditation to instantly calm your nervous system and reduce anxiety.', thumbnail_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200', video_url: '', duration: '5:30', views: 8500000, likes: 510000, creator_name: 'Mindful Living', creator_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop' },
    '3': { id: '3', title: 'How to Overcome Fear and Take Action', description: 'Fear is the #1 thing stopping you from your goals. In this video, we break down exactly how to push through it.', thumbnail_url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200', video_url: '', duration: '18:33', views: 4200000, likes: 231000, creator_name: 'Success Mindset', creator_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop' },
    '4': { id: '4', title: 'Morning Routine of Highly Productive People', description: 'Transform your mornings with these science-backed routines. Wake up energized and accomplish more.', thumbnail_url: 'https://images.unsplash.com/photo-1523875194681-bedd468c58bf?w=1200', video_url: '', duration: '15:42', views: 3900000, likes: 267000, creator_name: 'DailyDrive', creator_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop' },
    '5': { id: '5', title: 'Epic Gaming Moments Compilation 2024', description: 'The most insane gaming clips of 2024 in one place. Clutch plays, rage moments, and everything in between.', thumbnail_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200', video_url: '', duration: '22:40', views: 9100000, likes: 645000, creator_name: 'ProGamer', creator_avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=80&h=80&fit=crop' },
    '6': { id: '6', title: 'Geopolitics Explained: The Middle East Crisis', description: 'An in-depth analysis of the current geopolitical situation in the Middle East — history, causes, and what comes next.', thumbnail_url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200', video_url: '', duration: '45:10', views: 3300000, likes: 198000, creator_name: 'WorldReport', creator_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop' },
    '7': { id: '7', title: 'Best Cooking Hacks You Need To Know', description: 'Professional chefs share their favorite kitchen hacks that will save you time and make everything taste better.', thumbnail_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200', video_url: '', duration: '14:22', views: 6700000, likes: 402000, creator_name: 'ChefMike', creator_avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=80&h=80&fit=crop' },
    '8': { id: '8', title: 'Investing for Beginners - Build Wealth in 2024', description: 'Everything you need to know to start investing — from index funds to real estate, explained simply.', thumbnail_url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200', video_url: '', duration: '28:45', views: 3100000, likes: 186000, creator_name: 'WealthPath', creator_avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop' },
    '9': { id: '9', title: 'Prank Wars: Office Edition 🔥', description: 'The most epic office pranks ever caught on camera. Warning: do not try these at your own workplace.', thumbnail_url: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=1200', video_url: '', duration: '11:05', views: 14000000, likes: 980000, creator_name: 'PrankKing', creator_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop' },
    '10': { id: '10', title: 'The Joe Rogan Experience - Best Moments', description: 'The most memorable, hilarious, and thought-provoking moments from JRE — all in one compilation.', thumbnail_url: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1200', video_url: '', duration: '58:00', views: 12000000, likes: 720000, creator_name: 'PodcastClips', creator_avatar: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=80&h=80&fit=crop' },
    '11': { id: '11', title: 'Deep Focus Music for Work', description: '2 hours of deep focus music — no lyrics, no distractions. Perfect for studying, coding, or creative work.', thumbnail_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200', video_url: '', duration: '120:00', views: 9500000, likes: 570000, creator_name: 'Focus Zone', creator_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop' },
    '12': { id: '12', title: 'Yoga for Beginners - Complete Guide', description: 'A gentle, beginner-friendly yoga session covering all the foundational poses and breathing techniques.', thumbnail_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200', video_url: '', duration: '45:00', views: 4800000, likes: 288000, creator_name: 'YogaWithSarah', creator_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop' },
  };
  const video = SAMPLE_VIDEOS[videoId] || SAMPLE_VIDEOS['1'];

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', videoId],
    queryFn: () => base44.entities.Comment.filter({ content_type: 'video', content_id: videoId }),
  });

  const { data: notes = [] } = useQuery({
    queryKey: ['video-notes', videoId, user?.id],
    queryFn: () => user ? base44.entities.Note.filter({ video_id: videoId, user_id: user.id }) : [],
    enabled: !!user,
  });

  const addCommentMutation = useMutation({
    mutationFn: (data) => base44.entities.Comment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', videoId]);
      setCommentText('');
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: (data) => base44.entities.Note.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['video-notes', videoId, user?.id]);
      setNoteTitle('');
      setNoteContent('');
    },
  });

  const handleAddComment = () => {
    if (!commentText.trim() || !user) return;
    addCommentMutation.mutate({
      content_type: 'video',
      content_id: videoId,
      user_id: user.id,
      user_name: user.full_name,
      text: commentText,
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
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI assistant helping with a video titled "${video.title}". 
        Video description: ${video.description}
        
        Help the user with questions about this video.
        
        User question: ${aiInput}`,
      });

      const assistantMsg = { role: 'assistant', content: response };
      setAiMessages(prev => {
        const next = [...prev, assistantMsg];
        streamAiResponse(response, next.length - 1);
        return next;
      });
    } catch (error) {
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
        <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-4">
          <img 
            src={video.thumbnail_url} 
            alt={video.title}
            className="w-full h-full object-cover"
          />
          {/* Video Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center gap-4">
              <button className="text-white hover:text-purple-400">
                <Play className="w-6 h-6" />
              </button>
              <div className="flex-1 h-1 bg-white/30 rounded-full">
                <div className="h-full w-0 bg-purple-500 rounded-full" />
              </div>
              <span className="text-white text-sm">0:00 / {video.duration}</span>
              <button className="text-white hover:text-purple-400">
                <Volume2 className="w-5 h-5" />
              </button>
              <button className="text-white hover:text-purple-400">
                <Maximize className="w-5 h-5" />
              </button>
              <button className="text-white hover:text-purple-400">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
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
              {formatCount((video.likes || 0) + (liked ? 1 : 0))}
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
              {user?.displayName?.[0]?.toUpperCase() || 'U'}
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
                  {comment.user_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className={`text-sm ${isLight ? 'text-black' : 'text-white'}`}>
                    <span className="font-medium">{comment.user_name}</span>
                    <span className="text-gray-500 ml-2">1 hour ago</span>
                  </p>
                  <p className={`text-sm mt-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>{comment.text}</p>
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
            {sampleRelatedVideos.map((relVideo) => (
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
                    {relVideo.views?.toLocaleString()} views • 7 days ago
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