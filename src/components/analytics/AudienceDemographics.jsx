import React from 'react';
import { Users } from 'lucide-react';

export default function AudienceDemographics({ isLight, followers }) {
  if (!followers || followers.length === 0) {
    return (
      <div className={`col-span-2 rounded-xl p-12 border text-center ${isLight ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-gray-800'}`}>
        <Users className={`w-12 h-12 mx-auto mb-4 ${isLight ? 'text-gray-300' : 'text-gray-600'}`} />
        <h3 className={`text-lg font-semibold mb-2 ${isLight ? 'text-black' : 'text-white'}`}>No Audience Data Yet</h3>
        <p className={isLight ? 'text-gray-600' : 'text-gray-400'}>Follower demographics will appear here once you build your community.</p>
      </div>
    );
  }

  // Real data would be calculated from followers list here
  // For now, since we only have follower IDs, we can't show age/gender/location
  // but we can show that we are ready to collect it.
  return (
    <div className={`col-span-2 rounded-xl p-6 border ${isLight ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-gray-800'}`}>
      <h3 className={`font-semibold mb-4 text-center ${isLight ? 'text-black' : 'text-white'}`}>Audience Insights Coming Soon</h3>
      <p className={`text-center ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>We are starting to collect demographic data for your {followers.length} followers.</p>
    </div>
  );
}
