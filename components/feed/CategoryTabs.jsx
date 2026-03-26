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
      {allCategories.map((cat) =>
      <button
        key={cat}
        onClick={() => onSelect(cat)} className="bg-gray-50 text-white px-4 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors">








          {cat}
        </button>
      )}
    </div>);

}