import React, { useState, useEffect } from 'react';
import { auth } from '@/api/sdk';
import { LikedContent as LikedContentEntity } from '@/api/entities';
import { useQuery } from '@tanstack/react-query';
import EmptyState from '../components/common/EmptyState';

export default function LikedContent() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await auth.me();
        setUser(userData);
      } catch (e) {}
    };
    loadUser();
  }, []);

  const { data: likedContent = [] } = useQuery({
    queryKey: ['liked-content', user?.email],
    queryFn: () => user ? LikedContentEntity.filter({ created_by: user.email }) : [],
    enabled: !!user,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Liked Content</h1>
      
      {likedContent.length === 0 ? (
        <EmptyState type="video" message="No liked content yet" />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {/* Would need to fetch actual video data based on content_id */}
        </div>
      )}
    </div>
  );
}