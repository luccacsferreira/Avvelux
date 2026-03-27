import React, { useState, useEffect } from 'react';
import { apiClient as base44 } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Heart, Plus, ArrowLeft, Pin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

function useTheme() {
  const [isLight, setIsLight] = useState(false);
  useEffect(() => { setIsLight(localStorage.getItem('avvelux-theme') === 'light'); }, []);
  return isLight;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Forum() {
  const isLight = useTheme();
  const qc = useQueryClient();
  const params = new URLSearchParams(window.location.search);
  const groupId = params.get('groupId');

  const [user, setUser] = useState(null);
  const [group, setGroup] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [form, setForm] = useState({ title: '', content: '' });
  const [replyText, setReplyText] = useState('');

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);
  useEffect(() => {
    if (groupId) base44.entities.Group.filter({ id: groupId }).then(r => r[0] && setGroup(r[0])).catch(() => {});
  }, [groupId]);

  const { data: posts = [] } = useQuery({
    queryKey: ['forum-posts', groupId],
    queryFn: () => base44.entities.ForumPost.filter({ group_id: groupId }, '-created_date', 100),
    enabled: !!groupId,
  });

  const { data: replies = [] } = useQuery({
    queryKey: ['forum-replies', selectedPost?.id],
    queryFn: () => base44.entities.Comment.filter({ content_type: 'post', content_id: selectedPost.id }, 'created_date'),
    enabled: !!selectedPost,
  });

  const createPost = useMutation({
    mutationFn: (data) => base44.entities.ForumPost.create(data),
    onSuccess: () => { qc.invalidateQueries(['forum-posts', groupId]); setShowCreate(false); setForm({ title: '', content: '' }); },
  });

  const likePost = useMutation({
    mutationFn: (post) => base44.entities.ForumPost.update(post.id, { likes: (post.likes || 0) + 1 }),
    onSuccess: () => qc.invalidateQueries(['forum-posts', groupId]),
  });

  const addReply = useMutation({
    mutationFn: (data) => base44.entities.Comment.create(data),
    onSuccess: () => {
      qc.invalidateQueries(['forum-replies', selectedPost?.id]);
      base44.entities.ForumPost.update(selectedPost.id, { reply_count: (selectedPost.reply_count || 0) + 1 });
      setReplyText('');
    },
  });

  const handleCreatePost = () => {
    if (!form.title.trim() || !user) return;
    createPost.mutate({
      group_id: groupId,
      group_name: group?.name || '',
      title: form.title,
      content: form.content,
      creator_id: user.id,
      creator_name: user.full_name,
      likes: 0,
      reply_count: 0,
    });
  };

  const handleReply = () => {
    if (!replyText.trim() || !user || !selectedPost) return;
    addReply.mutate({
      content_type: 'post',
      content_id: selectedPost.id,
      user_id: user.id,
      user_name: user.full_name,
      text: replyText,
    });
  };

  const bg = isLight ? 'bg-white' : 'bg-[#1a1a1a]';
  const cardBg = isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#2a2a2a] border-gray-800';
  const text = isLight ? 'text-gray-900' : 'text-white';
  const muted = isLight ? 'text-gray-500' : 'text-gray-400';

  return (
    <div className={`min-h-screen ${bg} ${text}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to={createPageUrl('Groups')} className={`p-1.5 rounded-lg hover:bg-white/10 ${muted}`}>
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{group?.name || 'Forum'}</h1>
          <p className={`text-sm ${muted}`}>{group?.category} · {group?.member_count || 0} members</p>
        </div>
        {!selectedPost && (
          <Button onClick={() => setShowCreate(true)} className="bg-gradient-to-r from-purple-600 to-cyan-500 text-white">
            <Plus className="w-4 h-4 mr-1" /> New Post
          </Button>
        )}
      </div>

      {/* Post detail view */}
      {selectedPost ? (
        <div>
          <button onClick={() => setSelectedPost(null)} className={`text-sm ${muted} mb-4 hover:underline flex items-center gap-1`}>
            <ArrowLeft className="w-4 h-4" /> Back to posts
          </button>
          <div className={`border rounded-2xl p-5 mb-4 ${cardBg}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                {selectedPost.creator_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-medium text-sm">{selectedPost.creator_name}</p>
                <p className={`text-xs ${muted}`}>{timeAgo(selectedPost.created_date)}</p>
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">{selectedPost.title}</h2>
            <p className={`${muted} leading-relaxed`}>{selectedPost.content}</p>
          </div>

          {/* Replies */}
          <h3 className="font-semibold mb-3">{replies.length} Replies</h3>
          <div className="space-y-3 mb-4">
            {replies.map(r => (
              <div key={r.id} className={`border rounded-xl p-4 ${cardBg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                    {r.user_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="font-medium text-sm">{r.user_name}</span>
                  <span className={`text-xs ${muted}`}>{timeAgo(r.created_date)}</span>
                </div>
                <p className={`text-sm ${muted}`}>{r.text}</p>
              </div>
            ))}
          </div>

          {/* Reply input */}
          <div className="flex gap-2">
            <Input
              placeholder="Write a reply..."
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleReply()}
              className={isLight ? '' : 'bg-[#2a2a2a] border-gray-700 text-white'}
            />
            <Button onClick={handleReply} className="bg-gradient-to-r from-purple-600 to-cyan-500 text-white">Reply</Button>
          </div>
        </div>
      ) : (
        /* Posts list */
        <div className="space-y-3">
          {posts.map(post => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className={`border rounded-2xl p-5 cursor-pointer hover:border-purple-500 transition-all ${cardBg}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {post.is_pinned && <Pin className="w-3.5 h-3.5 text-purple-400" />}
                    <span className={`text-xs ${muted}`}>{post.creator_name} · {timeAgo(post.created_date)}</span>
                  </div>
                  <h3 className="font-semibold mb-1 line-clamp-1">{post.title}</h3>
                  <p className={`text-sm ${muted} line-clamp-2`}>{post.content}</p>
                </div>
              </div>
              <div className={`flex items-center gap-4 mt-3 text-xs ${muted}`}>
                <button
                  onClick={e => { e.stopPropagation(); likePost.mutate(post); }}
                  className="flex items-center gap-1 hover:text-red-400 transition-colors"
                >
                  <Heart className="w-3.5 h-3.5" /> {post.likes || 0}
                </button>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" /> {post.reply_count || 0}
                </span>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <div className={`text-center py-16 ${muted}`}>
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No posts yet. Start the conversation!</p>
            </div>
          )}
        </div>
      )}

      {/* Create Post Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className={isLight ? 'bg-white' : 'bg-[#2a2a2a] border-gray-700 text-white'}>
          <DialogHeader>
            <DialogTitle className={text}>New Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              placeholder="Title"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className={isLight ? '' : 'bg-[#1a1a1a] border-gray-700 text-white'}
            />
            <textarea
              placeholder="What's on your mind?"
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              className={`w-full rounded-md border px-3 py-2 text-sm resize-none h-32 ${isLight ? 'border-gray-200 bg-white' : 'bg-[#1a1a1a] border-gray-700 text-white'}`}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreatePost} className="bg-gradient-to-r from-purple-600 to-cyan-500 text-white" disabled={!form.title.trim()}>
              Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}