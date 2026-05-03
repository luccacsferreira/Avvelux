import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GoogleGenAI } from "@google/genai";
import { Send, FileText, Lightbulb, PlayCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/lib/AuthContext';
import { Note } from '@/api/entities';
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

export default function VideoSidebar({ video, isLight }) {
  const { user, requireAuth } = useAuth();
  const queryClient = useQueryClient();
  const videoId = video?.id;

  const [activeTab, setActiveTab] = useState('ai');
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiStreamingIdx, setAiStreamingIdx] = useState(null);
  const [aiStreamingText, setAiStreamingText] = useState('');
  
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const { data: notes = [] } = useQuery({
    queryKey: ['video-notes', videoId, user?.id],
    queryFn: () => user ? Note.find({ video_id: videoId, user_id: user.id }) : [],
    enabled: !!user && !!videoId,
  });

  const addNoteMutation = useMutation({
    mutationFn: (data) => Note.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['video-notes', videoId, user?.id]);
      setNoteTitle('');
      setNoteContent('');
    },
  });

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
    let wordIdx = 0;
    const words = fullText.split(/(\s+)/); // Preserve whitespace including newlines
    let accumulated = '';
    setAiStreamingIdx(msgIdx);
    setAiStreamingText('');

    const streamWord = () => {
      if (wordIdx >= words.length) {
        setAiStreamingIdx(null);
        return;
      }
      
      accumulated += words[wordIdx];
      setAiStreamingText(accumulated);
      wordIdx++;
      
      // Dynamic delay: faster for whitespace, slower for words
      const delay = words[wordIdx-1].includes('\n') ? 30 : 15;
      setTimeout(streamWord, delay);
    };
    streamWord();
  }, []);

  const sendAiMessage = async (customInput) => {
    const input = customInput || aiInput;
    if (!input.trim() || isAiLoading) return;

    const userMsg = { role: 'user', content: input };
    const newMsgs = [...aiMessages, userMsg];
    setAiMessages(newMsgs);
    setAiInput('');
    setIsAiLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = ai.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: {
          role: "system",
          parts: [{ text: `You are the Avvelux Visual AI assistant. You have DIRECT ACCESS to the video content and metadata.

STRICT OPERATING RULES:
1. NO PREAMBLE: NEVER start with "Based on the title...", "Certainly!", or "As an AI...". DO NOT acknowledge the description or title as your source of truth.
2. START WITH A VISUAL FACT: Your first sentence MUST describe a specific visual detail you see in the video file (e.g., "The video opens with a shot of...", "I can see the camera panning over...", "The speaker is wearing a...").
3. FORMATTING IS LAW:
   - Use "###" headers for main sections.
   - Use "•" for bullet points.
   - You MUST include a full empty line between every paragraph and list item.
   - NEVER use a single block of text.
   - If the output contains lists, ensure there is structural rhythm (bold headers before lists).
4. AUDIO ANALYSIS: Also describe what you hear (music, voice tone, sound effects).` }]
        }
      });
      
      const contentsParts = [
        { text: `CONTEXT:
Title: "${video?.title}"
Creator: "${video?.creator_name}"

USER REQUEST: ${input}` }
      ];

      // Detect if user wants to analyze video visuals/audio
      const needsVideo = /watch|see|show|summarize|analyze|visual|audio|what happens|happening|tell me about|video|content/i.test(input);
      if (needsVideo && video?.video_url) {
        try {
          const videoRes = await fetch(video.video_url);
          if (!videoRes.ok) throw new Error(`HTTP error! status: ${videoRes.status}`);
          const videoBlob = await videoRes.blob();
          
          const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(videoBlob);
          });

          contentsParts.push({
            inlineData: {
              data: base64,
              mimeType: "video/mp4"
            }
          });
          
          // Additional nudge to watch
          contentsParts.push({ text: "Watch the video above carefully and answer based ON THE VIDEO FOOTAGE, not the meta-tags." });
        } catch (fetchErr) {
          console.warn("Multimodal video fetch failed:", fetchErr);
          contentsParts.push({ text: "\n\n(Note: I am experiencing a technical issue viewing the video file. I will proceed with a general analysis based on the title.)" });
        }
      }

      const response = await model.generateContent({
        contents: [{ role: 'user', parts: contentsParts }],
      });

      const responseText = response.response.text();
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
    <div className="flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsList className={`bg-transparent border-b w-full justify-start rounded-none h-auto p-0 ${isLight ? 'border-gray-200' : 'border-gray-800'}`}>
          <TabsTrigger 
            value="ai" 
            className={`rounded-none bg-transparent shadow-none border-none pb-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 text-sm ${
              isLight 
                ? 'data-[state=active]:text-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 data-[state=active]:bg-clip-text data-[state=active]:border-purple-500 text-gray-500' 
                : 'data-[state=active]:text-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-cyan-400 data-[state=active]:bg-clip-text data-[state=active]:border-purple-500 text-gray-400'
            }`}
          >
            AI Assistant
          </TabsTrigger>
          <TabsTrigger 
            value="notes"
            className={`rounded-none bg-transparent shadow-none border-none pb-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 text-sm ${
              isLight 
                ? 'data-[state=active]:text-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 data-[state=active]:bg-clip-text data-[state=active]:border-purple-500 text-gray-500' 
                : 'data-[state=active]:text-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-cyan-400 data-[state=active]:bg-clip-text data-[state=active]:border-purple-500 text-gray-400'
            }`}
          >
            Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="mt-4 flex-1 flex flex-col min-h-0 h-full data-[state=inactive]:hidden">
          <div className={`rounded-xl p-4 flex-1 flex flex-col min-h-0 ${isLight ? 'bg-gray-100' : 'bg-[#2a2a2a]'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                <AILogo />
              </div>
              <div>
                <p className={`font-medium text-sm ${isLight ? 'text-black' : 'text-white'}`}>AI Assistant</p>
                <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Ask about this content</p>
              </div>
            </div>

            <ScrollArea className="flex-1 mb-4 overflow-y-auto">
              {aiMessages.length === 0 ? (
                <div className={`text-sm ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                  <p className="mb-2">💡 I can help you with this content:</p>
                  <ul className={`space-y-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                    <li>• <span className="bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">Summarize</span> the key points</li>
                    <li>• <span className="bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">Answer questions</span> about it</li>
                    <li>• <span className="bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">Suggest related topics</span></li>
                  </ul>
                  
                  <div className="mt-4 space-y-2">
                    <button 
                      onClick={() => sendAiMessage('Watch this video and summarize it for me.')}
                      className={`w-full p-3 rounded-lg text-left text-sm flex items-center gap-2 ${
                        isLight ? 'bg-white hover:bg-gray-50 text-black' : 'bg-[#1a1a1a] hover:bg-[#252525] text-white'
                      }`}
                    >
                      <PlayCircle className={`w-4 h-4 ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />
                      Watch & Summarize
                    </button>
                    <button 
                      onClick={() => sendAiMessage('Summarize the key points of this content.')}
                      className={`w-full p-3 rounded-lg text-left text-sm flex items-center gap-2 ${
                        isLight ? 'bg-white hover:bg-gray-50 text-black' : 'bg-[#1a1a1a] hover:bg-[#252525] text-white'
                      }`}
                    >
                      <FileText className={`w-4 h-4 ${isLight ? 'text-gray-600' : 'text-gray-400'}`} />
                      Key points (Metadata)
                    </button>
                    <button 
                      onClick={() => sendAiMessage('What are related topics I should explore?')}
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
                            : isLight ? 'bg-white text-black' : 'bg-[#1a1a1a] text-white shadow-inner'
                        }`}>
                          {msg.role === 'user' ? content : (
                            <div className="markdown-body max-w-none">
                              <ReactMarkdown>{content}</ReactMarkdown>
                            </div>
                          )}
                          {isStreaming && <span className="animate-pulse">▌</span>}
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
                placeholder="Ask about this..."
                className={`text-sm ${isLight ? 'bg-white border-gray-300 text-black' : 'bg-[#1a1a1a] border-gray-700 text-white'}`}
              />
              <Button 
                onClick={() => sendAiMessage()}
                disabled={isAiLoading}
                size="icon"
                className="bg-gradient-to-r from-purple-600 to-cyan-600 shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notes" className="mt-4 flex-1 flex flex-col min-h-0 h-full data-[state=inactive]:hidden">
          <div className={`rounded-xl p-4 flex-1 flex flex-col min-h-0 ${isLight ? 'bg-gray-100' : 'bg-[#2a2a2a]'}`}>
            <h3 className={`font-medium mb-4 text-sm ${isLight ? 'text-black' : 'text-white'}`}>Notes</h3>
            
            <ScrollArea className="flex-1 mb-4">
              <div className="space-y-3">
                {notes.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No notes yet. Add one below!</p>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className={`rounded-lg p-3 ${isLight ? 'bg-white' : 'bg-[#1a1a1a]'}`}>
                      <h4 className={`font-medium text-sm ${isLight ? 'text-black' : 'text-white'}`}>{note.title}</h4>
                      <p className={`text-sm mt-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{note.content}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-500 text-[10px]">
                          {note.created_at ? new Date(note.created_at).toLocaleDateString() : 'Just now'}
                        </span>
                        <div className="flex gap-2">
                          <button className="text-cyan-400 text-[10px]">Edit</button>
                          <button className="text-red-400 text-[10px]">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="space-y-2 shrink-0">
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
                className={`text-sm min-h-[60px] resize-none ${isLight ? 'bg-white border-gray-300 text-black' : 'bg-[#1a1a1a] border-gray-700 text-white'}`}
              />
              <Button 
                onClick={() => requireAuth(handleAddNote)}
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-sm h-9"
              >
                Add Note
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
