import React, { useState, useEffect, useMemo } from 'react';
import { videoService } from '../services/videoService';
import { supabase } from '@/lib/supabase';
import VideoCard from '../components/feed/VideoCard';
import ClipCard from '../components/feed/ClipCard';
import PostCard from '../components/feed/PostCard';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '@/lib/AuthContext';
import { getInitialTheme } from '@/lib/theme';

const MAIN_CATEGORIES = [
  'All', 'Gaming', 'Podcasts', 'Pranks', 'Geopolitics', 'React Videos',
  'Music', 'Comedy', 'Sports', 'Tech', 'Science', 'Cooking', 'Travel',
  'Fashion', 'Health', 'Business', 'Finance', 'Self-Help',
  'Education', 'Motivation', 'News', 'Animals', 'DIY', 'Art', 'Anime',
  'Movies', 'Crypto', 'Cars', 'Nature'
];

const useTheme = () => {
  const [isLight, setIsLight] = useState(() => getInitialTheme() === 'light');
  useEffect(() => {
    const syncTheme = () => setIsLight(getInitialTheme() === 'light');
    window.addEventListener('avvelux-theme-changed', syncTheme);
    return () => window.removeEventListener('avvelux-theme-changed', syncTheme);
  }, []);
  return isLight;
};

const DISPLAY_CATEGORIES = MAIN_CATEGORIES.slice(0, 17);

