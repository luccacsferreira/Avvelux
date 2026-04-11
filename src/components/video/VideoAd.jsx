import React, { useState, useEffect } from 'react';
import { Play, Volume2, Maximize, ExternalLink } from 'lucide-react';

export default function VideoAd({ ad, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(ad.duration || 15);
  const [canSkip, setCanSkip] = useState(false);
  const [skipTime, setSkipTime] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });

      setSkipTime(prev => {
        if (prev <= 1) {
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [ad, onComplete]);

  return (
    <div className="absolute inset-0 bg-black z-50 flex flex-col">
      <div className="relative flex-1 flex items-center justify-center">
        <video 
          src={ad.video_url} 
          autoPlay 
          className="max-h-full max-w-full"
        />
        
        {/* Ad Badge */}
        <div className="absolute top-4 left-4 bg-black/60 text-white px-2 py-1 rounded text-xs font-bold border border-white/20">
          ADVERTISEMENT
        </div>

        {/* Skip Button */}
        <div className="absolute bottom-20 right-4">
          {canSkip ? (
            <button 
              onClick={onComplete}
              className="bg-black/60 hover:bg-black/80 text-white px-6 py-2 rounded border border-white/20 flex items-center gap-2 transition-all"
            >
              Skip Ad
            </button>
          ) : (
            <div className="bg-black/60 text-white px-4 py-2 rounded border border-white/20 text-sm">
              Skip in {skipTime}s
            </div>
          )}
        </div>

        {/* Visit Site */}
        {ad.link_url && (
          <a 
            href={ad.link_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="absolute bottom-20 left-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm transition-all shadow-lg"
          >
            Visit Site <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Controls Bar */}
      <div className="h-16 bg-black/90 flex items-center px-4 gap-4 border-t border-white/10">
        <Play className="w-5 h-5 text-white fill-white" />
        <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-yellow-500 transition-all duration-1000" 
            style={{ width: `${((ad.duration - timeLeft) / ad.duration) * 100}%` }}
          />
        </div>
        <span className="text-white text-xs font-mono">0:{String(timeLeft).padStart(2, '0')}</span>
        <Volume2 className="w-5 h-5 text-white" />
        <Maximize className="w-5 h-5 text-white" />
      </div>
    </div>
  );
}
