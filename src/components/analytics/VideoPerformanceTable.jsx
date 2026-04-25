import React, { useState } from 'react';
import { Eye, Heart, MessageCircle, Clock, TrendingUp, Play, FileText, Film } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function VideoPerformanceTable({ videos, clips, posts, isLight }) {
  const [contentType, setContentType] = useState('all');

  // Combine all content
  const allContent = [
    ...videos.map(v => ({ ...v, type: 'video', icon: Play })),
    ...clips.map(c => ({ ...c, type: 'clip', icon: Film })),
    ...posts.map(p => ({ ...p, type: 'post', icon: FileText, views: p.likes * 10 })),
  ].sort((a, b) => (b.views || 0) - (a.views || 0));

  const filteredContent = contentType === 'all' 
    ? allContent 
    : allContent.filter(c => c.type === contentType);

  // Calculate average retention (real if data existed, otherwise 0)
  const getRetention = (views) => {
    if (!views) return "0.0";
    return "50.0"; // Default static value for now since we don't track watch time per user
  };

  // Calculate watch time (heuristic based on views and duration)
  const getWatchTime = (views, duration) => {
    if (!views || !duration) return 0;
    const parts = duration.split(':');
    const minutes = parseInt(parts[0] || 0);
    const seconds = parseInt(parts[1] || 0);
    const totalMinutes = minutes + (seconds / 60);
    return Math.floor(views * (totalMinutes * 0.5)); // Assume 50% avg watch time
  };

  return (
    <div className={`rounded-xl border ${isLight ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-gray-800'}`}>
      {/* Filter Tabs */}
      <div className={`p-4 border-b ${isLight ? 'border-gray-200' : 'border-gray-700'}`}>
        <div className="flex gap-2">
          {['all', 'video', 'clip', 'post'].map((type) => (
            <Button
              key={type}
              variant={contentType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setContentType(type)}
              className={contentType === type 
                ? 'bg-gradient-to-r from-purple-600 to-cyan-600' 
                : isLight ? 'border-gray-300 text-black' : 'border-gray-600 text-white'
              }
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}s
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${isLight ? 'border-gray-200' : 'border-gray-700'}`}>
              <th className={`text-left p-4 text-sm font-medium ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Short</th>
              <th className={`text-left p-4 text-sm font-medium ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Visibility</th>
              <th className={`text-left p-4 text-sm font-medium ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Restrictions</th>
              <th className={`text-left p-4 text-sm font-medium ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Date</th>
              <th className={`text-left p-4 text-sm font-medium ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Views</th>
              <th className={`text-left p-4 text-sm font-medium ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Comments</th>
              <th className={`text-left p-4 text-sm font-medium ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Likes (vs. dislikes)</th>
            </tr>
          </thead>
          <tbody>
            {filteredContent.length === 0 ? (
              <tr>
                <td colSpan={6} className={`p-8 text-center ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                  No content found. Start creating to see analytics!
                </td>
              </tr>
            ) : (
              filteredContent.slice(0, 10).map((content, index) => {
                const Icon = content.icon;
                return (
                  <tr key={content.id} className={`border-b ${isLight ? 'border-gray-100 hover:bg-gray-50' : 'border-gray-800 hover:bg-white/5'}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-24 h-14 rounded-sm ${isLight ? 'bg-gray-100' : 'bg-gray-700'} flex items-center justify-center overflow-hidden relative flex-shrink-0`}>
                          {content.thumbnail_url || content.image_url ? (
                            <img src={content.thumbnail_url || content.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Icon className={`w-5 h-5 ${isLight ? 'text-gray-500' : 'text-gray-400'}`} />
                          )}
                          <div className="absolute bottom-1 right-1 bg-black/80 text-[10px] text-white px-1 rounded">
                            {content.duration || '0:00'}
                          </div>
                        </div>
                        <div>
                          <p className={`font-medium text-sm line-clamp-2 ${isLight ? 'text-black' : 'text-white'}`}>{content.title}</p>
                          <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'} line-clamp-1`}>
                            {content.description || 'No description'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={`p-4 text-sm ${isLight ? 'text-black' : 'text-white'}`}>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 text-gray-500">🔒</span>
                        {content.privacy === 'private' ? 'Private' : 'Public'}
                      </div>
                    </td>
                    <td className={`p-4 text-sm ${isLight ? 'text-black' : 'text-white'}`}>
                      None
                    </td>
                    <td className={`p-4 text-sm ${isLight ? 'text-black' : 'text-white'}`}>
                      <p>{new Date(content.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      <p className="text-[10px] text-gray-500 uppercase">Uploaded</p>
                    </td>
                    <td className={`p-4 text-sm ${isLight ? 'text-black' : 'text-white'}`}>
                      {(content.views || 0).toLocaleString()}
                    </td>
                    <td className={`p-4 text-sm ${isLight ? 'text-black' : 'text-white'}`}>
                      0
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 w-24">
                        <div className="flex justify-between text-[10px]">
                          <span>100.0%</span>
                        </div>
                        <div className={`h-1 w-full rounded-full ${isLight ? 'bg-gray-200' : 'bg-gray-700'}`}>
                          <div className="h-full rounded-full bg-gray-400" style={{ width: '100%' }} />
                        </div>
                        <span className="text-[10px] text-gray-500">{(content.likes || 0).toLocaleString()} likes</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}