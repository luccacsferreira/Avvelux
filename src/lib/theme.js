import React from 'react';

export function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  
  const saved = localStorage.getItem('avvelux-theme');
  
  // Explicitly set to light or dark by user → respect that
  if (saved === 'light') return 'light';
  if (saved === 'dark') return 'dark';
  
  // 'device' or null/unset → follow the OS/browser preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  return 'light';
}

export function useTheme() {
  const [theme, setTheme] = React.useState(getInitialTheme());

  React.useEffect(() => {
    const handleThemeChange = () => {
      setTheme(localStorage.getItem('avvelux-theme') || getInitialTheme());
    };
    window.addEventListener('avvelux-theme-changed', handleThemeChange);
    return () => window.removeEventListener('avvelux-theme-changed', handleThemeChange);
  }, []);

  const isLight = theme === 'light';

  return { theme, isLight };
}
