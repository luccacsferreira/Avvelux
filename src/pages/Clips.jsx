import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/theme';
import { 
  Heart, Bookmark, 
  Play, ChevronUp, ChevronDown, Send,
  Sparkles, Share2
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
  const { user } = useAuth();
  const { isLight } = useTheme();
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
  const [comments, setComments] = useState([]);

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
    setComments(prev => [...prev, { id: Date.now(), user: user?.display_name || 'You', avatar: (user?.display_name || 'Y')[0], text: commentText }]);
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

  const textColor = isLight ? 'text-black' : 'text-white';
  const textMuted = isLight ? 'text-gray-600' : 'text-gray-400';
  const sidebarBg = isLight ? 'bg-white border-gray-200' : 'bg-[#1a1a1a] border-gray-800';
  const inputBg = isLight ? 'bg-gray-100 border-gray-200' : 'bg-[#2a2a2a] border-gray-700';

  return (
    <div className="flex flex-col lg:flex-row w-full h-full max-w-7xl mx-auto gap-4 lg:gap-8 items-center justify-center py-2 lg:py-6 px-4">
      {/* MAIN VIEWPORT: Video & Interaction Overlay */}
      <div className="flex-1 flex items-center justify-center relative w-full h-full">
        <div className="flex items-end gap-4 justify-center w-full max-w-4xl h-full">
          
          {/* VIDEO CONTAINER */}
          <div className="relative w-full max-w-[440px] aspect-[9/16] bg-black rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-white/10 group-hover:border-purple-500/30 transition-all duration-500 group">
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
            
            {/* Bottom Overlay Info (Creator, Title, Desc) */}
            <div className="absolute inset-x-0 bottom-0 p-6 pt-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
              <div className="flex flex-col gap-2.5 pointer-events-auto">
                <div className="flex items-center gap-3">
                  <Link to={createPageUrl(`Profile?id=${clip.creator_id}`)} className="flex items-center gap-2 group/avatar">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 p-0.5 shadow-lg transform transition-transform group-hover/avatar:scale-110">
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
                <h2 className="text-white font-medium text-sm line-clamp-1 drop-shadow-md">{clip.title}</h2>
                <p className="text-white/80 text-xs line-clamp-2 leading-relaxed drop-shadow-md">
                  {clip.description}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
              <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-100" style={{ width: `${progress}%` }} />
            </div>

            {/* Play Overlay */}
            {!playing && (
              <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <Play className="w-8 h-8 text-white fill-white" />
                </div>
              </button>
            )}
          </div>

          {/* INTERACTION BUTTONS STACK (Right of Video) - Visible on Desktop */}
          <div className="hidden lg:flex flex-col gap-6 items-center mb-6">
            <button onClick={onLike} className="flex flex-col items-center gap-1 group">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all group-hover:scale-110 active:scale-90 shadow-lg ${liked ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10'}`}>
                <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
              </div>
              <span className={`text-[10px] font-bold ${textColor}`}>{formatCount((clip.likes || 0) + (liked ? 1 : 0))}</span>
            </button>

            <button onClick={() => setRightTab('comments')} className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-all group-hover:scale-110 active:scale-90 shadow-lg">
                <MessageSquare className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-bold ${textColor}`}>{formatCount(comments.length)}</span>
            </button>

            <button onClick={onSave} className="flex flex-col items-center gap-1 group">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all group-hover:scale-110 active:scale-90 shadow-lg ${saved ? 'bg-purple-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10'}`}>
                <Bookmark className={`w-6 h-6 ${saved ? 'fill-current' : ''}`} />
              </div>
              <span className={`text-[10px] font-bold ${textColor}`}>Save</span>
            </button>

            <button onClick={onShare} className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-all group-hover:scale-110 active:scale-90 shadow-lg">
                <Share2 className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-bold ${textColor}`}>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Interaction Tabs */}
      <div className={`flex flex-col w-full lg:w-96 h-[300px] lg:h-[85vh] rounded-[32px] border overflow-hidden shadow-xl ${sidebarBg}`}>
        <Tabs value={rightTab} onValueChange={setRightTab} className="flex flex-col h-full">
          <TabsList className={`bg-transparent border-b rounded-none p-2 h-16 gap-2 ${isLight ? 'border-gray-100' : 'border-white/5'}`}>
            <TabsTrigger 
              value="comments" 
              className={`flex-1 h-full rounded-none data-[state=active]:border-b-2 ${
                isLight 
                  ? 'data-[state=active]:text-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 data-[state=active]:bg-clip-text data-[state=active]:border-purple-500 text-gray-500' 
                  : 'data-[state=active]:text-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-cyan-400 data-[state=active]:bg-clip-text data-[state=active]:border-purple-500 text-gray-400'
              }`}
            >
              Comments
            </TabsTrigger>
            <TabsTrigger 
              value="ai" 
              className={`flex-1 h-full rounded-none data-[state=active]:border-b-2 ${
                isLight 
                  ? 'data-[state=active]:text-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 data-[state=active]:bg-clip-text data-[state=active]:border-purple-500 text-gray-500' 
                  : 'data-[state=active]:text-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-cyan-400 data-[state=active]:bg-clip-text data-[state=active]:border-purple-500 text-gray-400'
              }`}
            >
              AI Assistant
            </TabsTrigger>
            <TabsTrigger 
              value="notes"
              className={`flex-1 h-full rounded-none data-[state=active]:border-b-2 ${
                isLight 
                  ? 'data-[state=active]:text-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 data-[state=active]:bg-clip-text data-[state=active]:border-purple-500 text-gray-500' 
                  : 'data-[state=active]:text-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-cyan-400 data-[state=active]:bg-clip-text data-[state=active]:border-purple-500 text-gray-400'
              }`}
            >
              Notes
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 min-h-0 relative">
            <TabsContent value="comments" className="h-full m-0 data-[state=active]:flex flex-col">
              <ScrollArea className="flex-1">
                <div className="space-y-6 px-4 py-6">
                  {comments.length === 0 ? (
                    <div className="text-center py-12 px-6">
                      <p className={`${textMuted} text-xs`}>No comments yet. Be the first!</p>
                    </div>
                  ) : (
                    comments.map(c => (
                      <div key={c.id} className="flex gap-3 px-1">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500 flex-shrink-0 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                          {c.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`text-xs font-bold ${textColor}`}>{c.user}</p>
                            <span className="text-[10px] text-gray-500 font-medium">just now</span>
                          </div>
                          <p className={`${isLight ? 'text-gray-700' : 'text-gray-300'} text-xs leading-relaxed`}>{c.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
              
              <div className={`p-4 border-t shrink-0 ${isLight ? 'border-gray-100' : 'border-white/5'}`}>
                <div className="flex gap-2">
                  <Input 
                    value={commentText} 
                    onChange={e => setCommentText(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleComment()}
                    placeholder="Add a comment..." 
                    className={`h-11 px-4 rounded-xl text-sm ${inputBg}`}
                  />
                  <Button onClick={handleComment} size="icon" className="h-11 w-11 rounded-xl bg-purple-600 hover:bg-purple-700 shrink-0 shadow-lg shadow-purple-500/20">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ai" className="h-full m-0 data-[state=active]:flex flex-col p-4">
              <div className={`flex flex-col h-full rounded-xl p-4 ${isLight ? 'bg-gray-100' : 'bg-[#2a2a2a]'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${isLight ? 'text-black' : 'text-white'}`}>AI Assistant</p>
                    <p className={`text-[10px] ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Ask about this video</p>
                  </div>
                </div>

                <ScrollArea className="flex-1 mb-4">
                  <div className="font-sans pr-2">
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
                            className={`w-full p-3 rounded-lg text-left text-xs flex items-center gap-2 ${
                              isLight ? 'bg-white hover:bg-gray-50 text-black' : 'bg-[#1a1a1a] hover:bg-[#252525] text-white'
                            }`}
                          >
                            <FileText className={`w-4 h-4 ${isLight ? 'text-gray-600' : 'text-gray-400'}`} />
                            Summarize this video
                          </button>
                          <button 
                            onClick={() => setAiInput('What are related topics I should explore?')}
                            className={`w-full p-3 rounded-lg text-left text-xs flex items-center gap-2 ${
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
                              <div className={`inline-block p-3 rounded-xl text-xs leading-relaxed ${
                                msg.role === 'user'
                                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-md'
                                  : isLight ? 'bg-white text-black' : 'bg-[#1a1a1a] text-white border border-white/5'
                              }`}>
                                {content}{isStreaming && <span className="animate-pulse">▌</span>}
                              </div>
                            </div>
                          );
                        })}
                        {isAiLoading && (
                          <div className="flex gap-1 p-2">
                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-150" />
                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-300" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                <div className="flex gap-2 shrink-0">
                  <Input 
                    value={aiInput} 
                    onChange={e => setAiInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && sendAiMessage()} 
                    placeholder="Ask about this video..." 
                    className={`h-11 px-4 rounded-xl text-xs ${isLight ? 'bg-white border-gray-300 text-black' : 'bg-[#1a1a1a] border-gray-700 text-white'}`} 
                  />
                  <Button onClick={sendAiMessage} size="icon" className="h-11 w-11 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:opacity-90 shrink-0" disabled={isAiLoading}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="h-full m-0 data-[state=active]:flex flex-col p-4">
              <div className={`flex flex-col h-full rounded-xl p-4 ${isLight ? 'bg-gray-100' : 'bg-[#2a2a2a]'}`}>
                <h3 className={`font-medium mb-4 text-sm ${isLight ? 'text-black' : 'text-white'}`}>Notes</h3>
                
                <ScrollArea className="flex-1 mb-4">
                  {/* Empty state or existing notes would go here */}
                  <div className="text-center py-6">
                    <p className="text-xs text-gray-500">Add notes to capture key learnings from this clip.</p>
                  </div>
                </ScrollArea>

                <div className="space-y-2 shrink-0">
                  <Input
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Note title..."
                    className={`text-xs h-10 ${isLight ? 'bg-white border-gray-300 text-black' : 'bg-[#1a1a1a] border-gray-700 text-white'}`}
                  />
                  <Textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Write your note..."
                    className={`text-xs min-h-[100px] py-3 resize-none ${isLight ? 'bg-white border-gray-300 text-black' : 'bg-[#1a1a1a] border-gray-700 text-white'}`}
                  />
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 font-bold h-11"
                  >
                    Add Note
                  </Button>
                </div>
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
  const { isLight } = useTheme();
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

  if (isLoading) return <div className="flex items-center justify-center h-full text-purple-500">Loading Clips...</div>;
  if (clips.length === 0) return <div className="flex items-center justify-center h-full text-gray-500">No clips found.</div>;

  return (
    <div ref={containerRef} className={`h-[calc(100vh-56px)] mt-14 overflow-hidden relative ${isLight ? 'bg-white' : 'bg-[#0f0f0f]'}`}>
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
