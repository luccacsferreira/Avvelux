import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { getInitialTheme } from '@/lib/theme';

import LoginModal from './components/auth/LoginModal';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, user, authError } = useAuth();
  const [theme] = useState(getInitialTheme());

  if (isLoadingAuth) {
    const videoSrc = theme === 'dark' ? '/Add a heading (2).mp4' : '/Add a heading (3).mp4';
    const bgColor = theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-white';
    
    return (
      <div className={`flex items-center justify-center min-h-screen ${bgColor} overflow-hidden`}>
        <div className="relative w-full h-full flex items-center justify-center">
          <video 
            autoPlay 
            muted 
            playsInline 
            className="max-w-md w-full h-auto"
            onEnded={(e) => {
              // Optional: if the video is short, we might want to loop or just stay on the last frame
              // But usually auth takes 1-3 seconds, so one play is likely enough
            }}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
          {/* Fallback if video fails or is loading */}
          <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-2">
            <div className={`w-8 h-8 border-2 ${theme === 'dark' ? 'border-purple-500' : 'border-purple-600'} border-t-transparent rounded-full animate-spin`}></div>
            <p className={`text-xs font-medium animate-pulse ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              Initializing Avvelux...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (authError && (authError.type === 'connection_error' || authError.type === 'schema_error')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 text-center">
        <div className="max-w-md p-8 bg-white rounded-xl shadow-lg border border-red-100">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
          <p className="text-slate-600 mb-6">{authError.message}</p>
          <div className="text-sm text-slate-400 bg-slate-50 p-4 rounded-lg text-left overflow-auto max-h-40">
            <p className="font-mono">Error Type: {authError.type}</p>
            <p className="font-mono mt-2">Please ensure your Supabase project is correctly configured and the schema SQL has been executed.</p>
          </div>
        </div>
      </div>
    );
  }

  // Render the app
  return (
    <>
      <LoginModal />
      <Routes>
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        
        {/* Redirect root to Home */}
        <Route path="/" element={<Navigate to="/Home" replace />} />
        
        {Object.entries(Pages).map(([path, Page]) => (
          <Route
            key={path}
            path={`/${path}`}
            element={
              <LayoutWrapper currentPageName={path}>
                <Page />
              </LayoutWrapper>
            }
          />
        ))}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
