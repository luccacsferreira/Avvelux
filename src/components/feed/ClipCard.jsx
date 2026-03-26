import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import LanguageBadge from '../common/LanguageBadge';
import TranslationBadge from '../common/TranslationBadge';

function formatViews(n) {
  if (!n) return '0';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

// compact = used in feed rows (no duration badge, smaller text)
export default function ClipCard({ clip, compact = false, hideCreator = false }) {
  return (
    <Link to={createPageUrl(`ClipPlayer?id=${clip.id}`)} className="group block">
      <div className="relative rounded-xl overflow-hidden aspect-[9/16] bg-gray-800">
        <img 
          src={clip.thumbnail_url || 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=300'} 
          alt={clip.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute top-2 right-2">
          <LanguageBadge language={clip.language} />
        </div>
        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-white font-medium line-clamp-2 leading-tight" style={{ fontSize: compact ? '0.65rem' : '0.75rem' }}>
            <TranslationBadge text={clip.title} language={clip.language} showBadge={false} inline />
          </p>
          <p className="text-gray-300 mt-0.5" style={{ fontSize: '0.6rem' }}>{formatViews(clip.views)} views</p>
        </div>
        {/* Creator avatar top left */}
        {!hideCreator && (
          <div className="absolute top-2 left-2">
            {clip.creator_avatar ? (
              <img src={clip.creator_avatar} alt={clip.creator_name} className="w-6 h-6 rounded-full object-cover ring-1 ring-white/30" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white ring-1 ring-white/30" style={{ fontSize: '0.55rem', fontWeight: 700 }}>
                {clip.creator_name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
