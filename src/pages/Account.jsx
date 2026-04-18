import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useAuth } from '@/lib/AuthContext';
import { videoService } from '../services/videoService';
import { supabase } from '@/lib/supabase';
import { Video, Clip, Post, Story, Follow } from '@/api/entities';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import VideoCard from '../components/feed/VideoCard';
import ClipCard from '../components/feed/ClipCard';
import PostCard from '../components/feed/PostCard';
import EmptyState from '../components/common/EmptyState';
import { Settings, Upload, BarChart3, Plus, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Account() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Video');
  const [hasStory, setHasStory] = useState(false);
  const [storyViewed, setStoryViewed] = useState(false);
  const [theme, setTheme] = useState('night');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null, type: '' });
  const queryClient = useQueryClient();

  useEffect(() => {
    setTheme(localStorage.getItem('avvelux-theme') || 'system');
  }, []);

  const isLight = theme === 'light';

  const { data: followers = [] } = useQuery({
    queryKey: ['followers', user?.id],
    queryFn: () => user ? Follow.filter({ following_id: user.id }) : [],
    enabled: !!user,
  });

  const { data: following = [] } = useQuery({
    queryKey: ['following', user?.id],
    queryFn: () => user ? Follow.filter({ follower_id: user.id }) : [],
    enabled: !!user,
  });

  const { data: videos = [] } = useQuery({
    queryKey: ['my-videos', user?.id],
    queryFn: () => user ? videoService.getVideosByUser(user.id, user.id) : [],
    enabled: !!user,
  });

  const { data: clips = [] } = useQuery({
    queryKey: ['my-clips', user?.id],
    queryFn: () => user ? videoService.getClipsByUser(user.id, user.id) : [],
    enabled: !!user,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['my-posts', user?.id],
    queryFn: () => user ? videoService.getPostsByUser(user.id, user.id) : [],
    enabled: !!user,
  });



  const { data: stories = [] } = useQuery({
    queryKey: ['my-stories', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const userStories = await Story.filter({ creator_id: user.id });
      const now = new Date();
      const activeStories = userStories.filter(s => new Date(s.expires_at) > now);
      setHasStory(activeStories.length > 0);
      return activeStories;
    },
    enabled: !!user,
  });

  const handleDelete = async () => {
    const { item, type } = deleteDialog;
    try {
      const entityMap = {
        video: Video,
        clip: Clip,
        post: Post,
      };
      await entityMap[type].delete(item.id);
      queryClient.invalidateQueries({ queryKey: [`my-${type}s`] });
      toast.success('Content deleted successfully');
    } catch (error) {
      toast.error('Failed to delete content');
    }
    setDeleteDialog({ open: false, item: null, type: '' });
  };

  const tabs = [
    { value: 'Video', label: 'Videos', data: videos, type: 'video' },
    { value: 'Clips', label: 'Clips', data: clips, type: 'clip' },
    { value: 'Posts', label: 'Posts', data: posts, type: 'post' },
  ];

  const nickname = user?.display_name || user?.username || 'User';
  const username = user?.username || user?.email?.split('@')[0] || 'user';

  const ContentCard = ({ item, type, children }) => (
    <div className="relative group">
      {children}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button
          onClick={() => setDeleteDialog({ open: true, item, type })}
          className="p-1.5 rounded-full bg-red-500/80 text-white hover:bg-red-600"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      {/* Profile Header */}
      <div className="flex items-start gap-8 mb-8">
        {/* Profile Picture with Story Ring */}
        <div className="relative">
          <div className={`p-1 rounded-full ${
            hasStory 
              ? storyViewed 
                ? 'bg-gray-500' 
                : 'bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500'
              : ''
          }`}>
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={nickname} className={`w-28 h-28 rounded-full object-cover border-4 ${isLight ? 'border-white' : 'border-[#1a1a1a]'}`} />
            ) : (
              <div className={`w-28 h-28 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white text-4xl font-medium border-4 ${isLight ? 'border-white' : 'border-[#1a1a1a]'}`}>
                {nickname[0]?.toUpperCase()}
              </div>
            )}
          </div>
          {/* Add Story Button */}
          <button className={`absolute bottom-0 right-0 w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white border-2 hover:bg-cyan-600 transition-colors ${isLight ? 'border-white' : 'border-[#1a1a1a]'}`}>
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <h1 className={`text-2xl font-bold mb-1 ${isLight ? 'text-black' : 'text-white'}`}>{nickname}</h1>
          <p className={`mb-4 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>@{username} • {followers.length} followers • {following.length} following • 0 friends</p>
          
          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <Link to={createPageUrl('EditProfile')}>
              <button className={`px-4 py-1.5 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${isLight ? 'bg-gray-200 text-black hover:bg-gray-300' : 'bg-[#2a2a2a] text-white hover:bg-[#333]'}`}>
                <Settings className="w-4 h-4" />
                Edit Profile
              </button>
            </Link>
            <Link to={createPageUrl('Upload')}>
              <button className={`px-4 py-1.5 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${isLight ? 'bg-gray-200 text-black hover:bg-gray-300' : 'bg-[#2a2a2a] text-white hover:bg-[#333]'}`}>
                <Upload className="w-4 h-4" />
                Upload
              </button>
            </Link>
            <Link to={createPageUrl('Analytics')}>
              <button className={`px-4 py-1.5 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${isLight ? 'bg-gray-200 text-black hover:bg-gray-300' : 'bg-[#2a2a2a] text-white hover:bg-[#333]'}`}>
                <BarChart3 className="w-4 h-4" />
                Analytics
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content Tab Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.value
                ? isLight ? 'bg-gray-700 text-white' : 'bg-white text-black'
                : isLight ? 'bg-gray-200 text-black hover:bg-gray-300' : 'bg-[#2a2a2a] text-white hover:bg-[#333]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Divider line, spaced below buttons */}
      <div className={`h-px w-full mb-6 ${isLight ? 'bg-gray-200' : 'bg-gray-800'}`} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.data.length === 0 ? (
              <EmptyState type={tab.type} />
            ) : tab.type === 'video' ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {tab.data.map((item) => (
                  <ContentCard key={item.id} item={item} type={tab.type}>
                    <VideoCard video={item} size="small" />
                  </ContentCard>
                ))}
              </div>
            ) : tab.type === 'clip' ? (
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
                {tab.data.map((item) => (
                  <ContentCard key={item.id} item={item} type={tab.type}>
                    <ClipCard clip={item} />
                  </ContentCard>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {tab.data.map((item) => (
                  <ContentCard key={item.id} item={item} type={tab.type}>
                    <PostCard post={item} />
                  </ContentCard>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent className={isLight ? 'bg-white' : 'bg-[#2a2a2a] border-gray-700'}>
          <DialogHeader>
            <DialogTitle className={isLight ? 'text-black' : 'text-white'}>Delete Content</DialogTitle>
            <DialogDescription className={isLight ? 'text-gray-600' : 'text-gray-400'}>
              Are you sure you want to delete "{deleteDialog.item?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, item: null, type: '' })} className={isLight ? 'border-gray-300' : 'border-gray-600'}>
              Cancel
            </Button>
            <Button onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-600">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}