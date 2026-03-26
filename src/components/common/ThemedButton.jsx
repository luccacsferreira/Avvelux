/**
 * A reusable pill-style button that matches the CategoryTabs style.
 * isActive: whether this button is currently selected
 * isLight: whether the current theme is light
 */
import React from 'react';

export default function ThemedButton({ isActive, isLight, onClick, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
        isLight
          ? isActive
            ? 'bg-gray-700 text-white'
            : 'bg-gray-200 text-black hover:bg-gray-300'
          : isActive
            ? 'bg-white text-black'
            : 'bg-[#2a2a2a] text-white hover:bg-[#333]'
      } ${className}`}
    >
      {children}
    </button>
  );
}