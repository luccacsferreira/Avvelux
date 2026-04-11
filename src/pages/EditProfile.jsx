import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Camera, Save, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    display_name: '',
    username: '',
    bio: '',
    avatar_url: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        display_name: user.display_name || '',
        username: user.username || '',
        bio: user.bio || '',
        avatar_url: user.avatar_url || '',
      });
    }
  }, [user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success('Avatar uploaded! Save changes to apply.');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUser({
        display_name: formData.display_name,
        username: formData.username,
        bio: formData.bio,
        avatar_url: formData.avatar_url,
        updated_at: new Date().toISOString(),
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = formData.display_name || user?.display_name || 'User';
  const theme = localStorage.getItem('avvelux-theme') || 'night';
  const isLight = theme === 'light';

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className={`text-2xl font-bold mb-8 ${isLight ? 'text-black' : 'text-white'}`}>Edit Profile</h1>

      {/* Profile Picture */}
      <div className="flex items-center gap-6 mb-8">
        <div className="relative">
          {formData.avatar_url ? (
            <img src={formData.avatar_url} alt={displayName} className="w-24 h-24 rounded-full object-cover border-2 border-purple-500" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-medium">
              {displayName[0]?.toUpperCase()}
            </div>
          )}
          <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#2a2a2a] border border-gray-700 flex items-center justify-center text-white hover:bg-[#3a3a3a] cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploading} />
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
          </label>
        </div>
        <div>
          <h3 className={`font-medium ${isLight ? 'text-black' : 'text-white'}`}>{displayName}</h3>
          <p className="text-gray-400 text-sm">@{formData.username || user?.email?.split('@')[0]}</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        <div>
          <Label className={`${isLight ? 'text-black' : 'text-white'} mb-2 block`}>Display Name</Label>
          <Input
            value={formData.display_name}
            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
            placeholder="Your display name"
            className={`${isLight ? 'bg-gray-100 border-gray-300 text-black' : 'bg-[#2a2a2a] border-gray-700 text-white'}`}
          />
        </div>

        <div>
          <Label className={`${isLight ? 'text-black' : 'text-white'} mb-2 block`}>Username</Label>
          <Input
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
            placeholder="unique_username"
            className={`${isLight ? 'bg-gray-100 border-gray-300 text-black' : 'bg-[#2a2a2a] border-gray-700 text-white'}`}
          />
        </div>

        <div>
          <Label className={`${isLight ? 'text-black' : 'text-white'} mb-2 block`}>Bio</Label>
          <Textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell us about yourself..."
            className={`${isLight ? 'bg-gray-100 border-gray-300 text-black' : 'bg-[#2a2a2a] border-gray-700 text-white'} min-h-[100px]`}
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving || isUploading}
          className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white"
        >
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
