import React, { useState, useEffect } from 'react';
import { Video, Clip, Post, User as UserEntity } from '@/api/entities';
import { Core } from '@/api/integrations';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, SlidersHorizontal, X, Sparkles, Play, Film, FileText, Clock, TrendingUp, User } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import VideoCard from '../components/feed/VideoCard';
import ClipCard from '../components/feed/ClipCard';
import PostCard from '../components/feed/PostCard';
import { createPageUrl } from '../utils';

const CONTENT_TYPES = ['All', 'Videos', 'Clips', 'Posts', 'Accounts'];
const DURATION_FILTERS = ['Any', 'Under 5 min', '5-15 min', '15-30 min', 'Over 30 min'];
const SORT_OPTIONS = ['Most Relevant', 'Most Recent', 'Most Popular', 'Most Liked'];

// Sample creator accounts for search
const SAMPLE_ACCOUNTS = [
  { id: 'u1', full_name: 'ThinkSmarter', email: 'think@avvelux.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop', category: 'Self-Help', followers: 1200000 },
  { id: 'u2', full_name: 'GamingPeak', email: 'gaming@avvelux.com', avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=80&h=80&fit=crop', category: 'Gaming', followers: 3400000 },
  { id: 'u3', full_name: 'WorldReport', email: 'world@avvelux.com', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop', category: 'Geopolitics', followers: 890000 },
  { id: 'u4', full_name: 'PrankKing', email: 'prank@avvelux.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop', category: 'Pranks', followers: 5600000 },
  { id: 'u5', full_name: 'PodcastHub', email: 'pod@avvelux.com', avatar: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=80&h=80&fit=crop', category: 'Podcasts', followers: 2100000 },
  { id: 'u7', full_name: 'ReactKing', email: 'react@avvelux.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop', category: 'React Videos', followers: 2900000 },
  { id: 'u8', full_name: 'WealthPath', email: 'wealth@avvelux.com', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop', category: 'Finance', followers: 760000 },
  { id: 'u9', full_name: 'TechFocus', email: 'tech@avvelux.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop', category: 'Tech', followers: 1300000 },
  { id: 'u10', full_name: 'MindfulLiving', email: 'mindful@avvelux.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop', category: 'Health', followers: 940000 },
];

function formatFollowers(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [contentType, setContentType] = useState('All');
  const [duration, setDuration] = useState('Any');
  const [sortBy, setSortBy] = useState('Most Relevant');
  const [isSearching, setIsSearching] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [theme, setTheme] = useState('system');

  useEffect(() => {
    setTheme(localStorage.getItem('avvelux-theme') || 'system');
  }, []);

  const isLight = theme === 'light';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) { setQuery(q); setSearchQuery(q); performSearch(q); }
  }, []);

  const { data: videos = [] } = useQuery({
    queryKey: ['search-videos'],
    queryFn: () => Video.list('-created_date', 100),
  });

  const { data: clips = [] } = useQuery({
    queryKey: ['search-clips'],
    queryFn: () => Clip.list('-created_date', 100),
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['search-posts'],
    queryFn: () => Post.list('-created_date', 100),
  });

  const { data: dbUsers = [] } = useQuery({
    queryKey: ['search-users'],
    queryFn: () => UserEntity.list(),
  });

  const allAccounts = dbUsers.length > 0 ? dbUsers : SAMPLE_ACCOUNTS;

  const performSearch = async (searchText) => {
    if (!searchText.trim()) return;
    setIsSearching(true);
    setSearchQuery(searchText);
    try {
      const response = await Core.InvokeLLM({
        prompt: `You are a content search assistant. The user is searching for: "${searchText}"
Analyze this search query and return related keywords and content type:
{
  "intent": "main topic",
  "keywords": ["keyword1", "keyword2"],
  "recommended_type": "video|clip|post|account|all",
  "description": "brief description"
}`,
        response_json_schema: {
          type: "object",
          properties: {
            intent: { type: "string" },
            keywords: { type: "array", items: { type: "string" } },
            recommended_type: { type: "string" },
            description: { type: "string" }
          }
        }
      });
      setAiResults(response);
    } catch (e) {}
    setIsSearching(false);
  };

  const handleSearch = (e) => { e.preventDefault(); performSearch(query); };

  const matchScore = (item, fields) => {
    if (!searchQuery) return 1;
    const kws = aiResults?.keywords || [searchQuery.toLowerCase()];
    const text = fields.map(f => (item[f] || '').toLowerCase()).join(' ');
    return kws.some(kw => text.includes(kw.toLowerCase())) || text.includes(searchQuery.toLowerCase()) ? 1 : 0;
  };

  const filterByDuration = (items) => {
    if (duration === 'Any') return items;
    return items.filter(item => {
      if (!item.duration) return true;
      const mins = parseInt((item.duration.split(':')[0]) || 0);
      if (duration === 'Under 5 min') return mins < 5;
      if (duration === '5-15 min') return mins >= 5 && mins < 15;
      if (duration === '15-30 min') return mins >= 15 && mins < 30;
      if (duration === 'Over 30 min') return mins >= 30;
      return true;
    });
  };

  const sortContent = (items) => {
    const s = [...items];
    if (sortBy === 'Most Recent') return s.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    if (sortBy === 'Most Popular') return s.sort((a, b) => (b.views || 0) - (a.views || 0));
    if (sortBy === 'Most Liked') return s.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    return s;
  };

  const filteredVideos = sortContent(filterByDuration(videos.filter(v => matchScore(v, ['title', 'description', 'category']))));
  const filteredClips = sortContent(filterByDuration(clips.filter(c => matchScore(c, ['title', 'description', 'category']))));
  const filteredPosts = sortContent(posts.filter(p => matchScore(p, ['title', 'content', 'category'])));
  const filteredAccounts = allAccounts.filter(u => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (u.full_name || '').toLowerCase().includes(q) || (u.category || '').toLowerCase().includes(q);
  });

  const showVideos = contentType === 'All' || contentType === 'Videos';
  const showClips = contentType === 'All' || contentType === 'Clips';
  const showPosts = contentType === 'All' || contentType === 'Posts';
  const showAccounts = contentType === 'All' || contentType === 'Accounts';

  const totalResults = (showVideos ? filteredVideos.length : 0) + (showClips ? filteredClips.length : 0) + (showPosts ? filteredPosts.length : 0) + (showAccounts ? filteredAccounts.length : 0);

  const text = isLight ? 'text-black' : 'text-white';
  const muted = isLight ? 'text-gray-500' : 'text-gray-400';
  const cardBg = isLight ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-gray-800';

  return (
    <div className="max-w-6xl mx-auto">
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <SearchIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${muted}`} />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search videos, clips, posts, accounts..."
              className={`pl-12 pr-4 py-6 text-lg rounded-xl ${isLight ? 'bg-white border-gray-300' : 'bg-[#2a2a2a] border-gray-700'}`}
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); setSearchQuery(''); setAiResults(null); }}
                className={`absolute right-4 top-1/2 -translate-y-1/2 ${muted}`}>
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <Button type="submit" disabled={isSearching} className="px-6 bg-gradient-to-r from-purple-600 to-cyan-600">
            {isSearching ? <Sparkles className="w-5 h-5 animate-pulse" /> : <Sparkles className="w-5 h-5" />}
            <span className="hidden sm:inline ml-2">{isSearching ? 'Searching...' : 'Search'}</span>
          </Button>
          <Button type="button" variant="outline" onClick={() => setShowFilters(!showFilters)} className={isLight ? 'border-gray-300' : 'border-gray-700'}>
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </form>

      {showFilters && (
        <div className={`p-4 rounded-xl mb-6 border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#2a2a2a] border-gray-800'}`}>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className={`text-sm mb-1.5 block ${muted}`}>Content Type</label>
              <div className="flex flex-wrap gap-2">
                {CONTENT_TYPES.map(type => (
                  <Button key={type} size="sm" variant={contentType === type ? 'default' : 'outline'}
                    onClick={() => setContentType(type)}
                    className={contentType === type ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white border-0' : ''}>
                    {type === 'Videos' && <Play className="w-3 h-3 mr-1" />}
                    {type === 'Clips' && <Film className="w-3 h-3 mr-1" />}
                    {type === 'Posts' && <FileText className="w-3 h-3 mr-1" />}
                    {type === 'Accounts' && <User className="w-3 h-3 mr-1" />}
                    {type}
                  </Button>
                ))}
              </div>
            </div>
            {contentType !== 'Accounts' && (
              <>
                <div>
                  <label className={`text-sm mb-1.5 block ${muted}`}>Duration</label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className={`w-40 ${isLight ? 'bg-white border-gray-300' : 'bg-[#1a1a1a] border-gray-700'}`}>
                      <Clock className="w-4 h-4 mr-2" /><SelectValue />
                    </SelectTrigger>
                    <SelectContent className={isLight ? 'bg-white' : 'bg-[#2a2a2a]'}>
                      {DURATION_FILTERS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className={`text-sm mb-1.5 block ${muted}`}>Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className={`w-44 ${isLight ? 'bg-white border-gray-300' : 'bg-[#1a1a1a] border-gray-700'}`}>
                      <TrendingUp className="w-4 h-4 mr-2" /><SelectValue />
                    </SelectTrigger>
                    <SelectContent className={isLight ? 'bg-white' : 'bg-[#2a2a2a]'}>
                      {SORT_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {aiResults && searchQuery && (
        <div className={`p-4 rounded-xl mb-6 border ${isLight ? 'bg-purple-50 border-purple-200' : 'bg-purple-900/20 border-purple-800'}`}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className={`text-sm ${isLight ? 'text-purple-800' : 'text-purple-200'}`}>
                <span className="font-medium">AI:</span> {aiResults.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {aiResults.keywords?.slice(0, 5).map((kw, i) => (
                  <Badge key={i} variant="secondary" className={isLight ? 'bg-purple-100 text-purple-700' : 'bg-purple-800/50 text-purple-200'}>{kw}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {searchQuery && (
        <p className={`mb-4 text-sm ${muted}`}>
          Found <span className={`font-semibold ${text}`}>{totalResults}</span> results for "{searchQuery}"
        </p>
      )}

      {/* Accounts */}
      {showAccounts && searchQuery && filteredAccounts.length > 0 && (
        <div className="mb-8">
          <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${text}`}>
            <User className="w-5 h-5" /> Accounts ({filteredAccounts.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredAccounts.slice(0, 9).map(account => (
              <Link key={account.id} to={createPageUrl(`Profile?id=${account.id}`)}
                className={`flex items-center gap-3 p-4 rounded-xl border hover:border-purple-500 transition-colors ${cardBg}`}>
                {account.avatar || account.creator_avatar ? (
                  <img src={account.avatar || account.creator_avatar} alt={account.full_name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {(account.full_name || '?')[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold truncate ${text}`}>{account.full_name}</p>
                  <p className={`text-xs ${muted}`}>{account.category || 'Creator'}</p>
                  {account.followers && <p className="text-purple-400 text-xs">{formatFollowers(account.followers)} followers</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Videos */}
      {showVideos && filteredVideos.length > 0 && (
        <div className="mb-8">
          <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${text}`}>
            <Play className="w-5 h-5" /> Videos ({filteredVideos.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVideos.slice(0, 9).map(video => <VideoCard key={video.id} video={video} />)}
          </div>
        </div>
      )}

      {/* Clips */}
      {showClips && filteredClips.length > 0 && (
        <div className="mb-8">
          <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${text}`}>
            <Film className="w-5 h-5" /> Clips ({filteredClips.length})
          </h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
            {filteredClips.slice(0, 16).map(clip => <ClipCard key={clip.id} clip={clip} compact />)}
          </div>
        </div>
      )}

      {/* Posts */}
      {showPosts && filteredPosts.length > 0 && (
        <div className="mb-8">
          <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${text}`}>
            <FileText className="w-5 h-5" /> Posts ({filteredPosts.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPosts.slice(0, 9).map(post => <PostCard key={post.id} post={post} />)}
          </div>
        </div>
      )}

      {searchQuery && totalResults === 0 && (
        <div className={`text-center py-16 ${muted}`}>
          <SearchIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className={`text-lg ${text}`}>No results for "{searchQuery}"</p>
          <p className="text-sm mt-2">Try different keywords or adjust filters</p>
        </div>
      )}

      {!searchQuery && (
        <div className={`text-center py-16 ${muted}`}>
          <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className={`text-xl font-medium ${text}`}>AI-Powered Search</p>
          <p className="mt-2 text-sm">Search for videos, clips, posts, or creator accounts</p>
        </div>
      )}
    </div>
  );
}