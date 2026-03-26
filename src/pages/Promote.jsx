import React, { useState, useEffect } from 'react';
import { TrendingUp, Zap, Target, BarChart3 } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function Promote() {
  const [theme, setTheme] = useState('system');

  useEffect(() => {
    setTheme(localStorage.getItem('avvelux-theme') || 'system');
  }, []);

  const isLight = theme === 'light';

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className={`text-2xl font-bold mb-2 ${isLight ? 'text-black' : 'text-white'}`}>Promote Your Content</h1>
      <p className={`mb-8 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Boost your reach and grow your audience</p>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className={`rounded-xl p-6 border ${isLight ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-gray-800'}`}>
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className={`font-semibold text-lg mb-2 ${isLight ? 'text-black' : 'text-white'}`}>Boost Post</h3>
          <p className={`text-sm mb-4 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            Get more views on your videos and clips by promoting them to a wider audience.
          </p>
          <Button className="bg-gradient-to-r from-purple-600 to-cyan-600">
            Start Boosting
          </Button>
        </div>

        <div className={`rounded-xl p-6 border ${isLight ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-gray-800'}`}>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4">
            <Target className="w-6 h-6 text-cyan-400" />
          </div>
          <h3 className={`font-semibold text-lg mb-2 ${isLight ? 'text-black' : 'text-white'}`}>Targeted Ads</h3>
          <p className={`text-sm mb-4 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            Reach specific audiences based on interests, location, and demographics.
          </p>
          <Button className="bg-gradient-to-r from-purple-600 to-cyan-600">
            Create Campaign
          </Button>
        </div>

        <div className={`rounded-xl p-6 border ${isLight ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-gray-800'}`}>
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
          <h3 className={`font-semibold text-lg mb-2 ${isLight ? 'text-black' : 'text-white'}`}>Trending Push</h3>
          <p className={`text-sm mb-4 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            Get featured on the trending page and reach thousands of new viewers.
          </p>
          <Button className="bg-gradient-to-r from-purple-600 to-cyan-600">
            Learn More
          </Button>
        </div>

        <div className={`rounded-xl p-6 border ${isLight ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-gray-800'}`}>
          <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center mb-4">
            <BarChart3 className="w-6 h-6 text-yellow-400" />
          </div>
          <h3 className={`font-semibold text-lg mb-2 ${isLight ? 'text-black' : 'text-white'}`}>Analytics Pro</h3>
          <p className={`text-sm mb-4 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            Get detailed insights about your audience and optimize your content strategy.
          </p>
          <Button className="bg-gradient-to-r from-purple-600 to-cyan-600">
            View Analytics
          </Button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-xl p-6 border border-purple-500/30">
        <h3 className={`font-semibold text-lg mb-2 ${isLight ? 'text-black' : 'text-white'}`}>Coming Soon</h3>
        <p className={isLight ? 'text-gray-700' : 'text-gray-300'}>
          Full promotion features are being developed. Stay tuned for powerful tools to grow your audience!
        </p>
      </div>
    </div>
  );
}