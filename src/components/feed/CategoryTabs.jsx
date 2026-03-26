import React, { useState, useEffect } from 'react';

export default function CategoryTabs({ categories, activeCategory, onSelect, showAll = true }) {
  const [theme, setTheme] = useState('system');

  useEffect(() => {
    setTheme(localStorage.getItem('avvelux-theme') || 'system');
  }, []);

  const isLight = theme === 'light';
  const allCategories = showAll ? ['All', ...categories] : categories;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {allCategories.map((cat) => {
        const isActive = activeCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              isActive
                ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white'
                : isLight
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-[#2a2a2a] text-white hover:bg-[#333]'
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}