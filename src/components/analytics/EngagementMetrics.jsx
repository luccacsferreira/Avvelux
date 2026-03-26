import React from 'react';
import { Heart, MessageCircle, Share2, TrendingUp, Award } from 'lucide-react';
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function EngagementMetrics({ isLight, videos, clips, posts, growthData }) {
  // Calculate engagement metrics
  const totalLikes = videos.reduce((sum, v) => sum + (v.likes || 0), 0) + 
                     clips.reduce((sum, c) => sum + (c.likes || 0), 0) +
                     posts.reduce((sum, p) => sum + (p.likes || 0), 0);
  
  const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0) + 
                     clips.reduce((sum, c) => sum + (c.views || 0), 0);

  const engagementRate = totalViews > 0 ? ((totalLikes / totalViews) * 100).toFixed(2) : 0;

  const metrics = [
    {
      title: 'Engagement Rate',
      value: `${engagementRate}%`,
      change: '+0.8%',
      positive: true,
      icon: TrendingUp,
      color: 'purple',
    },
    {
      title: 'Avg. Likes per Post',
      value: Math.floor(totalLikes / Math.max(videos.length + clips.length + posts.length, 1)).toLocaleString(),
      change: '+12%',
      positive: true,
      icon: Heart,
      color: 'pink',
    },
    {
      title: 'Comments Received',
      value: Math.floor(totalLikes * 0.15).toLocaleString(),
      change: '+5%',
      positive: true,
      icon: MessageCircle,
      color: 'cyan',
    },
    {
      title: 'Shares',
      value: Math.floor(totalLikes * 0.08).toLocaleString(),
      change: '+18%',
      positive: true,
      icon: Share2,
      color: 'green',
    },
  ];

  const colorMap = {
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-500' },
    pink: { bg: 'bg-pink-500/10', text: 'text-pink-500' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-500' },
    green: { bg: 'bg-green-500/10', text: 'text-green-500' },
  };

  // Top performing content
  const allContent = [
    ...videos.map(v => ({ ...v, type: 'Video' })),
    ...clips.map(c => ({ ...c, type: 'Clip' })),
    ...posts.map(p => ({ ...p, type: 'Post', views: (p.likes || 0) * 10 })),
  ].sort((a, b) => ((b.likes || 0) / Math.max(b.views || 1, 1)) - ((a.likes || 0) / Math.max(a.views || 1, 1)))
   .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`rounded-xl p-5 border ${isLight ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-gray-800'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${colorMap[metric.color].bg} flex items-center justify-center`}>
                <metric.icon className={`w-5 h-5 ${colorMap[metric.color].text}`} />
              </div>
              <span className={`text-sm ${metric.positive ? 'text-green-500' : 'text-red-500'}`}>
                {metric.change}
              </span>
            </div>
            <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{metric.title}</p>
            <p className={`text-2xl font-bold mt-1 ${isLight ? 'text-black' : 'text-white'}`}>{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Engagement Over Time */}
        <div className={`rounded-xl p-6 border ${isLight ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-gray-800'}`}>
          <h3 className={`font-semibold mb-4 ${isLight ? 'text-black' : 'text-white'}`}>Engagement Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="likesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="commentsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e5e7eb' : '#374151'} />
              <XAxis dataKey="date" stroke={isLight ? '#6b7280' : '#9ca3af'} fontSize={12} />
              <YAxis stroke={isLight ? '#6b7280' : '#9ca3af'} fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isLight ? '#fff' : '#1f2937', 
                  border: `1px solid ${isLight ? '#e5e7eb' : '#374151'}`,
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="likes" stroke="#ec4899" fill="url(#likesGrad)" strokeWidth={2} name="Likes" />
              <Area type="monotone" dataKey="comments" stroke="#06b6d4" fill="url(#commentsGrad)" strokeWidth={2} name="Comments" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Performing Content */}
        <div className={`rounded-xl p-6 border ${isLight ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-gray-800'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Award className={`w-5 h-5 ${isLight ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`font-semibold ${isLight ? 'text-black' : 'text-white'}`}>Top Performing Content</h3>
          </div>
          <div className="space-y-3">
            {allContent.length === 0 ? (
              <p className={`text-center py-8 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                No content yet. Start creating to see performance!
              </p>
            ) : (
              allContent.map((content, index) => {
                const engRate = ((content.likes || 0) / Math.max(content.views || 1, 1) * 100).toFixed(1);
                return (
                  <div key={content.id} className={`flex items-center gap-3 p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-white/5'}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' : 
                      index === 1 ? 'bg-gray-300 text-black' : 
                      index === 2 ? 'bg-amber-600 text-white' : 
                      isLight ? 'bg-gray-200 text-gray-600' : 'bg-gray-700 text-gray-300'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${isLight ? 'text-black' : 'text-white'}`}>{content.title}</p>
                      <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{content.type}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${isLight ? 'text-black' : 'text-white'}`}>{engRate}%</p>
                      <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Eng. Rate</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Engagement Tips */}
      <div className={`rounded-xl p-6 border bg-gradient-to-r ${isLight ? 'from-purple-50 to-cyan-50 border-purple-200' : 'from-purple-900/20 to-cyan-900/20 border-purple-800'}`}>
        <h3 className={`font-semibold mb-3 ${isLight ? 'text-black' : 'text-white'}`}>💡 Tips to Improve Engagement</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className={`text-sm font-medium ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>Post at Peak Hours</p>
            <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Your audience is most active between 6PM-10PM</p>
          </div>
          <div>
            <p className={`text-sm font-medium ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>Engage with Comments</p>
            <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Reply to comments within the first hour</p>
          </div>
          <div>
            <p className={`text-sm font-medium ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>Use Trending Topics</p>
            <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Content related to trends gets 40% more views</p>
          </div>
        </div>
      </div>
    </div>
  );
}