import React, { useState, useEffect, useMemo } from 'react';
import { videoService } from '../services/videoService';
import { supabase } from '@/lib/supabase';
import VideoCard from '../components/feed/VideoCard';
import ClipCard from '../components/feed/ClipCard';
import PostCard from '../components/feed/PostCard';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/theme';

const MAIN_CATEGORIES = [
  'All', 'Gaming', 'Podcasts', 'Pranks', 'Geopolitics', 'React Videos',
  'Music', 'Comedy', 'Sports', 'Tech', 'Science', 'Cooking', 'Travel',
  'Fashion', 'Health', 'Business', 'Finance', 'Self-Help',
  'Education', 'Motivation', 'News', 'Animals', 'DIY', 'Art', 'Anime',
  'Movies', 'Crypto', 'Cars', 'Nature'
];

// Display categories
const DISPLAY_CATEGORIES = MAIN_CATEGORIES.slice(0, 17);

function formatViews(n) {
  if (!n) return '0';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('All');
  const { isLight } = useTheme();
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [clips, setClips] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [v, c] = await Promise.all([
          videoService.getVideos(activeCategory),
          videoService.getClips(20)
        ]);
        
        // Fetch posts from Supabase
        const { data: p, error: pError } = await supabase
          .from('posts')
          .select('*')
          .eq('privacy', 'public') // Only show public posts in general feeds
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (pError) throw pError;

        console.log('Home Feed Data:', { videos: v?.length, clips: c?.length, posts: p?.length });

        setVideos(v || []);
        setClips(c || []);
        setPosts(p || []);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [activeCategory]);

  const text = isLight ? 'text-black' : 'text-white';

  // Apply Tune Feed preferences
  const tunedVideos = useMemo(() => {
    if (!user?.feed_preferences?.keywords?.length) return videos;
    
    const keywords = user.feed_preferences.keywords;
    return [...videos].sort((a, b) => {
      const aText = `${a.title || ''} ${a.description || ''} ${a.category || ''}`.toLowerCase();
      const bText = `${b.title || ''} ${b.description || ''} ${b.category || ''}`.toLowerCase();
      
      const aMatches = keywords.filter(kw => aText.includes(kw.toLowerCase())).length;
      const bMatches = keywords.filter(kw => bText.includes(kw.toLowerCase())).length;
      
      return bMatches - aMatches;
    });
  }, [videos, user]);

  // Filter by active category
  const filteredVideos = useMemo(() => {
    if (activeCategory === 'All') return tunedVideos;
    return tunedVideos.filter(v => v.category?.toLowerCase().includes(activeCategory.toLowerCase()) || v.title?.toLowerCase().includes(activeCategory.toLowerCase()));
  }, [tunedVideos, activeCategory]);

  const filteredClips = useMemo(() => {
    if (activeCategory === 'All') return clips;
    return clips.filter(c => c.category?.toLowerCase().includes(activeCategory.toLowerCase()) || c.title?.toLowerCase().includes(activeCategory.toLowerCase()));
  }, [clips, activeCategory]);

  const filteredPosts = useMemo(() => {
    if (activeCategory === 'All') return posts;
    return posts.filter(p => p.category?.toLowerCase().includes(activeCategory.toLowerCase()) || p.content?.toLowerCase().includes(activeCategory.toLowerCase()));
  }, [posts, activeCategory]);

  // Category tabs — horizontal scroll on all devices
  const CategoryTabs = () => (
    <div className="mb-6">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent">
        <div className="flex gap-2 pb-3 w-max">
          {DISPLAY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? isLight ? 'bg-gray-700 text-white' : 'bg-white text-black'
                  : isLight ? 'bg-gray-200 text-black hover:bg-gray-300' : 'bg-[#2a2a2a] text-white hover:bg-[#333]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Clips row: 4 on mobile (no scroll), horizontal scroll on tablet, grid on desktop
  const ClipsRow = ({ rowClips }) => (
    <div className="mb-6">
      <h2 className={`text-lg font-semibold mb-3 ${text}`}>Clips</h2>
      {/* Mobile: exactly 4 in a row */}
      <div className="grid grid-cols-4 gap-1.5 md:hidden">
        {rowClips.slice(0, 4).map((clip) => (
          <ClipCard key={clip.id} clip={clip} compact hideCreator />
        ))}
      </div>
      {/* Tablet: horizontal scroll */}
      <div className="hidden md:flex lg:hidden gap-2 overflow-x-auto scrollbar-hide">
        {rowClips.slice(0, 8).map((clip) => (
          <div key={clip.id} className="flex-shrink-0 w-28">
            <ClipCard clip={clip} compact hideCreator />
          </div>
        ))}
      </div>
      {/* Desktop: fill width grid with fixed columns */}
      <div className="hidden lg:grid grid-cols-8 gap-3">
        {rowClips.slice(0, 8).map((clip) => (
          <ClipCard key={clip.id} clip={clip} compact hideCreator />
        ))}
      </div>
    </div>
  );

  // Posts row: 1 column on mobile (no overflow), 2 col tablet, 3 col desktop
  const PostsRow = ({ rowPosts }) => (
    <div className="mb-6">
      <h2 className={`text-lg font-semibold mb-3 ${text}`}>Posts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {rowPosts.map((post) => <PostCard key={post.id} post={post} />)}
      </div>
    </div>
  );

  const renderFeed = () => {
    const sections = [];
    let videoIndex = 0;
    let clipIndex = 0;
    let postIndex = 0;
    // Pattern: 3 videos, clips, 3 videos, posts, 3 videos, clips — repeating
    const pattern = ['videos3', 'clips', 'videos3', 'posts', 'videos3', 'clips'];
    let sectionNum = 0;

    while (sectionNum < 30) {
      const current = pattern[sectionNum % pattern.length];

      if (current === 'videos3') {
        const rowVideos = filteredVideos.slice(videoIndex, videoIndex + 3);
        if (rowVideos.length > 0) {
          sections.push(
            <div key={`v-${sectionNum}`} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {rowVideos.map((v) => <VideoCard key={v.id} video={v} />)}
            </div>
          );
          videoIndex += 3;
        }
      } else if (current === 'clips') {
        const rowClips = filteredClips.slice(clipIndex, clipIndex + 8);
        if (rowClips.length > 0) {
          sections.push(<ClipsRow key={`cl-${sectionNum}`} rowClips={rowClips} />);
          clipIndex += 8;
        }
      } else if (current === 'posts') {
        const rowPosts = filteredPosts.slice(postIndex, postIndex + 3);
        if (rowPosts.length > 0) {
          sections.push(<PostsRow key={`po-${sectionNum}`} rowPosts={rowPosts} />);
          postIndex += 3;
        }
      }

      // If we've exhausted all content, stop
      if (videoIndex >= filteredVideos.length && clipIndex >= filteredClips.length && postIndex >= filteredPosts.length) break;
      sectionNum++;
    }
    return sections;
  };

  return (
    <div>
      <CategoryTabs />
      {filteredVideos.length === 0 && filteredClips.length === 0 ? (
        <EmptyState type="video" message={`No ${activeCategory} content yet`} />
      ) : (
        renderFeed()
      )}
    </div>
  );
}