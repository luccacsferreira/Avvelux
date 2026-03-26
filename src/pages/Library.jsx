import React, { useState, useEffect } from 'react';
import { 
  ThumbsUp, 
  Clock, 
  FileText, 
  ListMusic, 
  Heart, 
  History, 
  User, 
  CreditCard, 
  Users, 
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import VideoCard from '../components/feed/VideoCard';
import { useAuth } from '@/lib/AuthContext';

const useTheme = () => {
  const [isLight, setIsLight] = useState(() => localStorage.getItem('avvelux-theme') === 'light');
  useEffect(() => {
    const syncTheme = () => setIsLight(localStorage.getItem('avvelux-theme') === 'light');
    window.addEventListener('avvelux-theme-changed', syncTheme);
    return () => window.removeEventListener('avvelux-theme-changed', syncTheme);
  }, []);
  return isLight;
};

const sampleHistory = [
  { id: 'v1', title: 'How to Manage Your Time Like a Philosopher', thumbnail_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600', duration: '18:42', views: 5200000, creator_name: 'ThinkSmarter', creator_id: 'u1', creator_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop', category: 'Self-Help' },
  { id: 'v2', title: 'Top 10 Gaming Moments of 2024', thumbnail_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600', duration: '22:10', views: 9100000, creator_name: 'GamingPeak', creator_id: 'u2', creator_avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=80&h=80&fit=crop', category: 'Gaming' },
  { id: 'v3', title: 'Geopolitics: Why the Middle East Will Never Be the Same', thumbnail_url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600', duration: '45:10', views: 3300000, creator_name: 'WorldReport', creator_id: 'u3', creator_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop', category: 'Geopolitics' },
  { id: 'v4', title: 'Office Prank Compilation - Best of 2024 😂', thumbnail_url: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=600', duration: '11:05', views: 14000000, creator_name: 'PrankKing', creator_id: 'u4', creator_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop', category: 'Pranks' },
];

export default function Library() {
  const isLight = useTheme();
  const { user } = useAuth();
  
  const text = isLight ? 'text-black' : 'text-white';
  const textMuted = isLight ? 'text-gray-500' : 'text-gray-400';
  const cardBg = isLight ? 'bg-gray-100' : 'bg-[#2a2a2a]';

  const quickLinks = [
    { icon: ThumbsUp, label: 'Liked Content', color: 'text-purple-500' },
    { icon: Clock, label: 'Watch Later', color: 'text-blue-500' },
    { icon: FileText, label: 'Notes', color: 'text-yellow-500' },
    { icon: ListMusic, label: 'Playlists', color: 'text-green-500' },
    { icon: Heart, label: 'Wishlists', color: 'text-red-500' },
  ];

  const sections = [
    { icon: History, label: 'Watch History', items: sampleHistory, type: 'videos' },
    { icon: User, label: 'Your Content', count: 12 },
    { icon: CreditCard, label: 'Membership', status: 'Active' },
    { icon: Users, label: 'My Communities', count: 5 },
    { icon: MessageSquare, label: 'Forum Activity', count: 24 },
  ];

  return (
    <div className={`max-w-7xl mx-auto pb-20 md:pb-8 px-4`}>
      <h1 className={`text-2xl font-bold mb-6 ${text}`}>Library</h1>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-10">
        {quickLinks.map((link) => (
          <button
            key={link.label}
            className={`${cardBg} p-4 rounded-2xl flex flex-col items-center gap-3 transition-transform hover:scale-105 active:scale-95`}
          >
            <div className={`p-3 rounded-full bg-white/10 ${link.color}`}>
              <link.icon size={24} />
            </div>
            <span className={`text-sm font-medium ${text}`}>{link.label}</span>
          </button>
        ))}
      </div>

      {/* Watch History Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className={text} size={20} />
            <h2 className={`text-lg font-semibold ${text}`}>Watch History</h2>
          </div>
          <button className={`text-sm font-medium text-purple-500 flex items-center gap-1`}>
            See all <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sampleHistory.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </div>

      {/* Other Sections List */}
      <div className="space-y-4">
        {sections.slice(1).map((section) => (
          <button
            key={section.label}
            className={`w-full ${cardBg} p-4 rounded-2xl flex items-center justify-between transition-colors hover:opacity-80`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-xl bg-white/5 ${text}`}>
                <section.icon size={20} />
              </div>
              <div className="text-left">
                <p className={`font-medium ${text}`}>{section.label}</p>
                {section.count !== undefined && (
                  <p className={`text-xs ${textMuted}`}>{section.count} items</p>
                )}
                {section.status && (
                  <p className={`text-xs text-green-500`}>{section.status}</p>
                )}
              </div>
            </div>
            <ChevronRight className={textMuted} size={20} />
          </button>
        ))}
      </div>
    </div>
  );
}
