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

  // Calculate average retention (simulated)
  const getRetention = (views) => {
    const base = 45 + Math.random() * 30;
    return Math.min(95, base + (views > 1000 ? 10 : 0)).toFixed(1);
  };

  // Calculate watch time (simulated)
  const getWatchTime = (views, duration) => {
    const avgWatchMinutes = (parseFloat(duration?.split(':')[0] || 5) * 0.6);
    return Math.floor(views * avgWatchMinutes);
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
              <th className={`text-left p-4 text-sm font-medium ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Content</th>
              <th className={`text-left p-4 text-sm font-medium ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                <div className="flex items-center gap-1"><Eye className="w-4 h-4" /> Views</div>
              </th>
              <th className={`text-left p-4 text-sm font-medium ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> Watch Time</div>
              </th>
              <th className={`text-left p-4 text-sm font-medium ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                <div className="flex items-center gap-1"><TrendingUp className="w-4 h-4" /> Retention</div>
              </th>
              <th className={`text-left p-4 text-sm font-medium ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                <div className="flex items-center gap-1"><Heart className="w-4 h-4" /> Likes</div>
              </th>
              <th className={`text-left p-4 text-sm font-medium ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                <div className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> CTR</div>
              </th>
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
                        <div className={`w-12 h-12 rounded-lg ${isLight ? 'bg-gray-100' : 'bg-gray-700'} flex items-center justify-center overflow-hidden`}>
                          {content.thumbnail_url || content.image_url ? (
                            <img src={content.thumbnail_url || content.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Icon className={`w-5 h-5 ${isLight ? 'text-gray-500' : 'text-gray-400'}`} />
                          )}
                        </div>
                        <div>
                          <p className={`font-medium line-clamp-1 ${isLight ? 'text-black' : 'text-white'}`}>{content.title}</p>
                          <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                            {content.type.charAt(0).toUpperCase() + content.type.slice(1)} • {content.duration || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={`p-4 ${isLight ? 'text-black' : 'text-white'}`}>
                      {(content.views || 0).toLocaleString()}
                    </td>
                    <td className={`p-4 ${isLight ? 'text-black' : 'text-white'}`}>
                      {getWatchTime(content.views || 0, content.duration).toLocaleString()} min
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-16 h-2 rounded-full ${isLight ? 'bg-gray-200' : 'bg-gray-700'}`}>
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500" 
                            style={{ width: `${getRetention(content.views || 0)}%` }}
                          />
                        </div>
                        <span className={isLight ? 'text-black' : 'text-white'}>{getRetention(content.views || 0)}%</span>
                      </div>
                    </td>
                    <td className={`p-4 ${isLight ? 'text-black' : 'text-white'}`}>
                      {(content.likes || 0).toLocaleString()}
                    </td>
                    <td className={`p-4 ${isLight ? 'text-black' : 'text-white'}`}>
                      {((content.likes || 0) / Math.max(content.views || 1, 1) * 100).toFixed(1)}%
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