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
