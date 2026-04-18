import React, { useState, useEffect } from 'react';
import { auth } from '@/api/sdk';
import { Post, Comment } from '@/api/entities';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, MessageCircle, Share2, Bookmark, Send } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PostPlayer() {
  const [user, setUser] = useState(null);
  const [post, setPost] = useState(null);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [theme, setTheme] = useState('system');
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const postId = searchParams.get('id');

  useEffect(() => {
    setTheme(localStorage.getItem('avvelux-theme') || 'system');
  }, []);

  const isLight = theme === 'light';

  useEffect(() => {
    const load = async () => {
      try {
        const userData = await auth.me();
        setUser(userData);
      } catch (e) {}
      if (postId) {
        const posts = await Post.filter({ id: postId });
        if (posts.length > 0) setPost(posts[0]);
      }
    };
    load();
  }, [postId]);

  const { data: comments = [] } = useQuery({
    queryKey: ['post-comments', postId],
    queryFn: () => postId ? Comment.filter({ content_type: 'post', content_id: postId }, '-created_at') : [],
    enabled: !!postId,
  });

  const addCommentMutation = useMutation({
    mutationFn: (data) => Comment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-comments', postId] });
      setNewComment('');
    },
  });

  const handleComment = () => {
    if (!newComment.trim() || !user || !postId) return;
    addCommentMutation.mutate({
      content_type: 'post',
      content_id: postId,
      user_id: user.id,
      user_name: user.display_name || user.username || user.email.split('@')[0],
      text: newComment,
    });
  };

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className={isLight ? 'text-gray-500' : 'text-gray-400'}>Loading post...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Single card containing post + reactions + comments */}
      <div className={`rounded-2xl border ${isLight ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-gray-800'}`}>
        {/* Author */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            {post.creator_avatar ? (
              <Link to={createPageUrl(`Profile?id=${post.creator_id}`)}>
                <img src={post.creator_avatar} alt={post.creator_name} className="w-11 h-11 rounded-full object-cover hover:opacity-80" />
              </Link>
            ) : (
              <Link to={createPageUrl(`Profile?id=${post.creator_id}`)} className="w-11 h-11 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-medium hover:opacity-80">
                {post.creator_name?.[0]?.toUpperCase() || 'U'}
              </Link>
            )}
            <div>
              <Link to={createPageUrl(`Profile?id=${post.creator_id}`)} className={`font-semibold hover:underline ${isLight ? 'text-black' : 'text-white'}`}>
                {post.creator_name || 'Unknown'}
              </Link>
              <p className="text-gray-500 text-xs">7 days ago</p>
            </div>
          </div>

          {/* Content */}
          <h2 className={`text-xl font-bold mb-2 ${isLight ? 'text-black' : 'text-white'}`}>{post.title}</h2>

          {/* Scrollable long text */}
          <div
            className={`text-sm leading-relaxed mb-4 ${isLight ? 'text-gray-700' : 'text-gray-300'} overflow-y-auto`}
            style={{ maxHeight: 300 }}
          >
            <style>{`
              ::-webkit-scrollbar { width: 4px; }
              ::-webkit-scrollbar-track { background: transparent; }
              ::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #a855f7, #06b6d4); border-radius: 4px; }
            `}</style>
            {post.content}
          </div>

          {post.image_url && (
            <div className="rounded-xl overflow-hidden mb-4">
              <img src={post.image_url} alt="" className="w-full object-cover" />
            </div>
          )}

          {post.is_poll && post.poll_options && (
            <div className="space-y-2 mb-4">
              {post.poll_options.map((option, idx) => (
                <button
                  key={idx}
                  className={`w-full p-3 rounded-lg border text-left text-sm hover:border-purple-500 transition-colors ${isLight ? 'border-gray-300 text-black' : 'border-gray-700 text-white'}`}
                >
                  {option.text}
                </button>
              ))}
            </div>
          )}

          {/* Reaction buttons — right below content, no extra space */}
          <div className={`flex items-center gap-5 pt-4 border-t ${isLight ? 'border-gray-200' : 'border-gray-700'}`}>
            <button onClick={() => setLiked(!liked)} className={`flex items-center gap-1.5 text-sm ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
              {(post.likes || 0) + (liked ? 1 : 0)}
            </button>
            <span className="flex items-center gap-1.5 text-sm text-gray-400">
              <MessageCircle className="w-5 h-5" />
              {comments.length}
            </span>
            <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white">
              <Share2 className="w-5 h-5" />
            </button>
            <button onClick={() => setSaved(!saved)} className={`ml-auto ${saved ? 'text-purple-500' : 'text-gray-400 hover:text-purple-500'}`}>
              <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Comments section — directly below reaction buttons, inside same card */}
        <div className={`border-t px-6 py-5 ${isLight ? 'border-gray-200' : 'border-gray-700'}`}>
          <h3 className={`font-semibold mb-4 ${isLight ? 'text-black' : 'text-white'}`}>
            Comments ({comments.length})
          </h3>

          {/* Add Comment */}
          {user && (
            <div className="flex gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex-shrink-0 flex items-center justify-center text-white text-sm font-medium">
                {user.display_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 flex gap-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                  placeholder="Add a comment..."
                  className={isLight ? 'bg-gray-100 border-gray-300 text-black' : 'bg-[#1a1a1a] border-gray-700 text-white'}
                />
                <Button
                  onClick={handleComment}
                  disabled={!newComment.trim()}
                  size="icon"
                  className="bg-gradient-to-r from-purple-600 to-cyan-600 flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No comments yet. Be the first!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex-shrink-0 flex items-center justify-center text-white text-sm font-medium">
                    {comment.user_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${isLight ? 'text-black' : 'text-white'}`}>{comment.user_name || 'User'}</p>
                    <p className={`text-sm mt-0.5 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>{comment.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}