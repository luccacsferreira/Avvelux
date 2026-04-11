import React, { useState, useEffect } from 'react';
import { auth } from '@/api/sdk';
import { Wishlist } from '@/api/entities';
import { useQuery } from '@tanstack/react-query';
import EmptyState from '../components/common/EmptyState';

export default function Wishlists() {
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

  const { data: wishlists = [] } = useQuery({
    queryKey: ['wishlists', user?.email],
    queryFn: () => user ? Wishlist.filter({ created_by: user.email }, '-created_date') : [],
    enabled: !!user,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Wishlists</h1>

      {wishlists.length === 0 ? (
        <EmptyState type="video" message="No items in wishlist yet" />
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {/* Would need to fetch actual product/service data based on item_id */}
        </div>
      )}
    </div>
  );
}