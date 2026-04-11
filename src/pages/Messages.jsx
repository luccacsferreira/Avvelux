import React, { useState, useEffect, useRef, useMemo } from 'react';
import { auth } from '@/api/sdk';
import { DirectMessage, User } from '@/api/entities';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Search, MessageCircle, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function useTheme() {
  const [isLight, setIsLight] = useState(false);
  useEffect(() => { setIsLight(localStorage.getItem('avvelux-theme') === 'light'); }, []);
  return isLight;
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function makeConversationId(a, b) {
  return [a, b].sort().join('__');
}

export default function Messages() {
  const isLight = useTheme();
  const qc = useQueryClient();
  const messagesEndRef = useRef(null);

  const [user, setUser] = useState(null);
  const [activeConvId, setActiveConvId] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => { auth.me().then(setUser).catch(() => {}); }, []);

  // All DMs for this user (sent or received)
  const { data: allDMs = [] } = useQuery({
    queryKey: ['dms', user?.id],
    queryFn: () => DirectMessage.list('-created_date', 200),
    enabled: !!user,
    refetchInterval: 5000,
  });

  // Messages in active conversation
  const convMessages = activeConvId
    ? allDMs.filter(m => m.conversation_id === activeConvId).sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
    : [];

  // Unique conversations
  const conversations = useMemo(() => {
    if (!user) return [];
    const seen = {};
    allDMs.forEach(msg => {
      const isMe = msg.sender_id === user.id;
      const otherId = isMe ? msg.recipient_id : msg.sender_id;
      const otherName = isMe ? msg.recipient_name : msg.sender_name;
      if (!seen[msg.conversation_id]) {
        seen[msg.conversation_id] = { convId: msg.conversation_id, otherId, otherName, lastMsg: msg.content, lastTime: msg.created_date };
      }
    });
    return Object.values(seen).sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime));
  }, [allDMs, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convMessages.length, activeConvId]);

  const sendMutation = useMutation({
    mutationFn: (data) => DirectMessage.create(data),
    onSuccess: () => { qc.invalidateQueries(['dms', user?.id]); setMessageText(''); },
  });

  const handleSearchUsers = async (q) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    const users = await User.list();
    setSearchResults(users.filter(u => u.id !== user?.id && (u.full_name?.toLowerCase().includes(q.toLowerCase()) || u.email?.toLowerCase().includes(q.toLowerCase()))));
    setSearching(false);
  };

  const openConversation = (otherId, otherName) => {
    const convId = makeConversationId(user.id, otherId);
    setActiveConvId(convId);
    setOtherUser({ id: otherId, name: otherName });
    setShowSearch(false);
    setUserSearch('');
    setSearchResults([]);
  };

  const handleSend = () => {
    if (!messageText.trim() || !user || !otherUser) return;
    sendMutation.mutate({
      conversation_id: activeConvId,
      sender_id: user.id,
      sender_name: user.full_name,
      recipient_id: otherUser.id,
      recipient_name: otherUser.name,
      content: messageText.trim(),
    });
  };

  const bg = isLight ? 'bg-white' : 'bg-[#1a1a1a]';
  const sidebarBg = isLight ? 'bg-gray-50' : 'bg-[#141414]';
  const cardBg = isLight ? 'bg-gray-100' : 'bg-[#2a2a2a]';
  const text = isLight ? 'text-gray-900' : 'text-white';
  const muted = isLight ? 'text-gray-500' : 'text-gray-400';
  const border = isLight ? 'border-gray-200' : 'border-gray-800';

  return (
    <div className={`flex h-[calc(100vh-7rem)] rounded-2xl overflow-hidden border ${border} ${bg}`}>
      {/* Left: Conversation list */}
      <div className={`w-72 flex-shrink-0 flex flex-col border-r ${border} ${sidebarBg}`}>
        {/* Header */}
        <div className={`p-4 border-b ${border} flex items-center justify-between`}>
          <h2 className={`font-bold text-lg ${text}`}>Messages</h2>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1.5 rounded-lg hover:bg-white/10 ${muted}`}
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* User search */}
        {showSearch && (
          <div className={`px-3 py-2 border-b ${border}`}>
            <Input
              placeholder="Search users..."
              value={userSearch}
              onChange={e => { setUserSearch(e.target.value); handleSearchUsers(e.target.value); }}
              className={`text-sm ${isLight ? '' : 'bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-500'}`}
              autoFocus
            />
            {searchResults.length > 0 && (
              <div className={`mt-2 rounded-lg overflow-hidden border ${border}`}>
                {searchResults.slice(0, 5).map(u => (
                  <button
                    key={u.id}
                    onClick={() => openConversation(u.id, u.full_name)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-purple-500/10 transition-colors ${text}`}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {u.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="text-left min-w-0">
                      <p className="font-medium truncate">{u.full_name}</p>
                      <p className={`text-xs ${muted} truncate`}>{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {userSearch && searchResults.length === 0 && !searching && (
              <p className={`text-xs ${muted} mt-2 text-center`}>No users found</p>
            )}
          </div>
        )}

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className={`text-center py-10 ${muted} text-sm px-4`}>
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No messages yet</p>
              <p className="text-xs mt-1">Search for a user to start chatting</p>
            </div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.convId}
                onClick={() => { setActiveConvId(conv.convId); setOtherUser({ id: conv.otherId, name: conv.otherName }); }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-500/10 transition-colors border-b ${border} ${
                  activeConvId === conv.convId ? 'bg-purple-500/10 border-l-2 border-l-purple-500' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {conv.otherName?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <p className={`font-medium text-sm truncate ${text}`}>{conv.otherName}</p>
                    <p className={`text-xs ${muted} flex-shrink-0 ml-1`}>{timeAgo(conv.lastTime)}</p>
                  </div>
                  <p className={`text-xs ${muted} truncate`}>{conv.lastMsg}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right: Message area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeConvId && otherUser ? (
          <>
            {/* Conversation header */}
            <div className={`flex items-center gap-3 px-5 py-3.5 border-b ${border}`}>
              <button onClick={() => { setActiveConvId(null); setOtherUser(null); }} className={`md:hidden p-1 ${muted}`}>
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                {otherUser.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className={`font-semibold ${text}`}>{otherUser.name}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {convMessages.map(msg => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {msg.sender_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                      isMe
                        ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-br-none'
                        : isLight ? 'bg-gray-100 text-gray-900 rounded-bl-none' : 'bg-[#2a2a2a] text-white rounded-bl-none'
                    }`}>
                      <p className="leading-relaxed">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isMe ? 'text-white/60' : muted}`}>{timeAgo(msg.created_date)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={`px-4 py-3 border-t ${border} flex gap-2`}>
              <Input
                placeholder={`Message ${otherUser.name}...`}
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                className={isLight ? '' : 'bg-[#2a2a2a] border-gray-700 text-white placeholder:text-gray-500'}
              />
              <Button
                onClick={handleSend}
                disabled={!messageText.trim()}
                className="bg-gradient-to-r from-purple-600 to-cyan-500 text-white flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className={`flex-1 flex flex-col items-center justify-center ${muted}`}>
            <MessageCircle className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">Select a conversation</p>
            <p className="text-sm">Or search for a user to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}