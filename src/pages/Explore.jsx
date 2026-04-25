import React, { useState } from 'react';
import { Video } from '@/api/entities';
import { useQuery } from '@tanstack/react-query';
import VideoCard from '../components/feed/VideoCard';
import CategoryTabs from '../components/feed/CategoryTabs';

const CATEGORIES = ['Trending', 'Music', 'Gaming', 'News', 'Sports', 'Learning', 'Fashion', 'Podcasts'];

export default function Explore() {
  const [activeCategory, setActiveCategory] = useState('All');

  const { data: videos = [] } = useQuery({
    queryKey: ['explore-videos'],
    queryFn: () => Video.list('-views', 20),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Explore</h1>
      
      <div className="mb-6">
        <CategoryTabs 
          categories={CATEGORIES}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}