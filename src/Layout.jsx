import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from './utils';
import { useAuth } from '@/lib/AuthContext';
import { 
  Home, Film, TrendingUp, Lightbulb, 
  Library, Clock, FileText, ListVideo, Heart,
  Menu, Search, Upload, Crown,
  Settings, LogOut, User, Sun, Moon, Sliders,
  Users, GraduationCap
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LOGO_DARK = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6984d4f6d54057de7ab5c393/929e340e8_avvelux_square_exact.png";
const LOGO_LIGHT = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6984d4f6d54057de7ab5c393/dfafbe62b_avvelux_gradient_rounded_more.png";

function getInitialTheme() {
  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('avvelux-theme') : null;
  // Explicitly set to light or dark by user → respect that
  if (saved === 'light') return 'light';
  if (saved === 'dark') return 'dark';
  // 'device' or null/unset → follow the OS/browser preference
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

export default function Layout({ children, currentPageName }) {
  const { user, signOut, requireAuth } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState(getInitialTheme);
  const [showThemeToggle, setShowThemeToggle] = useState(() => localStorage.getItem('avvelux-show-theme-toggle') !== 'false');
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for preference changes from Settings page
    const onPrefsChange = () => {
      setShowThemeToggle(localStorage.getItem('avvelux-show-theme-toggle') !== 'false');
    };
    window.addEventListener('avvelux-prefs-changed', onPrefsChange);
    return () => window.removeEventListener('avvelux-prefs-changed', onPrefsChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('avvelux-theme', newTheme);
    // Dispatch event so other components can react if they use the hook
    window.dispatchEvent(new Event('avvelux-theme-changed'));
  };

  const isLightTheme = theme === 'light';

  // Apply theme class to root immediately to prevent flash
  useEffect(() => {
    document.documentElement.style.backgroundColor = isLightTheme ? '#ffffff' : '#1a1a1a';
    document.documentElement.style.colorScheme = isLightTheme ? 'light' : 'dark';
  }, [isLightTheme]);

  const bgColor = isLightTheme ? 'bg-white' : 'bg-[#1a1a1a]';
  const textColor = isLightTheme ? 'text-black' : 'text-white';
  const textMuted = isLightTheme ? 'text-gray-600' : 'text-gray-400';
  const borderColor = isLightTheme ? 'border-gray-200' : 'border-gray-800';
  const hoverBg = isLightTheme ? 'hover:bg-gray-100' : 'hover:bg-white/5';
  const activeBg = isLightTheme ? 'bg-gray-100' : 'bg-white/10';
  const inputBg = isLightTheme ? 'bg-gray-100' : 'bg-[#2a2a2a]';

  const navItems = [
    { icon: Home, label: 'Home', page: 'Home' },
    { icon: Film, label: 'Clips', page: 'Clips' },
    { icon: Sliders, label: 'Tune Feed', page: 'TuneFeed' },
    { icon: TrendingUp, label: 'Trending', page: 'Trending' },
    { icon: Library, label: 'Collections', page: 'Collections' },
    { icon: Lightbulb, label: 'AI-Help', page: 'AIHelp' },
    { icon: Users, label: 'Communities', page: 'Groups' },
    { icon: GraduationCap, label: 'Courses', page: 'Courses' },
  ];

  const youItems = [
    { icon: Library, label: 'Library', page: 'Library' },
    { icon: Heart, label: 'Liked Content', page: 'LikedContent' },
    { icon: Clock, label: 'Watch Later', page: 'WatchLater' },
    { icon: FileText, label: 'Notes', page: 'Notes' },
    { icon: ListVideo, label: 'Playlists', page: 'Playlists' },
  ];

  const NavLink = ({ icon: Icon, label, page }) => {
    const isActive = currentPageName === page;
    const isProtected = ['Library', 'LikedContent', 'WatchLater', 'Notes', 'Playlists', 'Upload', 'Account', 'Settings'].includes(page);

    const handleClick = (e) => {
      if (isProtected) {
        e.preventDefault();
        requireAuth(() => navigate(createPageUrl(page)));
      }
    };

    return (
      <Link
        to={createPageUrl(page)}
        onClick={handleClick}
        className={`flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all ${
          isActive 
            ? `${activeBg} bg-gradient-to-r from-purple-500/20 to-cyan-500/20` 
            : `${hoverBg}`
        } ${textColor}`}
      >
        <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : textMuted}`} />
        <span className={`text-sm ${isActive ? 'font-medium' : ''}`}>{label}</span>
      </Link>
    );
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/Login');
  };

  const isClipsPage = currentPageName === 'Clips';
  const isMobileClips = isClipsPage;

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} flex transition-colors duration-200`}>
      {/* Inject theme into html immediately to prevent flash */}
      <style>{`
        html { background-color: ${isLightTheme ? '#ffffff' : '#1a1a1a'}; }
        * { transition: background-color 0.15s ease, border-color 0.15s ease; }
      `}</style>

      {/* Top Bar - hidden on clips page entirely */}
      <header className={`fixed top-0 left-0 right-0 h-14 ${bgColor} border-b ${borderColor} flex items-center justify-between px-4 z-50 ${isMobileClips ? 'hidden' : ''}`}>
        {/* Logo in Top Bar - hidden on mobile */}
        <div className="hidden md:flex items-center gap-2 mr-4 w-56">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`p-1 ${hoverBg} rounded`}>
            <Menu className="w-5 h-5" />
          </button>
          <Link to={createPageUrl('Home')} className="flex items-center gap-2">
            <img src={isLightTheme ? LOGO_LIGHT : LOGO_DARK} alt="Avvelux" className="h-12 w-auto object-contain" />
          </Link>
        </div>

        {/* Theme Toggle + Search */}
        <div className="flex-1 max-w-xl mx-auto flex items-center gap-3">
          {showThemeToggle && (
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${hoverBg} flex-shrink-0`}
              title={isLightTheme ? 'Switch to Dark mode' : 'Switch to Light mode'}
            >
              {isLightTheme ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          )}
          <form onSubmit={(e) => {
            e.preventDefault();
            const input = e.target.querySelector('input');
            if (input.value.trim()) {
              navigate(createPageUrl(`Search?q=${encodeURIComponent(input.value)}`));
            }
          }} className="flex-1">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
              <Input 
                placeholder="Search with AI..." 
                className={`pl-10 ${inputBg} border-none ${textColor} placeholder:${textMuted} rounded-full`}
              />
            </div>
          </form>
        </div>


        {/* Right Actions - hidden on mobile (mobile only shows search+theme) */}
        <div className="hidden md:flex items-center gap-3">
          <button 
            onClick={() => requireAuth(() => navigate(createPageUrl('Upload')))}
            className={`p-2 ${hoverBg} rounded-full transition-colors`}
          >
            <Upload className="w-5 h-5" />
          </button>

          {/* Premium Button */}
          <Link
            to={createPageUrl('Premium')}
            className="flex flex-col items-center"
          >
            <span className="flex items-center gap-1 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-orange-600 transition-colors whitespace-nowrap">
              <Crown className="w-3.5 h-3.5" /> Go Premium
            </span>
          </Link>

          {/* Profile Dropdown - desktop only */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-medium">
                    {user?.displayName?.[0]?.toUpperCase() || 'U'}
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`w-64 ${isLightTheme ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-gray-700'} ${textColor}`}>
                <div className="p-3">
                  <p className="font-medium">{user?.displayName || 'Guest'}</p>
                  <p className={`text-sm ${textMuted}`}>{user?.email}</p>
                </div>
                <DropdownMenuSeparator className={borderColor} />
                <DropdownMenuItem asChild className={`${hoverBg} cursor-pointer`}>
                  <Link to={createPageUrl('Account')} className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Your Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className={`${hoverBg} cursor-pointer`}>
                  <Link to={createPageUrl('Upload')} className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className={`${hoverBg} cursor-pointer`}>
                  <Link to={createPageUrl('Settings')} className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className={borderColor} />
                <DropdownMenuItem onClick={handleLogout} className="text-red-400 cursor-pointer hover:bg-red-500/10">
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              onClick={() => requireAuth(() => {})} 
              className="bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-full px-6"
            >
              Log In
            </Button>
          )}
        </div>
      </header>


      {/* Sidebar - hidden on clips page so clips can use full width */}
      <aside className={`w-56 ${bgColor} border-r ${borderColor} flex flex-col h-screen sticky top-0 pt-14 hidden md:flex ${isClipsPage ? 'md:hidden' : ''}`}>
        <nav className="p-2 space-y-0.5 overflow-y-auto flex-1">
          {navItems.map((item) => (
            <NavLink key={item.page} {...item} />
          ))}

          <div className={`pt-3 pb-1 ${textMuted} text-xs font-medium uppercase tracking-wider`}>You</div>
          {youItems.map((item) => (
            <NavLink key={item.page} {...item} />
          ))}
        </nav>

        <div className={`p-4 border-t ${borderColor}`}>
          <p className="text-gray-500 text-xs text-center">© Lucca Ferreira</p>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-screen min-w-0 ${isClipsPage ? '' : 'pt-14'}`}>
        <main className={isClipsPage ? 'flex-1 overflow-hidden' : 'flex-1 p-4 md:p-6'}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Bar */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 h-14 ${bgColor} border-t ${borderColor} flex items-center justify-around z-50`}>
        <Link to={createPageUrl('Home')} className={`flex flex-col items-center gap-0.5 ${currentPageName === 'Home' ? 'text-purple-400' : textMuted}`}>
          <Home className="w-5 h-5" />
        </Link>
        <Link to={createPageUrl('Clips')} className={`flex flex-col items-center gap-0.5 ${currentPageName === 'Clips' ? 'text-purple-400' : textMuted}`}>
          <Film className="w-5 h-5" />
        </Link>
        <button 
          onClick={() => requireAuth(() => navigate(createPageUrl('Upload')))}
          className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center"
        >
          <Upload className="w-5 h-5 text-white" />
        </button>
        <Link to={createPageUrl('Courses')} className={`flex flex-col items-center gap-0.5 ${currentPageName === 'Courses' ? 'text-purple-400' : textMuted}`}>
          <GraduationCap className="w-5 h-5" />
        </Link>
        <button 
          onClick={() => requireAuth(() => navigate(createPageUrl('Library')))}
          className={`flex flex-col items-center gap-0.5 ${currentPageName === 'Library' ? 'text-purple-400' : textMuted}`}
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
            {user?.displayName?.[0]?.toUpperCase() || 'U'}
          </div>
        </button>
      </nav>
    </div>
  );
}