import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export default function Collections() {
  const [theme, setTheme] = useState('system');

  useEffect(() => {
    setTheme(localStorage.getItem('avvelux-theme') || 'system');
  }, []);

  const isLight = theme === 'light';

  return (
    <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className={`text-3xl font-bold mb-3 ${isLight ? 'text-black' : 'text-white'}`}>Coming Soon</h1>
        <p className={`text-lg ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
          Curated collections are on the way. Stay tuned!
        </p>
      </div>
    </div>
  );
}