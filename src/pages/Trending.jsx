import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import VideoCard from '../components/feed/VideoCard';
import { TrendingUp } from 'lucide-react';

const sampleVideos = [
  { id: '1', title: 'Full Body Workout - Build Muscle at Home (30 Min)', thumbnail_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600', duration: '32:18', views: 5200000, creator_name: 'FitLife' },
  { id: '2', title: '5-Minute Meditation for Anxiety Relief', thumbnail_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600', duration: '5:30', views: 8500000, creator_name: 'Mindful Living' },
  { id: '3', title: 'How to Overcome Fear and Take Action', thumbnail_url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600', duration: '18:33', views: 4200000, creator_name: 'Success Mindset' },
  { id: '4', title: 'Morning Routine of Highly Productive People', thumbnail_url: 'https://images.unsplash.com/photo-1523875194681-bedd468c58bf?w=600', duration: '15:42', views: 3900000, creator_name: 'Success Mindset' },
  { id: '5', title: 'Leadership Skills Every Manager Needs', thumbnail_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600', duration: '25:12', views: 1900000, creator_name: 'Success Mindset' },
  { id: '6', title: 'The Science of Healthy Eating', thumbnail_url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600', duration: '24:56', views: 1800000, creator_name: 'FitLife' },
];

export default function Trending() {
  const { data: videos = sampleVideos } = useQuery({
    queryKey: ['trending-videos'],
    queryFn: () => base44.entities.Video.list('-views', 20),
    initialData: sampleVideos,
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