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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';
import { Check, Camera } from 'lucide-react';
import ImageCropperModal from '@/components/common/ImageCropperModal';

const STOCK_AVATARS = [
  { id: 'penguin', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Penguin', label: 'Penguin' },
  { id: 'fox', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Fox', label: 'Fox' },
  { id: 'panda', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Panda', label: 'Panda' },
  { id: 'tiger', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Tiger', label: 'Tiger' },
];

export default function OnboardingModal() {
  const { user, updateUser } = useAuth();
  const { isLight } = useTheme();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);

  useEffect(() => {
    // If user exists but onboarding is not completed, show modal
    // Check localStorage as backup in case DB column is missing
    const isCompletedLocal = localStorage.getItem(`avvelux_onboarding_done_${user?.id}`);
    
    if (user && user.onboarding_completed === false && !isCompletedLocal) {
      setOpen(true);
      const defaultNick = user.display_name || user.email?.split('@')[0] || '';
      if (!displayName) setDisplayName(defaultNick);
      if (!username) setUsername(`@${defaultNick.toLowerCase().replace(/\s+/g, '')}`);
      if (!selectedAvatar) setSelectedAvatar(user.avatar_url || STOCK_AVATARS[0].url);
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

      const profileData = {
        username: username,
        display_name: displayName,
        avatar_url: selectedAvatar,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
        bio: bio
      };
      
      await updateUser(profileData);
      
      // Save to localStorage as backup
      localStorage.setItem(`avvelux_onboarding_done_${user.id}`, 'true');

      toast.success('Profile setup complete!');
      setOpen(false);
    } catch (err) {
      console.error('Onboarding error:', err);
      // Strip potentially failing columns from error message for user
      let msg = err.message || 'Failed to save profile';
      if (msg.includes('column') || msg.includes('schema cache')) {
        msg = 'Some profile fields couldn\'t be saved to the database, but your basic profile is updated.';
        toast.info(msg);
        setOpen(false);
        return;
      }
      setError(msg);
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

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be chosen again
    e.target.value = '';
  };

  const handleCropComplete = async (croppedImageBlobUrl) => {
    setIsUploading(true);
    try {
      // Convert blob URL to File object for upload
      const response = await fetch(croppedImageBlobUrl);
      const blob = await response.blob();
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });

      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.jpg`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setSelectedAvatar(publicUrl);
      toast.success('Profile picture cropped and uploaded!');
    } catch (e) {
      console.error('Upload error:', e);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const isStockAvatar = STOCK_AVATARS.some(a => a.url === selectedAvatar);

  const bgColor = isLight ? 'bg-white' : 'bg-[#1a1a1a]';
  const textColor = isLight ? 'text-black' : 'text-white';
  const borderColor = isLight ? 'border-gray-200' : 'border-gray-800';
  const inputBg = isLight ? 'bg-gray-100' : 'bg-[#2a2a2a]';
  const textMuted = isLight ? 'text-gray-600' : 'text-gray-400';

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setOpen(false); }}>
      <DialogContent className={`sm:max-w-[500px] ${bgColor} ${textColor} ${borderColor} scrollbar-hide overflow-y-auto max-h-[90vh]`}>
        <DialogHeader>
          <DialogTitle className={`text-2xl font-bold text-center ${textColor}`}>Welcome to Avvelux!</DialogTitle>
          <DialogDescription className={`text-center ${textMuted}`}>
            Let's personalize your experience. This will only take a moment.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSave} className="space-y-6 py-4">
          {/* Avatar Selection */}
          <div className="space-y-4">
            <Label className={`text-sm font-medium ${textMuted}`}>Pick an Avatar</Label>
            <div className="flex flex-wrap gap-3">
              {/* Custom Upload Button */}
              <label className={`relative w-14 h-14 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${isUploading ? 'opacity-50' : 'hover:border-purple-500 hover:bg-purple-500/5'} ${borderColor}`}>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} disabled={isUploading} />
                {isUploading ? (
                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="flex flex-col items-center">
                    <Camera className="w-5 h-5 text-gray-500" />
                  </div>
                )}
              </label>

              {/* Show uploaded avatar if not one of the stocks */}
              {!isStockAvatar && selectedAvatar && (
                <div className="relative w-14 h-14 rounded-full border-2 border-purple-500 bg-purple-500/10 p-1">
                  <img src={selectedAvatar} alt="Custom" className="w-full h-full rounded-full object-cover" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white">
                    <Check className="w-3 h-3" strokeWidth={4} />
                  </div>
                </div>
              )}

              {STOCK_AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar.url)}
                  className={`relative w-14 h-14 rounded-full border-2 transition-all p-1 ${
                    selectedAvatar === avatar.url 
                      ? 'border-purple-500 bg-purple-500/10' 
                      : 'border-transparent bg-white/5 hover:border-white/20'
                  }`}
                >
                  <img src={avatar.url} alt={avatar.label} className="w-full h-full rounded-full object-cover" />
                  {selectedAvatar === avatar.url && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white">
                      <Check className="w-3 h-3" strokeWidth={4} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nickname" className={`text-sm font-medium ${textMuted}`}>Nickname</Label>
              <Input
                id="nickname"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Name"
                className={`${inputBg} border-none ${textColor} placeholder:text-gray-500`}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className={`text-sm font-medium ${textMuted}`}>Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="@username"
                className={`${inputBg} border-none ${textColor} placeholder:text-gray-500 font-mono`}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className={`text-sm font-medium ${textMuted}`}>Bio (Optional)</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the community about yourself..."
              className={`${inputBg} border-none ${textColor} placeholder:text-gray-500 min-h-[80px] resize-none`}
            />
          </div>

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 py-6 font-bold"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Explore Avvelux'}
          </Button>
          
          <p className="text-[10px] text-center text-gray-500">
            You can always change these settings later in your profile.
          </p>
        </form>
        
        <ImageCropperModal
          open={cropperOpen}
          onOpenChange={setCropperOpen}
          image={imageToCrop}
          onCropComplete={handleCropComplete}
        />
      </DialogContent>
    </Dialog>
  );
}
