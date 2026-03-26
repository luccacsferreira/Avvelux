import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useAuth } from '@/lib/AuthContext';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import TranslationBadge from '../common/TranslationBadge';

export default function PostCard({ post }) {
  const { requireAuth } = useAuth();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useState('system');
  const navigate = useNavigate();
  
  useEffect(() => {
    setTheme(localStorage.getItem('avvelux-theme') || 'system');
  }, []);

  const isLight = theme === 'light';

  return (
    <div className={`rounded-xl p-4 border ${isLight ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-gray-800'}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <Link 
          to={createPageUrl(`Profile?id=${post.creator_id}`)} 
          className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-medium hover:opacity-80"
        >
          {post.creator_name?.[0]?.toUpperCase() || 'U'}
        </Link>
        <div>
          <Link 
            to={createPageUrl(`Profile?id=${post.creator_id}`)} 
            className={`font-medium text-sm hover:underline ${isLight ? 'text-black' : 'text-white'}`}
          >
            {post.creator_name || 'Unknown'}
          </Link>
          <p className="text-gray-500 text-xs">7 days ago</p>
        </div>
      </div>

      {/* Content */}
      <h3 className={`font-medium mb-2 ${isLight ? 'text-black' : 'text-white'}`}>
        <TranslationBadge text={post.title} language={post.language} showBadge={false} inline />
      </h3>
      <p className={`text-sm mb-3 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
        <TranslationBadge text={post.content} language={post.language} showBadge={false} inline />
      </p>

      {/* Image if exists */}
      {post.image_url && (
        <div className="rounded-lg overflow-hidden mb-3">
          <img src={post.image_url} alt="" className="w-full object-cover" />
        </div>
      )}

      {/* Poll if exists */}
      {post.is_poll && post.poll_options && (
        <div className="space-y-2 mb-3">
          {post.poll_options.map((option, idx) => (
            <button 
              key={idx}
              className={`w-full p-3 rounded-lg border text-left text-sm hover:border-purple-500 transition-colors ${
                isLight ? 'border-gray-300 text-black' : 'border-gray-700 text-white'
              }`}
            >
              {option.text}
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className={`flex items-center gap-4 pt-3 border-t ${isLight ? 'border-gray-200' : 'border-gray-700'}`}>
        <button 
          onClick={() => requireAuth(() => setLiked(!liked))}
          className={`flex items-center gap-1.5 text-sm ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
        >
          <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
          {(post.likes || 0) + (liked ? 1 : 0)}
        </button>
        <button 
          onClick={() => navigate(createPageUrl(`PostPlayer?id=${post.id}`))}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white"
        >
          <MessageCircle className="w-5 h-5" />
          {post.comments_count || 0}
        </button>
        <button 
          onClick={(e) => {
            e.preventDefault();
            const url = `${window.location.origin}${createPageUrl(`PostPlayer?id=${post.id}`)}`;
            navigator.clipboard.writeText(url);
          }}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white"
        >
          <Share2 className="w-5 h-5" />
        </button>
        <button 
          onClick={(e) => {
            e.preventDefault();
            requireAuth(() => setSaved(!saved));
          }}
          className={`ml-auto ${saved ? 'text-purple-500' : 'text-gray-400 hover:text-purple-500'}`}
        >
          <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
}