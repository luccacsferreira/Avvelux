import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Send, History, ChevronDown } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import VideoCard from '../components/feed/VideoCard';
import { useAuth } from '@/lib/AuthContext';

export default function TuneFeed() {
  const { user, updateUser } = useAuth();
  const [theme, setTheme] = useState('night');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedPreferences, setFeedPreferences] = useState(null);
  const [feedHistory, setFeedHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setTheme(localStorage.getItem('avvelux-theme') || 'system');
  }, []);

  const isLight = theme === 'light';

  useEffect(() => {
    if (user) {
      if (user.feed_preferences) {
        setFeedPreferences(user.feed_preferences);
      }
      if (user.feed_history) {
        setFeedHistory(user.feed_history);
      }
    }
  }, [user]);

  const { data: allVideos = [] } = useQuery({
    queryKey: ['tune-feed-videos'],
    queryFn: () => base44.entities.Video.list('-views', 50),
  });

  // Algorithm: 3 out of 4 videos match preferences, 1 is randomized discovery
  const getRecommendedVideos = () => {
    if (!feedPreferences?.keywords?.length) {
      return allVideos.slice(0, 8);
    }
    const matching = allVideos.filter(v => {
      const text = `${v.title || ''} ${v.description || ''} ${v.category || ''}`.toLowerCase();
      return feedPreferences.keywords.some(kw => text.includes(kw.toLowerCase()));
    });
    const nonMatching = allVideos.filter(v => !matching.includes(v));
    const take = 8;
    // 3 out of 4 = 75% matching, 1 out of 4 = 25% discovery
    const matchCount = Math.ceil(take * 3 / 4);
    return [
      ...matching.slice(0, matchCount),
      ...nonMatching.slice(0, take - matchCount),
    ];
  };

  const recommendedVideos = getRecommendedVideos();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    setIsProcessing(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `The user wants to tune their content feed. They said: "${message}"

Current preferences: ${feedPreferences ? JSON.stringify(feedPreferences.keywords) : 'none'}

IMPORTANT: Do not replace existing preferences — ADD to them. If the user says "more fitness", keep existing categories and add fitness keywords.

Return:
{
  "keywords": ["existing keywords...", "new keyword1", "new keyword2"],
  "categories": ["category1"],
  "description": "Short 1-sentence summary of what the feed will now show"
}`,
        response_json_schema: {
          type: "object",
          properties: {
            keywords: { type: "array", items: { type: "string" } },
            categories: { type: "array", items: { type: "string" } },
            description: { type: "string" }
          }
        }
      });

      const newPreferences = {
        ...response,
        timestamp: new Date().toISOString(),
        userMessage: message
      };

      setFeedPreferences(newPreferences);

      // Save to history
      const newHistory = [newPreferences, ...feedHistory].slice(0, 10);
      setFeedHistory(newHistory);

      // Save to user
      await updateUser({
        feed_preferences: newPreferences,
        feed_history: newHistory
      });

      setMessage('');
    } catch (error) {
      console.error('Error tuning feed:', error);
    }

    setIsProcessing(false);
  };

  const restoreVersion = async (version) => {
    setFeedPreferences(version);
    await updateUser({
      feed_preferences: version
    });
    setShowHistory(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* History Button */}
      <div className="flex justify-end mb-4">
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setShowHistory(!showHistory)}
            className={isLight ? 'border-gray-300 text-black' : 'bg-[#333] border-[#333] text-gray-300 hover:bg-[#3a3a3a] hover:border-[#3a3a3a]'}
          >
            <History className="w-4 h-4 mr-2" />
            Feed History
            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
          </Button>

          {showHistory && (
            <div className={`absolute right-0 top-full mt-2 w-80 rounded-xl border shadow-xl z-50 max-h-80 overflow-y-auto ${
              isLight ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-gray-700'
            }`}>
              {feedHistory.length === 0 ? (
                <p className={`p-4 text-center ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>No history yet</p>
              ) : (
                feedHistory.map((version, i) => (
                  <button
                    key={i}
                    onClick={() => restoreVersion(version)}
                    className={`w-full p-3 text-left border-b last:border-b-0 ${isLight ? 'border-gray-100 hover:bg-gray-50' : 'border-gray-700 hover:bg-white/5'}`}
                  >
                    <p className={`text-sm font-medium truncate ${isLight ? 'text-black' : 'text-white'}`}>{version.userMessage}</p>
                    <p className={`text-xs mt-1 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                      {new Date(version.timestamp).toLocaleDateString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant Section */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className={`text-2xl font-bold mb-3 ${isLight ? 'text-black' : 'text-white'}`}>Tune Your Feed</h1>
        <p className={`max-w-md mx-auto ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
          Tell me what kind of content you want to see more of on your feed. I'll personalize your recommendations based on your interests, goals, and preferences.
        </p>
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="mb-12">
        <div className="relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g., I want to see more fitness content and productivity tips..."
            className={`pr-12 py-6 text-lg rounded-xl ${isLight ? 'bg-white border-gray-300' : 'bg-[#2a2a2a] border-gray-700'}`}
            disabled={isProcessing}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || isProcessing}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-cyan-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>

      {/* Current Preferences */}
      {feedPreferences && (
        <div className={`p-4 rounded-xl mb-8 ${isLight ? 'bg-purple-50 border border-purple-200' : 'bg-purple-900/20 border border-purple-800'}`}>
          <p className={`text-sm font-medium mb-2 ${isLight ? 'text-purple-800' : 'text-purple-200'}`}>
            Current Feed Preferences:
          </p>
          <p className={isLight ? 'text-purple-700' : 'text-purple-300'}>{feedPreferences.description}</p>
        </div>
      )}

      {/* Recommended Videos */}
      <div>
        <h2 className={`text-lg font-semibold mb-2 ${isLight ? 'text-black' : 'text-white'}`}>
          Recommended For You
        </h2>
        <p className={`text-xs mb-4 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
          3 out of 4 videos match your preferences · 1 is a discovery pick
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendedVideos.slice(0, 4).map(video => (
            <VideoCard key={video.id} video={video} size="small" />
          ))}
        </div>
        {recommendedVideos.length === 0 && (
          <p className={`text-center py-8 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
            No videos found matching your preferences
          </p>
        )}
      </div>
    </div>
  );
}