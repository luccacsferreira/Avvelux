import React from 'react';
import { Eye, Heart, Users, Play, TrendingUp, TrendingDown } from 'lucide-react';

export default function OverviewCards({ isLight, totalViews, totalLikes, totalFollowers, totalContent, growthData }) {
  // Calculate growth percentages
  const midPoint = Math.floor(growthData.length / 2);
  const recentViews = growthData.slice(midPoint).reduce((sum, d) => sum + d.views, 0);
  const previousViews = growthData.slice(0, midPoint).reduce((sum, d) => sum + d.views, 0);
  const viewsGrowth = previousViews ? ((recentViews - previousViews) / previousViews * 100).toFixed(1) : 0;

  const recentFollowers = growthData[growthData.length - 1]?.followers || 0;
  const previousFollowers = growthData[midPoint]?.followers || 1;
  const followersGrowth = ((recentFollowers - previousFollowers) / previousFollowers * 100).toFixed(1);

  const cards = [
    {
      title: 'Total Views',
      value: totalViews.toLocaleString(),
      icon: Eye,
      growth: viewsGrowth,
      color: 'purple',
    },
    // Action: Join
    {
      title: 'Total Likes',
      value: totalLikes.toLocaleString(),
      icon: Heart,
      growth: 0,
      color: 'pink',
    },
    {
      title: 'Followers',
      value: totalFollowers.toLocaleString(),
      icon: Users,
      growth: followersGrowth,
      color: 'cyan',
    },
    {
      title: 'Total Content',
      value: totalContent.toLocaleString(),
      icon: Play,
      growth: null,
      color: 'green',
    },
  ];

  const colorClasses = {
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
    cyan: 'from-cyan-500 to-cyan-600',
    green: 'from-green-500 to-green-600',
  };

  const bgColorClasses = {
    purple: 'bg-purple-500/10',
    pink: 'bg-pink-500/10',
    cyan: 'bg-cyan-500/10',
    green: 'bg-green-500/10',
  };

  const iconColorClasses = {
    purple: 'text-purple-500',
    pink: 'text-pink-500',
    cyan: 'text-cyan-500',
    green: 'text-green-500',
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`rounded-xl p-5 border ${isLight ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-gray-800'}`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-lg ${bgColorClasses[card.color]} flex items-center justify-center`}>
              <card.icon className={`w-5 h-5 ${iconColorClasses[card.color]}`} />
            </div>
            {card.growth !== null && (
              <div className={`flex items-center gap-1 text-sm ${parseFloat(card.growth) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {parseFloat(card.growth) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(card.growth)}%
              </div>
            )}
          </div>
          <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{card.title}</p>
          <p className={`text-2xl font-bold mt-1 ${isLight ? 'text-black' : 'text-white'}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}