import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/theme';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginModal() {
  const { 
    isLoginModalOpen, 
    setIsLoginModalOpen, 
    signInWithEmail,
    signUpWithEmail
  } = useAuth();
  const { isLight } = useTheme();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (isSignUp) {
        const result = await signUpWithEmail(email, password, displayName);
        if (result?.confirmationRequired) {
          setMessage('Check your email for a confirmation link!');
        } else {
          setIsLoginModalOpen(false);
          // Success modal is handled by the page if needed, but here we just close
        }
      } else {
        await signInWithEmail(email, password);
        setIsLoginModalOpen(false);
      }
    } catch (err) {
      console.error('Auth error details:', err);
      setError('E-mail or password is wrong, please check your credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const bgColor = isLight ? 'bg-white' : 'bg-[#1a1a1a]';
  const textColor = isLight ? 'text-black' : 'text-white';
  const borderColor = isLight ? 'border-gray-200' : 'border-gray-800';
  const inputBg = isLight ? 'bg-gray-100' : 'bg-[#2a2a2a]';
  const textMuted = isLight ? 'text-gray-600' : 'text-gray-400';

  return (
    <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
      <DialogContent className={`sm:max-w-[425px] ${bgColor} ${textColor} ${borderColor}`}>
        <DialogHeader>
          <DialogTitle className={`text-2xl font-bold text-center ${textColor}`}>
            {isSignUp ? 'Join Avvelux' : 'Welcome to Avvelux'}
          </DialogTitle>
          <DialogDescription className={`text-center ${textMuted}`}>
            {isSignUp 
              ? 'Create an account to start sharing and interacting.' 
              : 'Sign in to like, comment, and access your profile.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={`border-none ${inputBg} ${textColor} placeholder:text-gray-500`}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`border-none ${inputBg} ${textColor} placeholder:text-gray-500`}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`border-none ${inputBg} ${textColor} placeholder:text-gray-500`}
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            {message && <p className="text-green-500 text-xs text-center">{message}</p>}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading 
                ? (isSignUp ? 'Creating account...' : 'Logging in...') 
                : (isSignUp ? 'Sign Up' : 'Log In')}
            </Button>
          </form>

          <div className={`text-center text-sm ${textMuted} mt-2`}>
            {isSignUp ? (
              <p>
                Already have an account?{' '}
                <button 
                  onClick={() => setIsSignUp(false)}
                  className="text-purple-400 hover:underline font-medium"
                >
                  Log In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <button 
                  onClick={() => setIsSignUp(true)}
                  className="text-purple-400 hover:underline font-medium"
                >
                  Sign Up
                </button>
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
