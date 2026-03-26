import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ListVideo, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import EmptyState from '../components/common/EmptyState';

export default function Playlists() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {}
    };
    loadUser();
  }, []);

  const { data: playlists = [] } = useQuery({
    queryKey: ['playlists', user?.email],
    queryFn: () => user ? base44.entities.Playlist.filter({ created_by: user.email }, '-created_date') : [],
    enabled: !!user,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Playlists</h1>
        <Button className="bg-gradient-to-r from-purple-600 to-cyan-600">
          <Plus className="w-4 h-4 mr-2" />
          New Playlist
        </Button>
      </div>

      {playlists.length === 0 ? (
        <EmptyState type="playlist" message="No playlists yet" />
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="bg-[#2a2a2a] rounded-xl overflow-hidden border border-gray-800">
              <div className="aspect-video bg-gray-800 flex items-center justify-center">
                <ListVideo className="w-12 h-12 text-gray-600" />
              </div>
              <div className="p-3">
                <h3 className="text-white font-medium">{playlist.name}</h3>
                <p className="text-gray-400 text-sm">{playlist.video_ids?.length || 0} videos</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}