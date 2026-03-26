import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, Lightbulb, FileText, Video, Send, PenLine, Sparkles, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_6984c7fa1a63b2e9390a4414/843b19437_ModerneAVlogoingradint.png";

const AILogo = () => (
  <div className="w-full h-full flex items-center justify-center">
    <Sparkles className="w-5 h-5 text-white" />
  </div>
);

export default function AIHelp() {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [streamingMsgId, setStreamingMsgId] = useState(null);
  const [streamingText, setStreamingText] = useState('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState('system');
  const [deleteChatDialog, setDeleteChatDialog] = useState({ open: false, chatId: null });
  const [newChatTitle, setNewChatTitle] = useState(null); // for streaming chat title in sidebar
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    setTheme(localStorage.getItem('avvelux-theme') || 'system');
  }, []);
  
  const isLight = theme === 'light';

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        loadChats(userData.id);
      } catch (e) {}
    };
    loadUser();
  }, []);

  const loadChats = async (userId) => {
    const userChats = await base44.entities.AIChat.filter({ user_id: userId }, '-created_date');
    setChats(userChats);
  };

  const confirmDeleteChat = (e, chatId) => {
    e.stopPropagation();
    setDeleteChatDialog({ open: true, chatId });
  };

  const doDeleteChat = async () => {
    const { chatId } = deleteChatDialog;
    await base44.entities.AIChat.delete(chatId);
    setChats(prev => prev.filter(c => c.id !== chatId));
    if (currentChat?.id === chatId) {
      setCurrentChat(null);
      setMessages([]);
    }
    setDeleteChatDialog({ open: false, chatId: null });
  };

  // Stream text character by character, with pauses at sentence ends
  const streamResponse = useCallback((fullText, msgIndex) => {
    const phrases = fullText.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g) || [fullText];
    let phraseIdx = 0;
    let charIdx = 0;
    let accumulated = '';

    setStreamingMsgId(msgIndex);
    setStreamingText('');

    const streamChar = () => {
      if (phraseIdx >= phrases.length) {
        setStreamingMsgId(null);
        return;
      }
      const phrase = phrases[phraseIdx];
      if (charIdx < phrase.length) {
        accumulated += phrase[charIdx];
        setStreamingText(accumulated);
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

  // Stream a chat title in the sidebar
  const streamChatTitle = useCallback((chatId, fullTitle) => {
    const chars = fullTitle.split('');
    let i = 0;
    let built = '';
    const next = () => {
      if (i >= chars.length) return;
      built += chars[i];
      i++;
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, title: built } : c));
      setTimeout(next, 40);
    };
    next();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createNewChat = async () => {
    if (!user) return;
    const chat = await base44.entities.AIChat.create({ user_id: user.id, title: 'New Chat' });
    setChats([chat, ...chats]);
    setCurrentChat(chat);
    setMessages([]);
  };

  const loadChatMessages = async (chat) => {
    setCurrentChat(chat);
    const chatMessages = await base44.entities.ChatMessage.filter({ chat_id: chat.id }, 'created_date');
    setMessages(chatMessages);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userInput = input;
    let chatToUse = currentChat;
    
    // If no current chat, create one immediately with AI-generated title later
    if (!chatToUse && user) {
      chatToUse = await base44.entities.AIChat.create({ user_id: user.id, title: userInput.slice(0, 30) });
      setChats([chatToUse, ...chats]);
      setCurrentChat(chatToUse);
    }

    const userMessage = { role: 'user', content: userInput, chat_id: chatToUse.id };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingMsgId(null);

    await base44.entities.ChatMessage.create(userMessage);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a helpful AI assistant for Avvelux, a content and personal development platform. Answer clearly and directly.

RULES:
- Be specific and direct. No fluff, no filler phrases like "Great question!" or "Absolutely!".
- When listing principles, tips, or steps — always use a proper list format with dashes or numbers.
- If a video/topic is mentioned, give a structured summary with the main points.
- Example of a good answer format:
  "This video covers how to manage your time better based on science and philosophy. Key principles:
  - Wake up early
  - Have a solid morning routine
  - Read instead of doom-scrolling
  - Set 3 priorities per day"
- Keep answers concise but complete. No padding.

Previous context: ${messages.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n')}

User question: ${userInput}`,
        add_context_from_internet: true,
      });

      const assistantMessage = { role: 'assistant', content: response, chat_id: chatToUse.id };
      const newMessages = [...messages, { role: 'user', content: userInput }, assistantMessage];
      setMessages(newMessages);
      await base44.entities.ChatMessage.create(assistantMessage);

      // Stream the assistant response
      streamResponse(response, newMessages.length - 1);

      // Generate a better title for the chat based on the conversation
      try {
        const titleResponse = await base44.integrations.Core.InvokeLLM({
          prompt: `Generate a very short title (max 25 characters) for this conversation. User asked: "${userInput}". Just return the title, nothing else.`,
        });
        const newTitle = titleResponse.slice(0, 25);
        await base44.entities.AIChat.update(chatToUse.id, { title: newTitle });
        streamChatTitle(chatToUse.id, newTitle);
      } catch (e) {}
    } catch (error) {
      const errorMsg = 'Sorry, I encountered an error. Please try again.';
      const errorMessage = { role: 'assistant', content: errorMsg, chat_id: chatToUse.id };
      setMessages(prev => {
        const next = [...prev, errorMessage];
        streamResponse(errorMsg, next.length - 1);
        return next;
      });
    }

    setIsLoading(false);
  };

  const quickActions = [
    { icon: Search, label: 'Find videos on productivity' },
    { icon: FileText, label: 'Summarize a video' },
    { icon: Lightbulb, label: 'Tips for creators' },
    { icon: Video, label: 'Trending topics' },
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
            <AILogo />
          </div>
          <div>
            <h1 className={`text-xl font-semibold ${isLight ? 'text-black' : 'text-white'}`}>AI Assistant</h1>
            <p className={isLight ? 'text-gray-600 text-sm' : 'text-gray-400 text-sm'}>Your personal Avvelux AI helper</p>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 pr-4">
          {messages.length === 0 ? (
            <div className="space-y-6">
              {/* Welcome Message */}
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex-shrink-0 flex items-center justify-center">
                  <AILogo />
                </div>
                <div className={`rounded-2xl rounded-tl-none p-4 max-w-2xl ${isLight ? 'bg-gray-100' : 'bg-[#2a2a2a]'}`}>
                  <p className={isLight ? 'text-black' : 'text-white'}>
                    👋 Hi! I'm your Avvelux AI assistant. I can help you:
                  </p>
                  <ul className={`mt-2 space-y-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                    <li>• <span className="bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">Find videos</span> on any personal development topic</li>
                    <li>• <span className="bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">Summarize video content</span> for quick insights</li>
                    <li>• <span className="bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">Get creator tips</span> to improve your content</li>
                    <li>• <span className="bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">Discover trending topics</span> in your niche</li>
                  </ul>
                  <p className={`mt-3 ${isLight ? 'text-black' : 'text-white'}`}>What would you like help with today?</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 max-w-2xl ml-13">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(action.label)}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-colors text-left ${
                      isLight ? 'bg-white border-gray-200 hover:border-gray-300' : 'bg-[#2a2a2a] border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <action.icon className={isLight ? 'w-5 h-5 text-gray-600' : 'w-5 h-5 text-gray-400'} />
                    <span className={`text-sm ${isLight ? 'text-black' : 'text-white'}`}>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => {
                const isStreaming = streamingMsgId === idx;
                const content = isStreaming ? streamingText : msg.content;
                return (
                  <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex-shrink-0 flex items-center justify-center">
                        <AILogo />
                      </div>
                    )}
                    <div className={`rounded-2xl p-4 max-w-2xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-tr-none'
                        : isLight ? 'bg-gray-100 text-black rounded-tl-none' : 'bg-[#2a2a2a] text-white rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-wrap">{content}{isStreaming && <span className="animate-pulse">▌</span>}</p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex-shrink-0 flex items-center justify-center text-white font-medium">
                        {user?.full_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                );
              })}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex-shrink-0 flex items-center justify-center">
                    <AILogo />
                  </div>
                  <div className={`rounded-2xl rounded-tl-none p-4 ${isLight ? 'bg-gray-100' : 'bg-[#2a2a2a]'}`}>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="mt-4 flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything about videos, creators, or personal development..."
            className={isLight ? 'bg-gray-100 border-gray-300 text-black placeholder:text-gray-500' : 'bg-[#2a2a2a] border-gray-700 text-white placeholder:text-gray-500'}
          />
          <Button 
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Right Sidebar - Chat History */}
      <div className="w-64 ml-6 flex flex-col">
        <button
          onClick={createNewChat}
          className={`w-full p-3 mb-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
            isLight ? 'bg-gray-200 text-black hover:bg-gray-300' : 'bg-[#2a2a2a] text-white hover:bg-[#333]'
          }`}
        >
          <PenLine className="w-4 h-4" />
          New Chat
        </button>

        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`group/chat relative w-full p-3 rounded-lg text-left text-sm transition-colors cursor-pointer flex items-center justify-between ${
                  currentChat?.id === chat.id 
                    ? isLight ? 'bg-gray-200 text-black' : 'bg-white/10 text-white' 
                    : isLight ? 'text-gray-600 hover:bg-gray-100 hover:text-black' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
                onClick={() => loadChatMessages(chat)}
              >
                <span className="truncate pr-2">{chat.title || 'Untitled Chat'}</span>
                <button
                  onClick={(e) => confirmDeleteChat(e, chat.id)}
                  className="opacity-0 group-hover/chat:opacity-100 transition-opacity flex-shrink-0 p-1 rounded hover:text-red-400 text-gray-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Bottom Section */}
        <div className={`mt-4 pt-4 border-t ${isLight ? 'border-gray-200' : 'border-gray-800'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-medium text-sm">
              {user?.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className={`font-medium ${isLight ? 'text-black' : 'text-white'}`}>{user?.full_name || 'Guest'}</span>
          </div>
          <Link to={createPageUrl('Premium')} className="block w-full">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
              Upgrade Plan
            </Button>
          </Link>
        </div>
      </div>

      {/* Delete Chat Confirmation */}
      <Dialog open={deleteChatDialog.open} onOpenChange={(open) => setDeleteChatDialog({ ...deleteChatDialog, open })}>
        <DialogContent className={isLight ? 'bg-white' : 'bg-[#2a2a2a] border-gray-700'}>
          <DialogHeader>
            <DialogTitle className={isLight ? 'text-black' : 'text-white'}>Delete Chat</DialogTitle>
            <DialogDescription className={isLight ? 'text-gray-600' : 'text-gray-400'}>
              Are you sure you want to delete this chat? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteChatDialog({ open: false, chatId: null })} className={isLight ? 'border-gray-300 text-black' : 'border-gray-600 text-white'}>
              Cancel
            </Button>
            <Button onClick={doDeleteChat} className="bg-red-500 text-white hover:bg-red-600">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}