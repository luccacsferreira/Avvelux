import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { 
  Heart, Share2, Bookmark, 
  Play, ChevronUp, ChevronDown, Send 
} from 'lucide-react';
import { createPageUrl } from '../utils';
import { Link } from 'react-router-dom';
import { videoService } from '../services/videoService';
import { toast } from 'sonner';
import { GoogleGenAI } from "@google/genai";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function formatCount(n) {
  if (!n) return '0';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

const AILogo = () => (
  <div className="w-full h-full flex items-center justify-center">
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  </div>
);

function ClipItem({ clip, isActive, onLike, liked, saved, onSave, onShare, muted: isMuted }) {
  const { user, requireAuth } = useAuth();
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rightTab, setRightTab] = useState('comments');
  const [commentText, setCommentText] = useState('');
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiStreamingIdx, setAiStreamingIdx] = useState(null);
  const [aiStreamingText, setAiStreamingText] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
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
    }
  }, [isActive]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); setPlaying(false); }
    else { videoRef.current.play(); setPlaying(true); }
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    setComments(prev => [...prev, { id: Date.now(), user: user?.display_name || 'You', text: commentText }]);
    setCommentText('');
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
        contents: `You are an AI assistant helping with a clip titled "${clip.title}". 
        Description: ${clip.description}
        User question: ${aiInput}`,
      });
      const responseText = response.text;
      setAiMessages(prev => {
        const next = [...prev, { role: 'assistant', content: responseText }];
        streamAiResponse(responseText, next.length - 1);
        return next;
      });
    } catch (error) {
      console.error('AI Error:', error);
      setAiMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.' }]);
    }
    setIsAiLoading(false);
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-full max-w-6xl mx-auto gap-6 items-center lg:items-stretch py-4">
      {/* Left side: Title and Description (Desktop) */}
      <div className="hidden lg:flex flex-col justify-end w-64 pb-12">
        <div className="flex items-center gap-3 mb-4">
          <Link to={createPageUrl(`Profile?id=${clip.creator_id}`)} className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold ring-2 ring-purple-500/20">
            {clip.creator_avatar ? <img src={clip.creator_avatar} className="w-full h-full rounded-full object-cover" /> : clip.creator_name?.[0]}
          </Link>
          <div>
            <p className="font-bold text-white">@{clip.creator_name?.toLowerCase().replace(/\s/g, '')}</p>
            <button className="text-xs text-purple-400 font-bold hover:text-purple-300">Subscribe</button>
          </div>
        </div>
        <h2 className="text-xl font-bold text-white mb-2 line-clamp-2">{clip.title}</h2>
        <p className="text-gray-400 text-sm line-clamp-4">{clip.description}</p>
      </div>

      {/* Center: Video */}
      <div className="flex-1 flex items-center justify-center relative group">
        <div className="relative h-[70vh] lg:h-[85vh] aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/10">
          {clip.video_url ? (
            <video 
              ref={videoRef} 
              src={clip.video_url} 
              poster={clip.thumbnail_url} 
              loop 
              playsInline 
              className="w-full h-full object-cover cursor-pointer" 
              onClick={togglePlay}
              onTimeUpdate={() => videoRef.current && setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100)}
            />
          ) : (
            <img src={clip.thumbnail_url} alt={clip.title} className="w-full h-full object-cover cursor-pointer" onClick={togglePlay} />
          )}
          
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/20 via-transparent to-black/40" />
          
          {!playing && (
            <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Play className="w-8 h-8 text-white fill-white" />
              </div>
            </button>
          )}

          {/* Mobile Info Overlay */}
          <div className="lg:hidden absolute bottom-4 left-4 right-12 pointer-events-none">
            <p className="text-white font-bold text-sm drop-shadow-lg">@{clip.creator_name}</p>
            <p className="text-white text-xs drop-shadow-lg line-clamp-1">{clip.title}</p>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div className="h-full bg-purple-500 transition-all duration-100" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Floating Interaction Buttons (Mobile style but visible on desktop group hover or always) */}
        <div className="absolute right-[-50px] lg:right-4 bottom-12 flex flex-col gap-4 z-20">
          <button onClick={onLike} className="flex flex-col items-center gap-1 group/btn">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${liked ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
            </div>
            <span className="text-white text-[10px] font-bold">{formatCount((clip.likes || 0) + (liked ? 1 : 0))}</span>
          </button>
          <button onClick={onShare} className="flex flex-col items-center gap-1 group/btn">
            <div className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all">
              <Share2 className="w-6 h-6" />
            </div>
            <span className="text-white text-[10px] font-bold">Share</span>
          </button>
          <button onClick={onSave} className="flex flex-col items-center gap-1 group/btn">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${saved ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              <Bookmark className={`w-6 h-6 ${saved ? 'fill-current' : ''}`} />
            </div>
            <span className="text-white text-[10px] font-bold">Save</span>
          </button>
        </div>
      </div>

      {/* Right side: Comments / AI / Notes */}
      <div className="hidden lg:flex flex-col w-80 bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        <Tabs value={rightTab} onValueChange={setRightTab} className="flex flex-col h-full">
          <TabsList className="bg-transparent border-b border-white/10 rounded-none p-0 h-12">
            <TabsTrigger value="comments" className="flex-1 h-full rounded-none data-[state=active]:bg-white/5 data-[state=active]:text-purple-400">Comments</TabsTrigger>
            <TabsTrigger value="ai" className="flex-1 h-full rounded-none data-[state=active]:bg-white/5 data-[state=active]:text-cyan-400">AI</TabsTrigger>
            <TabsTrigger value="notes" className="flex-1 h-full rounded-none data-[state=active]:bg-white/5 data-[state=active]:text-purple-400">Notes</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="comments" className="h-full m-0 flex flex-col p-4">
              <ScrollArea className="flex-1 pr-3 mb-4">
                <div className="space-y-4">
                  {comments.map(c => (
                    <div key={c.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">{c.user[0]}</div>
                      <div>
                        <p className="text-white text-xs font-bold">{c.user}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex gap-2">
                <Input 
                  value={commentText} 
                  onChange={e => setCommentText(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleComment()}
                  placeholder="Add comment..." 
                  className="bg-white/5 border-white/10 text-xs"
                />
                <Button onClick={handleComment} size="icon" className="bg-purple-600 hover:bg-purple-700 shrink-0"><Send className="w-4 h-4" /></Button>
              </div>
            </TabsContent>

            <TabsContent value="ai" className="h-full m-0 flex flex-col p-4">
              <ScrollArea className="flex-1 pr-3 mb-4">
                {aiMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full mx-auto mb-3 flex items-center justify-center"><AILogo /></div>
                    <p className="text-white font-bold text-sm mb-1">AI Clip Assistant</p>
                    <p className="text-gray-400 text-xs">Ask me anything about this clip!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {aiMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-xs ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-200'}`}>
                          {aiStreamingIdx === idx ? aiStreamingText : msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              <div className="flex gap-2">
                <Input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendAiMessage()} placeholder="Ask AI..." className="bg-white/5 border-white/10 text-xs" />
                <Button onClick={sendAiMessage} size="icon" className="bg-cyan-600 hover:bg-cyan-700 shrink-0"><Send className="w-4 h-4" /></Button>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="h-full m-0 flex flex-col p-4">
              <div className="space-y-3">
                <Input value={noteTitle} onChange={e => setNoteTitle(e.target.value)} placeholder="Note title..." className="bg-white/5 border-white/10 text-xs" />
                <Textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} placeholder="Write your note..." className="bg-white/5 border-white/10 text-xs min-h-[120px]" />
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-xs">Save Note</Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

export default function Clips() {
  const { user } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [likedClips, setLikedClips] = useState({});
  const [savedClips, setSavedClips] = useState({});
  const [muted, setMuted] = useState(false);
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

  if (isLoading) return <div className="flex items-center justify-center h-full text-white">Loading Clips...</div>;
  if (clips.length === 0) return <div className="flex items-center justify-center h-full text-white">No clips found.</div>;

  return (
    <div ref={containerRef} className="h-[calc(100vh-80px)] overflow-hidden relative">
      {clips.map((item, idx) => (
        <div
          key={item.id}
          className="absolute inset-0 transition-transform duration-500 ease-in-out"
          style={{ transform: `translateY(${(idx - activeIndex) * 100}%)` }}
        >
          <ClipItem
            clip={item}
            isActive={idx === activeIndex}
            liked={!!likedClips[item.id]}
            saved={!!savedClips[item.id]}
            onLike={() => setLikedClips(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
            onSave={() => setSavedClips(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
            onShare={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success('Link copied!');
            }}
            muted={muted}
          />
        </div>
      ))}

      {/* Navigation Arrows */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
        <button onClick={goPrev} disabled={activeIndex === 0} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-20">
          <ChevronUp className="w-6 h-6" />
        </button>
        <button onClick={goNext} disabled={activeIndex === clips.length - 1} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-20">
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
