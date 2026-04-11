import React from 'react';
import { WatchHistory, LikedContent, Video, Clip } from '@/api/entities';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, ChevronRight, History, Heart, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import VideoCard from '../feed/VideoCard';
import ClipCard from '../feed/ClipCard';

export default function PersonalizedRecommendations({ userId, isLight }) {
  // Fetch user's watch history
  const { data: watchHistory = [] } = useQuery({
    queryKey: ['watch-history', userId],
    queryFn: () => userId ? WatchHistory.filter({ user_id: userId }, '-created_date', 20) : [],
    enabled: !!userId,
  });

  // Fetch user's liked content
  const { data: likedContent = [] } = useQuery({
    queryKey: ['liked-content', userId],
    queryFn: () => userId ? LikedContent.filter({ user_id: userId }, '-created_date', 20) : [],
    enabled: !!userId,
  });

  // Fetch all videos
  const { data: allVideos = [] } = useQuery({
    queryKey: ['all-videos-rec'],
    queryFn: () => Video.list('-views', 50),
  });

  // Fetch all clips
  const { data: allClips = [] } = useQuery({
    queryKey: ['all-clips-rec'],
    queryFn: () => Clip.list('-views', 30),
  });

  // Get watched/liked content IDs
  const watchedIds = new Set(watchHistory.map(w => w.content_id));
  const likedIds = new Set(likedContent.map(l => l.content_id));

  // Analyze user preferences from history
  const getPreferredCategories = () => {
    const categoryCount = {};
    
    [...watchHistory, ...likedContent].forEach(item => {
      // Find the content to get its category
      const video = allVideos.find(v => v.id === item.content_id);
      const clip = allClips.find(c => c.id === item.content_id);
      const content = video || clip;
      
      if (content?.category) {
        categoryCount[content.category] = (categoryCount[content.category] || 0) + 1;
      }
    });

    return Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);
  };

  const preferredCategories = getPreferredCategories();

  // Get recommendations based on preferences
  const getRecommendedVideos = () => {
    const recommended = allVideos
      .filter(v => !watchedIds.has(v.id))
      .filter(v => preferredCategories.length === 0 || preferredCategories.includes(v.category))
      .slice(0, 6);
    
    // If not enough, add popular videos
    if (recommended.length < 6) {
      const popular = allVideos
        .filter(v => !watchedIds.has(v.id) && !recommended.find(r => r.id === v.id))
        .slice(0, 6 - recommended.length);
      recommended.push(...popular);
    }
    
    return recommended;
  };

  const getRecommendedClips = () => {
    return allClips
      .filter(c => !watchedIds.has(c.id))
      .filter(c => preferredCategories.length === 0 || preferredCategories.includes(c.category))
      .slice(0, 6);
  };

  // Continue watching - videos with progress
  const getContinueWatching = () => {
    return watchHistory
      .filter(w => w.progress_seconds && w.progress_seconds > 0)
      .slice(0, 4)
      .map(w => {
        const video = allVideos.find(v => v.id === w.content_id);
        const clip = allClips.find(c => c.id === w.content_id);
        return { ...(video || clip), progress: w.progress_seconds };
      })
      .filter(Boolean);
  };

  const recommendedVideos = getRecommendedVideos();
  const recommendedClips = getRecommendedClips();
  const continueWatching = getContinueWatching();

  if (!userId) return null;

  return (
    <div className="space-y-8">
      {/* Continue Watching */}
      {continueWatching.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold flex items-center gap-2 ${isLight ? 'text-black' : 'text-white'}`}>
              <History className="w-5 h-5 text-purple-500" />
              Continue Watching
            </h2>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {continueWatching.map(item => (
              <div key={item.id} className="relative">
                <VideoCard video={item} size="small" />
                <div className={`absolute bottom-16 left-0 right-0 h-1 ${isLight ? 'bg-gray-300' : 'bg-gray-700'}`}>
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-500" 
                    style={{ width: `${Math.min((item.progress / 600) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* For You */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-semibold flex items-center gap-2 ${isLight ? 'text-black' : 'text-white'}`}>
            <Sparkles className="w-5 h-5 text-purple-500" />
            Recommended For You
          </h2>
          <Link 
            to={createPageUrl('Explore')} 
            className={`text-sm flex items-center gap-1 ${isLight ? 'text-purple-600 hover:text-purple-700' : 'text-purple-400 hover:text-purple-300'}`}
          >
            See all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {preferredCategories.length > 0 && (
          <p className={`text-sm mb-3 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            Based on your interest in {preferredCategories.join(', ')}
          </p>
        )}
        <div className="grid grid-cols-3 gap-4">
          {recommendedVideos.map(video => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>

      {/* Quick Clips */}
      {recommendedClips.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold flex items-center gap-2 ${isLight ? 'text-black' : 'text-white'}`}>
              <TrendingUp className="w-5 h-5 text-cyan-500" />
              Clips You Might Like
            </h2>
          </div>
          <div className="grid grid-cols-6 gap-3">
            {recommendedClips.map(clip => (
              <ClipCard key={clip.id} clip={clip} />
            ))}
          </div>
        </section>
      )}

      {/* Because You Liked */}
      {likedContent.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold flex items-center gap-2 ${isLight ? 'text-black' : 'text-white'}`}>
              <Heart className="w-5 h-5 text-pink-500" />
              Because You Liked
            </h2>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {allVideos
              .filter(v => !likedIds.has(v.id) && !watchedIds.has(v.id))
              .slice(0, 4)
              .map(video => (
                <VideoCard key={video.id} video={video} size="small" />
              ))}
          </div>
        </section>
      )}
    </div>
  );
}