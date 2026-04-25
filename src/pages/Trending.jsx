import React from 'react';
import { Video } from '@/api/entities';
import { useQuery } from '@tanstack/react-query';
import VideoCard from '../components/feed/VideoCard';
import { TrendingUp } from 'lucide-react';

export default function Trending() {
  const { data: videos = [] } = useQuery({
    queryKey: ['trending-videos'],
    queryFn: () => Video.list('-views', 20),
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-8 h-8 text-purple-400" />
        <h1 className="text-2xl font-bold text-white">Trending</h1>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}