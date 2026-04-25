import React, { useState, useEffect } from 'react';
import { auth } from '@/api/sdk';
import { Video, Clip, Post, Follow } from '@/api/entities';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { 
  ArrowLeft, Users, 
  Heart, Play, BarChart3, Calendar
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

import OverviewCards from '../components/analytics/OverviewCards';
import VideoPerformanceTable from '../components/analytics/VideoPerformanceTable';
import AudienceDemographics from '../components/analytics/AudienceDemographics';
import EngagementMetrics from '../components/analytics/EngagementMetrics';

export default function Analytics() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('system');
  const [timeRange, setTimeRange] = useState('30');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setTheme(localStorage.getItem('avvelux-theme') || 'system');
  }, []);

  const isLight = theme === 'light';
  const borderColor = isLight ? 'border-gray-200' : 'border-gray-800';
  const textMuted = isLight ? 'text-gray-500' : 'text-gray-400';

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await auth.me();
        setUser(userData);
      } catch (e) {}
    };
    loadUser();
  }, []);

  const { data: videos = [] } = useQuery({
    queryKey: ['analytics-videos', user?.id],
    queryFn: () => user ? Video.filter({ creator_id: user.id }, '-created_at') : [],
    enabled: !!user,
  });

  const { data: clips = [] } = useQuery({
    queryKey: ['analytics-clips', user?.id],
    queryFn: () => user ? Clip.filter({ creator_id: user.id }, '-created_at') : [],
    enabled: !!user,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['analytics-posts', user?.id],
    queryFn: () => user ? Post.filter({ creator_id: user.id }, '-created_at') : [],
    enabled: !!user,
  });

  const { data: followers = [] } = useQuery({
    queryKey: ['analytics-followers', user?.id],
    queryFn: () => user ? Follow.filter({ following_id: user.id }) : [],
    enabled: !!user,
  });

  // Calculate total metrics
  const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0) + 
                     clips.reduce((sum, c) => sum + (c.views || 0), 0);
  const totalLikes = videos.reduce((sum, v) => sum + (v.likes || 0), 0) + 
                     clips.reduce((sum, c) => sum + (c.likes || 0), 0) +
                     posts.reduce((sum, p) => sum + (p.likes || 0), 0);
  const totalContent = videos.length + clips.length + posts.length;

  // Generate real growth data based on content creation dates
  const generateGrowthData = () => {
    const days = parseInt(timeRange);
    const data = [];
    const allContent = [...videos, ...clips, ...posts];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const contentByDate = allContent.filter(c => c.created_at && c.created_at.split('T')[0] === dateStr);
      const viewsOnDate = contentByDate.reduce((sum, c) => sum + (c.views || 0), 0);
      const likesOnDate = contentByDate.reduce((sum, c) => sum + (c.likes || 0), 0);
      
      // Since we don't have a history table, we'll just show the metrics for items created on that day
      // This is at least based on real data even if incomplete for daily snapshots
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views: viewsOnDate,
        followers: 0, // No historical follower data
        likes: likesOnDate,
        comments: 0,
      });
    }
    return data;
  };

  const growthData = generateGrowthData();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl('Account')}>
            <Button variant="ghost" size="icon" className={isLight ? 'text-black hover:bg-gray-100' : 'text-white hover:bg-white/10'}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className={`text-2xl font-bold ${isLight ? 'text-black' : 'text-white'}`}>Channel content</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className={`w-40 ${isLight ? 'bg-white border-gray-300 text-black' : 'bg-[#2a2a2a] border-gray-700 text-white'}`}>
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={isLight ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-gray-700'}>
              <SelectItem value="7" className={isLight ? 'text-black' : 'text-white'}>Last 7 days</SelectItem>
              <SelectItem value="30" className={isLight ? 'text-black' : 'text-white'}>Last 30 days</SelectItem>
              <SelectItem value="90" className={isLight ? 'text-black' : 'text-white'}>Last 90 days</SelectItem>
              <SelectItem value="365" className={isLight ? 'text-black' : 'text-white'}>Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className={`flex items-center gap-6 mb-6 overflow-x-auto pb-2 scrollbar-hide border-b ${borderColor}`}>
        {['Inspiration', 'Videos', 'Shorts', 'Live', 'Posts', 'Playlists', 'Podcasts', 'Promotions', 'Collaborations'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase() === 'videos' ? 'content' : tab.toLowerCase())}
            className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap relative ${
              (activeTab === 'content' && tab === 'Videos') || activeTab === tab.toLowerCase()
                ? `text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-white`
                : `${textMuted} hover:text-white`
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Cards (Only show if on overview or specifically requested, for now we keep them at top or move into a dashboard tab) */}
      {activeTab === 'overview' && (
        <OverviewCards 
          isLight={isLight}
          totalViews={totalViews}
          totalLikes={totalLikes}
          totalFollowers={followers.length}
          totalContent={totalContent}
          growthData={growthData}
        />
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Views Over Time */}
            <div className={`rounded-xl p-6 border ${isLight ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-gray-800'}`}>
              <h3 className={`font-semibold mb-4 ${isLight ? 'text-black' : 'text-white'}`}>Views Over Time</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
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
                    labelStyle={{ color: isLight ? '#000' : '#fff' }}
                  />
                  <Area type="monotone" dataKey="views" stroke="#8b5cf6" fill="url(#viewsGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Follower Growth */}
            <div className={`rounded-xl p-6 border ${isLight ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-gray-800'}`}>
              <h3 className={`font-semibold mb-4 ${isLight ? 'text-black' : 'text-white'}`}>Follower Growth</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e5e7eb' : '#374151'} />
                  <XAxis dataKey="date" stroke={isLight ? '#6b7280' : '#9ca3af'} fontSize={12} />
                  <YAxis stroke={isLight ? '#6b7280' : '#9ca3af'} fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isLight ? '#fff' : '#1f2937', 
                      border: `1px solid ${isLight ? '#e5e7eb' : '#374151'}`,
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: isLight ? '#000' : '#fff' }}
                  />
                  <Line type="monotone" dataKey="followers" stroke="#06b6d4" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Engagement Breakdown */}
            <div className={`rounded-xl p-6 border ${isLight ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-gray-800'}`}>
              <h3 className={`font-semibold mb-4 ${isLight ? 'text-black' : 'text-white'}`}>Engagement Breakdown</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={growthData.slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e5e7eb' : '#374151'} />
                  <XAxis dataKey="date" stroke={isLight ? '#6b7280' : '#9ca3af'} fontSize={12} />
                  <YAxis stroke={isLight ? '#6b7280' : '#9ca3af'} fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isLight ? '#fff' : '#1f2937', 
                      border: `1px solid ${isLight ? '#e5e7eb' : '#374151'}`,
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: isLight ? '#000' : '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="likes" fill="#8b5cf6" name="Likes" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="comments" fill="#06b6d4" name="Comments" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Content Distribution */}
            <div className={`rounded-xl p-6 border ${isLight ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-gray-800'}`}>
              <h3 className={`font-semibold mb-4 ${isLight ? 'text-black' : 'text-white'}`}>Content Distribution</h3>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPie>
                    <Pie
                      data={[
                        { name: 'Videos', value: videos.length || 1, color: '#8b5cf6' },
                        { name: 'Clips', value: clips.length || 1, color: '#06b6d4' },
                        { name: 'Posts', value: posts.length || 1, color: '#10b981' },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: 'Videos', value: videos.length || 1, color: '#8b5cf6' },
                        { name: 'Clips', value: clips.length || 1, color: '#06b6d4' },
                        { name: 'Posts', value: posts.length || 1, color: '#10b981' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <VideoPerformanceTable videos={videos} clips={clips} posts={posts} isLight={isLight} />
        </TabsContent>

        <TabsContent value="audience" className="mt-6">
          <AudienceDemographics isLight={isLight} followers={followers} />
        </TabsContent>

        <TabsContent value="engagement" className="mt-6">
          <EngagementMetrics isLight={isLight} videos={videos} clips={clips} posts={posts} growthData={growthData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}