import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/theme';
import { supabase } from '@/lib/supabase';
import { 
  Heart, MessageSquare, Share2, Bookmark, 
  Volume2, VolumeX, Send,
  FileText, Play
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import { GoogleGenAI } from "@google/genai";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function formatCount(n) {
  if (!n) return '0';
  if (n >= 1000000) return `${(n / 1000000).toFixed(n % 1000000 >= 100000 ? 1 : 0)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0)}K`;
  return String(n);
}

const AILogo = () => (
  <div className="w-full h-full flex items-center justify-center">
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  </div>
);

export default function ClipPlayer() {
  const { user, requireAuth } = useAuth();
  const { isLight } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [clip, setClip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(true);
  const videoRef = useRef(null);

  // Interaction State
  const [rightTab, setRightTab] = useState('ai');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiStreamingIdx, setAiStreamingIdx] = useState(null);
  const [aiStreamingText, setAiStreamingText] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  
  const [sidebarWidth, setSidebarWidth] = useState(360);
  const isDragging = useRef(false);
  
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

  const handleComment = () => {
    if (!commentText.trim()) return;
    setComments(prev => [...prev, { 
      id: Date.now(), 
      user: user?.display_name || 'You', 
      avatar: (user?.display_name || 'Y')[0], 
      text: commentText 
    }]);
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

  const handleDragStart = useCallback((e) => {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    const onMove = (mv) => {
      if (!isDragging.current) return;
      const newW = window.innerWidth - mv.clientX;
      setSidebarWidth(Math.min(500, Math.max(300, newW)));
    };
    const onUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, []);

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
    <div className={`flex flex-col lg:flex-row gap-0 min-h-screen ${isLight ? 'bg-white' : 'bg-black'} overflow-hidden`}>
      {/* MAIN VIEWPORT: Video & Interaction Overlay */}
      <div className="flex-1 flex items-center justify-center relative p-4 lg:p-8">
        <div className="flex items-end gap-4 max-w-5xl w-full justify-center">
          
          {/* VIDEO CONTAINER */}
          <div className="relative w-full max-w-[480px] aspect-[9/16] bg-black rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(168,85,247,0.15)] border-4 border-white/10 transition-all duration-500 group">
            <video 
              ref={videoRef}
              src={clip.video_url}
              poster={clip.thumbnail_url}
              autoPlay
              loop
              muted={muted}
              playsInline
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => {
                if (videoRef.current.paused) { videoRef.current.play(); setPlaying(true); }
                else { videoRef.current.pause(); setPlaying(false); }
              }}
            />
            
            {/* Bottom Overlay Info */}
            <div className="absolute inset-x-0 bottom-0 p-6 pt-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
              <div className="flex flex-col gap-3 pointer-events-auto">
                <div className="flex items-center gap-3">
                  <Link to={createPageUrl(`Profile?id=${clip.creator_id}`)} className="flex items-center gap-2 group/avatar">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 p-0.5 shadow-lg transform transition-transform group-hover/avatar:scale-110">
                      <div className={`w-full h-full rounded-full flex items-center justify-center overflow-hidden bg-black`}>
                        {clip.creator_avatar ? <img src={clip.creator_avatar} alt={clip.creator_name} className="w-full h-full object-cover" /> : <span className="text-white text-xs">{clip.creator_name?.[0]}</span>}
                      </div>
                    </div>
                    <span className="text-white font-bold text-sm drop-shadow-md hover:text-purple-400 transition-colors">@{clip.creator_name}</span>
                  </Link>
                  <button className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-bold hover:bg-gray-200 transition-all active:scale-95 shadow-lg">
                    Follow
                  </button>
                </div>
                <h2 className="text-white font-medium text-sm line-clamp-2 drop-shadow-md">{clip.title || 'Clip Title'}</h2>
                <p className="text-white/80 text-xs line-clamp-2 leading-relaxed drop-shadow-md max-w-[90%]">
                  {clip.description || 'No description provided.'}
                </p>
              </div>
            </div>

            {/* Centered Play Button (Visible when paused) */}
            {!playing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-none">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-md">
                  <Play className="w-10 h-10 text-white fill-white" />
                </div>
              </div>
            )}

            {/* Mute Button */}
            <button 
              onClick={(e) => { e.stopPropagation(); setMuted(!muted); }}
              className="absolute top-6 right-6 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20 hover:bg-black/60 transition-all active:scale-90"
            >
              {muted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
            </button>
          </div>

          {/* INTERACTION BUTTONS STACK (Right of Video) */}
          <div className="flex flex-col gap-6 items-center">
            <button onClick={() => setLiked(!liked)} className="flex flex-col items-center gap-1 group">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all group-hover:scale-110 active:scale-90 shadow-lg ${liked ? 'bg-red-500 text-white ring-4 ring-red-500/20' : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md'}`}>
                <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
              </div>
              <span className={`text-[10px] font-bold ${textColor}`}>{formatCount((clip.likes || 0) + (liked ? 1 : 0))}</span>
            </button>

            <button onClick={() => setRightTab('comments')} className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all group-hover:scale-110 active:scale-90 shadow-lg">
                <MessageSquare className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-bold ${textColor}`}>{formatCount(comments.length)}</span>
            </button>

            <button onClick={() => setSaved(!saved)} className="flex flex-col items-center gap-1 group">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all group-hover:scale-110 active:scale-90 shadow-lg ${saved ? 'bg-purple-600 text-white ring-4 ring-purple-600/20' : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md'}`}>
                <Bookmark className={`w-6 h-6 ${saved ? 'fill-current' : ''}`} />
              </div>
              <span className={`text-[10px] font-bold ${textColor}`}>Save</span>
            </button>

            <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }} className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all group-hover:scale-110 active:scale-90 shadow-lg">
                <Share2 className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-bold ${textColor}`}>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Drag Handle */}
      <div 
        onMouseDown={handleDragStart}
        className="hidden lg:flex w-1 hover:bg-purple-500 cursor-col-resize transition-colors z-50 bg-white/5"
      />

      {/* Sidebar - EXACT Same as Video page */}
      <div 
        className={`w-full lg:flex flex-col border-l border-white/5 ${isLight ? 'bg-white' : 'bg-black'}`}
        style={{ width: window.innerWidth < 1024 ? '100%' : sidebarWidth }}
      >
        <Tabs value={rightTab} onValueChange={setRightTab} className="h-full flex flex-col">
          <TabsList className={`bg-transparent border-b w-full justify-start rounded-none h-auto p-4 gap-6 ${isLight ? 'border-gray-200' : 'border-gray-800'}`}>
            <TabsTrigger 
              value="comments" 
              className={`rounded-none pb-2 data-[state=active]:border-b-2 text-sm font-medium transition-all ${
                isLight 
                  ? 'data-[state=active]:text-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 data-[state=active]:bg-clip-text data-[state=active]:border-purple-500 text-gray-500' 
                  : 'data-[state=active]:text-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-cyan-400 data-[state=active]:bg-clip-text data-[state=active]:border-purple-500 text-gray-400'
              }`}
            >
              Comments
            </TabsTrigger>
            <TabsTrigger 
              value="ai" 
              className={`rounded-none pb-2 data-[state=active]:border-b-2 text-sm font-medium transition-all ${
                isLight 
                  ? 'data-[state=active]:text-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 data-[state=active]:bg-clip-text data-[state=active]:border-purple-500 text-gray-500' 
                  : 'data-[state=active]:text-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-cyan-400 data-[state=active]:bg-clip-text data-[state=active]:border-purple-500 text-gray-400'
              }`}
            >
              AI Assistant
            </TabsTrigger>
            <TabsTrigger 
              value="notes"
              className={`rounded-none pb-2 data-[state=active]:border-b-2 text-sm font-medium transition-all ${
                isLight 
                  ? 'data-[state=active]:text-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 data-[state=active]:bg-clip-text data-[state=active]:border-purple-500 text-gray-500' 
                  : 'data-[state=active]:text-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-cyan-400 data-[state=active]:bg-clip-text data-[state=active]:border-purple-500 text-gray-400'
              }`}
            >
              Notes
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="comments" className="h-full m-0 p-6 flex flex-col">
              <ScrollArea className="flex-1 mb-4">
                {comments.length === 0 ? (
                  <p className={`text-sm ${textMuted}`}>No comments yet.</p>
                ) : (
                  <div className="space-y-4">
                    {comments.map(c => (
                      <div key={c.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">{c.avatar}</div>
                        <div>
                          <p className={`text-xs font-bold ${textColor}`}>{c.user}</p>
                          <p className={`text-sm ${textMuted}`}>{c.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              <div className="flex gap-2 pt-4 border-t border-white/5">
                <Input value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleComment()} placeholder="Add a comment..." className={`text-sm ${isLight ? 'bg-gray-100' : 'bg-white/5'}`} />
                <Button onClick={handleComment} size="icon" className="bg-purple-600 shrink-0"><Send className="w-4 h-4" /></Button>
              </div>
            </TabsContent>

            <TabsContent value="ai" className="h-full m-0 p-6 flex flex-col">
              <div className={`flex flex-col h-full rounded-2xl p-4 ${isLight ? 'bg-gray-100' : 'bg-white/5'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"><AILogo /></div>
                  <div>
                    <p className={`font-bold text-sm ${textColor}`}>AI Assistant</p>
                    <p className={`text-[10px] ${textMuted}`}>Ask about this clip</p>
                  </div>
                </div>

                <ScrollArea className="flex-1 mb-4">
                  <div className="space-y-4">
                    {aiMessages.length === 0 ? (
                      <div className={`text-xs space-y-4 ${textMuted}`}>
                        <p>I can summarize this clip or answer questions about its content.</p>
                        <button onClick={() => setAiInput('Summarize this clip')} className="w-full p-2.5 rounded-lg text-left bg-white/5 border border-white/10 flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Summarize</button>
                      </div>
                    ) : (
                      aiMessages.map((msg, idx) => (
                        <div key={idx} className={`${msg.role === 'user' ? 'text-right' : ''}`}>
                          <div className={`inline-block p-3 rounded-2xl text-xs ${msg.role === 'user' ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white' : isLight ? 'bg-white text-black shadow-sm' : 'bg-black text-white'}`}>
                            {aiStreamingIdx === idx ? aiStreamingText : msg.content}{aiStreamingIdx === idx && <span>▌</span>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
                
                <div className="flex gap-2">
                  <Input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendAiMessage()} placeholder="Ask AI..." className={`text-xs h-10 ${isLight ? 'bg-white' : 'bg-black/20'}`} />
                  <Button onClick={sendAiMessage} size="icon" className="h-10 w-10 bg-gradient-to-r from-purple-600 to-cyan-600"><Send className="w-4 h-4" /></Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="h-full m-0 p-6 flex flex-col">
              <div className={`flex flex-col h-full rounded-2xl p-4 ${isLight ? 'bg-gray-100' : 'bg-white/5'}`}>
                <h3 className={`font-bold mb-4 ${textColor}`}>Notes</h3>
                <ScrollArea className="flex-1 mb-4">
                  <p className={`text-xs text-center py-10 ${textMuted}`}>Take notes on this clip.</p>
                </ScrollArea>
                <div className="space-y-2">
                  <Input value={noteTitle} onChange={e => setNoteTitle(e.target.value)} placeholder="Title..." className={`text-xs h-10 ${isLight ? 'bg-white' : 'bg-black/20'}`} />
                  <Textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} placeholder="Content..." className={`text-xs min-h-[120px] ${isLight ? 'bg-white' : 'bg-black/20'}`} />
                  <Button onClick={() => requireAuth(() => toast.success('Note saved'))} className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 font-bold">Add Note</Button>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