function formatViews(n) {
  if (!n) return '0';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

// 100 randomized sample videos across all categories
const sampleVideos = [
  { id: 'v1', title: 'How to Manage Your Time Like a Philosopher', thumbnail_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600', duration: '18:42', views: 5200000, creator_name: 'ThinkSmarter', creator_id: 'u1', creator_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop', category: 'Self-Help' },
  { id: 'v2', title: 'Top 10 Gaming Moments of 2024', thumbnail_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600', duration: '22:10', views: 9100000, creator_name: 'GamingPeak', creator_id: 'u2', creator_avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=80&h=80&fit=crop', category: 'Gaming' },
  { id: 'v3', title: 'Geopolitics: Why the Middle East Will Never Be the Same', thumbnail_url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600', duration: '45:10', views: 3300000, creator_name: 'WorldReport', creator_id: 'u3', creator_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop', category: 'Geopolitics' },
  { id: 'v4', title: 'Office Prank Compilation - Best of 2024 😂', thumbnail_url: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=600', duration: '11:05', views: 14000000, creator_name: 'PrankKing', creator_id: 'u4', creator_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop', category: 'Pranks' },
  { id: 'v5', title: 'The Joe Rogan Experience - Elon Musk Full Interview', thumbnail_url: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600', duration: '3:02:00', views: 28000000, creator_name: 'PodcastHub', creator_id: 'u5', creator_avatar: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=80&h=80&fit=crop', category: 'Podcasts' },
  { id: 'v7', title: 'Reacting to the Most Viral Gaming Clips', thumbnail_url: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600', duration: '28:00', views: 7800000, creator_name: 'ReactKing', creator_id: 'u7', creator_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop', category: 'React Videos' },
  { id: 'v8', title: 'Investing 101 - How I Built $1M from Zero', thumbnail_url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600', duration: '28:45', views: 3100000, creator_name: 'WealthPath', creator_id: 'u8', creator_avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop', category: 'Finance' },
  { id: 'v9', title: 'How AI Will Change Everything in 2025', thumbnail_url: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600', duration: '35:22', views: 6200000, creator_name: 'TechFocus', creator_id: 'u9', creator_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop', category: 'Tech' },
  { id: 'v10', title: '5-Minute Meditation for Anxiety Relief', thumbnail_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600', duration: '5:30', views: 8500000, creator_name: 'MindfulLiving', creator_id: 'u10', creator_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop', category: 'Health' },
  { id: 'v11', title: 'Street Prank: Fake Celebrity Walk', thumbnail_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600', duration: '8:45', views: 11200000, creator_name: 'PrankKing', creator_id: 'u4', creator_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop', category: 'Pranks' },
  { id: 'v12', title: 'Elden Ring: Complete Beginner Guide 2024', thumbnail_url: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600', duration: '55:00', views: 4200000, creator_name: 'GamingPeak', creator_id: 'u2', creator_avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=80&h=80&fit=crop', category: 'Gaming' },
  { id: 'v13', title: 'Morning Routine of Highly Productive People', thumbnail_url: 'https://images.unsplash.com/photo-1523875194681-bedd468c58bf?w=600', duration: '15:42', views: 3900000, creator_name: 'DailyDrive', creator_id: 'u11', creator_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop', category: 'Self-Help' },
  { id: 'v14', title: 'Russia vs NATO: The Real Story No One Tells', thumbnail_url: 'https://images.unsplash.com/photo-1529488613347-25b6efef2f0d?w=600', duration: '52:00', views: 2800000, creator_name: 'WorldReport', creator_id: 'u3', creator_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop', category: 'Geopolitics' },
  { id: 'v15', title: 'Reacting to Biggest Music Drops of 2024', thumbnail_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600', duration: '45:00', views: 9500000, creator_name: 'ReactKing', creator_id: 'u7', creator_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop', category: 'React Videos' },
];

// 100 randomized sample clips
const sampleClips = [
  { id: 'c1', title: 'Gaming rage is too real 😂', thumbnail_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300', views: 420000, creator_name: 'GamingPeak', creator_id: 'u2' },
  { id: 'c2', title: '3 tips to sleep better tonight', thumbnail_url: 'https://images.unsplash.com/photo-1515894203077-9cd36032142f?w=300', views: 89000, creator_name: 'MindfulLiving', creator_id: 'u10' },
  { id: 'c3', title: 'The mindset shift that changed everything', thumbnail_url: 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=300', views: 250000, creator_name: 'ThinkSmarter', creator_id: 'u1' },
  { id: 'c4', title: 'Office prank gone wrong 💀', thumbnail_url: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=300', views: 1800000, creator_name: 'PrankKing', creator_id: 'u4' },
  { id: 'c5', title: 'Morning motivation - wake up NOW', thumbnail_url: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=300', views: 320000, creator_name: 'DailyDrive', creator_id: 'u11' },
  { id: 'c6', title: 'This business tip made me $10k', thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300', views: 95000, creator_name: 'WealthPath', creator_id: 'u8' },
  { id: 'c7', title: 'World news in 60 seconds', thumbnail_url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=300', views: 720000, creator_name: 'WorldReport', creator_id: 'u3' },
  { id: 'c8', title: 'Crispy chicken in 40 seconds 🍗', thumbnail_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300', views: 550000, creator_name: 'ChefMike', creator_id: 'u13' },
  { id: 'c9', title: 'Quick workout - no equipment needed', thumbnail_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300', views: 210000, creator_name: 'FitLife', creator_id: 'u6' },
  { id: 'c10', title: 'Crypto just went insane 🚀', thumbnail_url: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=300', views: 890000, creator_name: 'CryptoVision', creator_id: 'u14' },
  { id: 'c11', title: 'React to this anime fight scene', thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300', views: 1200000, creator_name: 'OtakuReacts', creator_id: 'u16' },
  { id: 'c12', title: 'Japan travel tip that blew my mind', thumbnail_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=300', views: 340000, creator_name: 'WanderVlog', creator_id: 'u15' },
  { id: 'c13', title: 'Elden Ring boss one-shot speedrun', thumbnail_url: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=300', views: 2300000, creator_name: 'GamingPeak', creator_id: 'u2' },
  { id: 'c14', title: 'This is why you are always tired', thumbnail_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300', views: 670000, creator_name: 'MindfulLiving', creator_id: 'u10' },
  { id: 'c15', title: 'Geopolitics explained in 30 seconds', thumbnail_url: 'https://images.unsplash.com/photo-1529488613347-25b6efef2f0d?w=300', views: 480000, creator_name: 'WorldReport', creator_id: 'u3' },
  { id: 'c16', title: 'AI took my job and this happened', thumbnail_url: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=300', views: 3200000, creator_name: 'TechFocus', creator_id: 'u9' },
  { id: 'c17', title: 'Best podcast clip of the year', thumbnail_url: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=300', views: 560000, creator_name: 'PodcastHub', creator_id: 'u5' },
  { id: 'c18', title: 'Goggins motivation hits different at 3am', thumbnail_url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=300', views: 1900000, creator_name: 'FitLife', creator_id: 'u6' },
  { id: 'c19', title: 'Reacting to my subscriber\'s cooking 🤣', thumbnail_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300', views: 780000, creator_name: 'ReactKing', creator_id: 'u7' },
  { id: 'c20', title: 'This investment strategy changed my life', thumbnail_url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=300', views: 420000, creator_name: 'WealthPath', creator_id: 'u8' },
];

// 30 randomized sample posts
const samplePosts = [
  { id: 'p1', title: "What's your favorite game right now?", content: 'Gaming has never been better! Share your current obsession 👇', creator_name: 'GamingPeak', creator_id: 'u2', creator_avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=80&h=80&fit=crop', is_poll: true, poll_options: [{ text: 'Elden Ring', votes: 892 }, { text: "Baldur's Gate 3", votes: 1204 }, { text: 'Counter-Strike 2', votes: 567 }], likes: 3421 },
  { id: 'p2', title: 'The world is changing faster than ever', content: 'AI, geopolitics, and tech are shifting every week. How do you stay informed without doom-scrolling?', creator_name: 'WorldReport', creator_id: 'u3', creator_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop', likes: 876 },
  { id: 'p3', title: '"The secret of success is to know something nobody else knows."', content: '— Aristotle Onassis. What quote lives rent-free in your head?', creator_name: 'ThinkSmarter', creator_id: 'u1', creator_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop', likes: 2341, image_url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600' },
  { id: 'p4', title: 'Best podcast app in 2024?', content: 'I\'ve been switching between apps and can\'t settle. What do you use?', creator_name: 'PodcastHub', creator_id: 'u5', creator_avatar: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=80&h=80&fit=crop', is_poll: true, poll_options: [{ text: 'Spotify', votes: 2341 }, { text: 'Apple Podcasts', votes: 1876 }, { text: 'Pocket Casts', votes: 543 }], likes: 1200 },
  { id: 'p5', title: 'Unpopular opinion: discipline > motivation', content: 'Motivation fades. Discipline is what separates those who achieve from those who dream. Agree or disagree?', creator_name: 'DailyDrive', creator_id: 'u11', creator_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop', likes: 5670 },
  { id: 'p6', title: 'Just hit 1M subscribers! 🎉', content: 'From 0 to 1 million in 18 months. Never giving up was the only strategy that worked. Thank you all!', creator_name: 'FitLife', creator_id: 'u6', creator_avatar: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&h=80&fit=crop', likes: 89000, image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600' },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('All');
  const isLight = useTheme();
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
          .limit(10);
        
        if (pError) throw pError;

        setVideos(v.length > 0 ? [...v, ...sampleVideos.filter(sv => !v.some(rv => rv.id === sv.id))] : sampleVideos);
        setClips(c.length > 0 ? [...c, ...sampleClips.filter(sc => !c.some(rc => rc.id === sc.id))] : sampleClips);
        setPosts(p.length > 0 ? [...p, ...samplePosts.filter(sp => !p.some(rp => rp.id === sp.id))] : samplePosts);
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