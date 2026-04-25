import React, { useState, useEffect } from 'react';
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';

export default function OnboardingModal() {
  const { user, updateUser } = useAuth();
  const { isLight } = useTheme();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If user exists but username is not in @format or missing, show modal
    if (user && (!user.username || !user.username.startsWith('@'))) {
      setOpen(true);
      const defaultNick = user.display_name || user.email?.split('@')[0] || '';
      setDisplayName(defaultNick);
      setUsername(`@${defaultNick.toLowerCase().replace(/\s+/g, '')}`);
    } else {
      setOpen(false);
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Verification
    if (!username.startsWith('@')) {
      setError('Username must start with @');
      setIsLoading(false);
      return;
    }

    if (username.length < 4) {
      setError('Username too short');
      setIsLoading(false);
      return;
    }

    try {
      // Check if username is taken
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .neq('id', user.id)
        .maybeSingle();

      if (existing) {
        setError('This username is already taken');
        setIsLoading(false);
        return;
      }

      await updateUser({
        username: username,
        display_name: displayName,
        updated_at: new Date().toISOString()
      });

      toast.success('Profile setup complete!');
      setOpen(false);
    } catch (err) {
      console.error('Onboarding error:', err);
      setError(err.message || 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameChange = (val) => {
    let clean = val.toLowerCase().replace(/\s+/g, '');
    if (!clean.startsWith('@')) {
      clean = '@' + clean;
    }
    setUsername(clean);
  };

  const bgColor = isLight ? 'bg-white' : 'bg-[#1a1a1a]';
  const textColor = isLight ? 'text-black' : 'text-white';
  const borderColor = isLight ? 'border-gray-200' : 'border-gray-800';
  const inputBg = isLight ? 'bg-gray-100' : 'bg-[#2a2a2a]';
  const textMuted = isLight ? 'text-gray-600' : 'text-gray-400';

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className={`sm:max-w-[425px] ${bgColor} ${textColor} ${borderColor}`} onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className={`text-2xl font-bold text-center ${textColor}`}>Complete Your Profile</DialogTitle>
          <DialogDescription className={`text-center ${textMuted}`}>
            Set your unique username and nickname to continue.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSave} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="nickname" className={`text-sm font-medium ${textMuted}`}>Nickname (How you'll appear)</Label>
            <Input
              id="nickname"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. John Doe"
              className={`${inputBg} border-none ${textColor} placeholder:text-gray-500`}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className={`text-sm font-medium ${textMuted}`}>Username (Must be unique)</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder="@username"
              className={`${inputBg} border-none ${textColor} placeholder:text-gray-500 font-mono`}
              required
            />
            <p className="text-[10px] text-gray-500">Must start with @ and have no spaces.</p>
          </div>

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 py-6"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Finish Setup'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
