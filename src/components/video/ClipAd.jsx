import React, { useState } from 'react';
import { ExternalLink, Volume2, VolumeX } from 'lucide-react';

export default function ClipAd({ ad, onComplete }) {
  const [isMuted, setIsMuted] = useState(true);

  return (
    <div className="relative h-full w-full bg-black flex items-center justify-center snap-start">
      <video
        src={ad.video_url}
        autoPlay
        loop
        muted={isMuted}
        className="h-full w-full object-contain"
      />

      {/* Ad UI Overlay */}
      <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none">
        <div className="flex justify-between items-start pointer-events-auto">
          <div className="bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold border border-white/20 backdrop-blur-sm">
            Sponsored
          </div>
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 bg-black/40 rounded-full text-white backdrop-blur-sm"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex flex-col gap-4 pointer-events-auto">
          <div className="bg-black/60 p-4 rounded-2xl backdrop-blur-md border border-white/10 max-w-[80%]">
            <h3 className="text-white font-bold text-lg mb-1">{ad.title || 'Special Offer'}</h3>
            <p className="text-white/80 text-sm line-clamp-2 mb-3">
              {ad.description || 'Check out this amazing product and get a special discount today!'}
            </p>
            {ad.link_url && (
              <a
                href={ad.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg hover:scale-105 transition-transform"
              >
                Learn More <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Right Side Actions (Visual Only for Ad) */}
      <div className="absolute right-4 bottom-32 flex flex-col gap-6 items-center">
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
            <ExternalLink className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs font-medium">Visit</span>
        </div>
      </div>
    </div>
  );
}
