import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import LanguageBadge from '../common/LanguageBadge';
import TranslationBadge from '../common/TranslationBadge';

export default function VideoCard({ video, size = 'normal' }) {
  const [theme, setTheme] = useState('system');
  const [translatedTitle, setTranslatedTitle] = useState(null);
  
  useEffect(() => {
    setTheme(localStorage.getItem('avvelux-theme') || 'system');
  }, []);

  const isLight = theme === 'light';
  const isSmall = size === 'small';
  
  return (
    <Link to={createPageUrl(`VideoPlayer?id=${video.id}`)} className="group block">
      <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-800">
        <img 
          src={video.thumbnail_url || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400'} 
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute bottom-2 right-2 flex items-center gap-1">
          <LanguageBadge language={video.language} />
          <span className="bg-black/60 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-md text-[10px] text-white font-bold tracking-wider">
            {video.duration || '0:00'}
          </span>
        </div>
      </div>
      <div className="mt-3 flex gap-3">
        {video.creator_id ? (
          <Link 
            to={createPageUrl(`Profile?id=${video.creator_id}`)} 
            onClick={(e) => e.stopPropagation()}
            className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex-shrink-0 flex items-center justify-center text-white text-sm font-medium hover:opacity-80"
          >
            {video.creator_name?.[0]?.toUpperCase() || 'U'}
          </Link>
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex-shrink-0 flex items-center justify-center text-white text-sm font-medium">
            {video.creator_name?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium line-clamp-2 ${isSmall ? 'text-sm' : ''} ${isLight ? 'text-black' : 'text-white'}`}>
            <TranslationBadge 
              text={video.title} 
              language={video.language}
              onTranslated={setTranslatedTitle}
              showBadge={false}
              inline
            />
          </h3>
          {video.creator_id ? (
            <Link 
              to={createPageUrl(`Profile?id=${video.creator_id}`)} 
              onClick={(e) => e.stopPropagation()}
              className={`text-sm mt-1 block hover:underline ${isLight ? 'text-gray-600' : 'text-gray-400'}`}
            >
              {video.creator_name || 'Unknown'}
            </Link>
          ) : (
            <p className={`text-sm mt-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{video.creator_name || 'Unknown'}</p>
          )}
          <p className="text-gray-500 text-xs">
            {(() => { const v = video.views || 0; return v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(1)}K` : String(v); })()} views • {video.created_date ? '7 days ago' : 'Just now'}
          </p>
        </div>
      </div>
    </Link>
  );
}