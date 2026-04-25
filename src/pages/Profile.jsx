import React, { useState, useEffect } from 'react';
import { Follow } from '@/api/entities';
import { videoService } from '../services/videoService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import VideoCard from '../components/feed/VideoCard';
import ClipCard from '../components/feed/ClipCard';
import PostCard from '../components/feed/PostCard';
import EmptyState from '../components/common/EmptyState';
import { UserPlus, UserCheck, Edit3 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useSearchParams, Link } from 'react-router-dom';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/AuthContext';

export default function Profile() {
  const { user: currentUserData } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Video');
  const { isLight } = useTheme();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const profileId = searchParams.get('id');

  useEffect(() => {
    const loadProfile = async () => {
      // If viewing own profile (no ID or own ID)
      if (!profileId || (currentUserData && profileId === currentUserData.id)) {
        setProfileUser(currentUserData);
        return;
      }

      // If viewing someone else's profile
      if (profileId) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', profileId)
            .single();
          
          if (error && (error.message?.includes('column') || error.message?.includes('schema cache'))) {
            // Retry with minimal columns if * failed
            const { data: retryData } = await supabase
              .from('profiles')
              .select('id, username, display_name, avatar_url')
              .eq('id', profileId)
              .single();
            if (retryData) setProfileUser(retryData);
            return;
          }
          
          if (data) {
            setProfileUser(data);
          } else {
            setProfileUser({ id: profileId, display_name: 'User', username: '@user' });
          }
        } catch (e) {
          setProfileUser({ id: profileId, display_name: 'User', username: '@user' });
        }
      }
    };
    loadProfile();
  }, [profileId, currentUserData]);

  const currentUser = currentUserData;

  const { data: profileVideos = [] } = useQuery({
    queryKey: ['profile-videos', profileId],
    queryFn: () => profileId ? Video.filter({ user_id: profileId }) : [],
    enabled: !!profileId,
  });

  const { data: followers = [] } = useQuery({
    queryKey: ['profile-followers', profileId],
    queryFn: () => profileId ? Follow.filter({ following_id: profileId }) : [],
    enabled: !!profileId,
  });

  const { data: following = [] } = useQuery({
    queryKey: ['profile-following', profileId],
    queryFn: () => profileId ? Follow.filter({ follower_id: profileId }) : [],
    enabled: !!profileId,
  });

  const { data: videos = [] } = useQuery({
    queryKey: ['profile-videos', profileId, currentUser?.id],
    queryFn: () => profileId ? videoService.getVideosByUser(profileId, currentUser?.id) : [],
    enabled: !!profileId,
  });

  const { data: clips = [] } = useQuery({
    queryKey: ['profile-clips', profileId, currentUser?.id],
    queryFn: () => profileId ? videoService.getClipsByUser(profileId, currentUser?.id) : [],
    enabled: !!profileId,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['profile-posts', profileId, currentUser?.id],
    queryFn: () => profileId ? videoService.getPostsByUser(profileId, currentUser?.id) : [],
    enabled: !!profileId,
  });

  const isFollowing = currentUser && followers.some(f => f.follower_id === currentUser.id);

  const followMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        const existingFollow = followers.find(f => f.follower_id === currentUser.id);
        if (existingFollow) {
          await Follow.delete(existingFollow.id);
        }
      } else {
        await Follow.create({
          follower_id: currentUser.id,
          following_id: profileId,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-followers', profileId] });
      toast.success(isFollowing ? 'Unfollowed' : 'Following');
    },
  });

  const tabs = [
    { value: 'Video', label: 'Video', data: videos, type: 'video' },
    { value: 'Clips', label: 'Clips', data: clips, type: 'clip' },
    { value: 'Posts', label: 'Posts', data: posts, type: 'post' },
  ];

  const nickname = profileUser?.display_name || 'User';
  const username = profileUser?.username || (profileUser?.email ? `@${profileUser.email.split('@')[0]}` : '@user');

  if (!profileUser) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className={isLight ? 'text-gray-600' : 'text-gray-400'}>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Profile Header */}
      <div className="flex items-start gap-8 mb-8 mt-4">
        {/* Profile Picture */}
        <div className="relative">
          {profileUser.avatar_url ? (
            <img 
              src={profileUser.avatar_url} 
              alt={nickname} 
              className={`w-28 h-28 rounded-full border-4 object-cover ${isLight ? 'border-white' : 'border-[#1a1a1a]'}`} 
            />
          ) : (
            <div className={`w-28 h-28 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white text-4xl font-medium border-4 ${isLight ? 'border-white' : 'border-[#1a1a1a]'}`}>
              {nickname[0]?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-1">
            <h1 className={`text-2xl font-bold ${isLight ? 'text-black' : 'text-white'}`}>{profileUser.display_name || nickname}</h1>
            
            {/* Edit Profile Button - only show if viewing own profile */}
            {currentUser && currentUser.id === profileUser.id && (
              <Link to="/EditProfile">
                <Button variant="outline" size="sm" className="h-8 gap-2">
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Profile
                </Button>
              </Link>
            )}
          </div>
          
          <p className={`mb-3 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            {username} • {followers.length} followers • {profileVideos.length} videos
          </p>
          
          {profileUser.bio && (
            <p className={`text-sm mb-4 max-w-lg ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>{profileUser.bio}</p>
          )}

          {/* Follow Button - only show if not viewing own profile */}
          {currentUser && currentUser.id !== profileUser.id && (
            <div className="mb-4">
              <Button 
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isPending}
                className={isFollowing 
                  ? (isLight ? 'bg-gray-200 text-black hover:bg-gray-300' : 'bg-gray-700 text-white hover:bg-gray-600')
                  : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:opacity-90'
                }
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.data.length === 0 ? (
              <EmptyState type={tab.type} />
            ) : tab.type === 'video' ? (
              <div className="grid grid-cols-4 gap-4">
                {tab.data.map((item) => (
                  <VideoCard key={item.id} video={item} size="small" />
                ))}
              </div>
            ) : tab.type === 'clip' ? (
              <div className="grid grid-cols-6 gap-3">
                {tab.data.map((item) => (
                  <ClipCard key={item.id} clip={item} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {tab.data.map((item) => (
                  <PostCard key={item.id} post={item} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}