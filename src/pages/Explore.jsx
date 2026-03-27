import React, { useState } from 'react';
import { apiClient as base44 } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import VideoCard from '../components/feed/VideoCard';
import CategoryTabs from '../components/feed/CategoryTabs';

const CATEGORIES = ['Trending', 'Music', 'Gaming', 'News', 'Sports', 'Learning', 'Fashion', 'Podcasts'];

const sampleVideos = [
  { id: '1', title: 'Full Body Workout - Build Muscle at Home (30 Min)', thumbnail_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600', duration: '32:18', views: 5200000, creator_name: 'FitLife' },
  { id: '2', title: '5-Minute Meditation for Anxiety Relief', thumbnail_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600', duration: '5:30', views: 8500000, creator_name: 'Mindful Living' },
  { id: '3', title: 'How to Overcome Fear and Take Action', thumbnail_url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600', duration: '18:33', views: 4200000, creator_name: 'Success Mindset' },
  { id: '4', title: 'Morning Routine of Highly Productive People', thumbnail_url: 'https://images.unsplash.com/photo-1523875194681-bedd468c58bf?w=600', duration: '15:42', views: 3900000, creator_name: 'Success Mindset' },
];

export default function Explore() {
  const [activeCategory, setActiveCategory] = useState('All');

  const { data: videos = sampleVideos } = useQuery({
    queryKey: ['explore-videos'],
    queryFn: () => base44.entities.Video.list('-views', 20),
    initialData: sampleVideos,
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