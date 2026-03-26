import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github } from 'lucide-react';

export default function LoginModal() {
  const { 
    isLoginModalOpen, 
    setIsLoginModalOpen, 
    signInWithGoogle, 
    signInWithGithub, 
    signInWithEmail 
  } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmail(email, password);
      setIsLoginModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    setError(null);
    try {
      if (provider === 'google') await signInWithGoogle();
      if (provider === 'github') await signInWithGithub();
      setIsLoginModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
      <DialogContent className="sm:max-w-[425px] bg-[#1a1a1a] text-white border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Logging in Avvelux</DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            Sign in to like, comment, and access your profile.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Button 
            variant="outline" 
            className="w-full bg-white text-black hover:bg-gray-200 border-none"
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 mr-2" alt="Google" />
            Continue with Google
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full bg-[#24292F] text-white hover:bg-[#24292F]/90 border-none"
            onClick={() => handleSocialLogin('github')}
            disabled={isLoading}
          >
            <Github className="w-5 h-5 mr-2" />
            Continue with GitHub
          </Button>
          
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#1a1a1a] px-2 text-gray-500">Or continue with email</span>
            </div>
          </div>
          
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#2a2a2a] border-none text-white placeholder:text-gray-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#2a2a2a] border-none text-white placeholder:text-gray-500"
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
