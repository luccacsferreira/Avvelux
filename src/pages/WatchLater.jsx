import React, { useState, useEffect } from 'react';
import { apiClient as base44 } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import EmptyState from '../components/common/EmptyState';

export default function WatchLater() {
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

  const { data: watchLater = [] } = useQuery({
    queryKey: ['watch-later', user?.email],
    queryFn: () => user ? base44.entities.WatchLater.filter({ created_by: user.email }) : [],
    enabled: !!user,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Watch Later</h1>
      
      {watchLater.length === 0 ? (
        <EmptyState type="video" message="No videos saved for later" />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {/* Would need to fetch actual video data based on content_id */}
        </div>
      )}
    </div>
  );
}