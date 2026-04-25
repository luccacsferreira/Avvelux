import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/theme';
import { Camera, Save, Loader2, Check, Crop, ArrowLeft } from 'lucide-react';
import ImageCropperModal from '@/components/common/ImageCropperModal';
import SuccessModal from '@/components/common/SuccessModal';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

const STOCK_AVATARS = [
  { id: 'penguin', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Penguin', label: 'Penguin' },
  { id: 'fox', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Fox', label: 'Fox' },
  { id: 'panda', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Panda', label: 'Panda' },
  { id: 'tiger', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Tiger', label: 'Tiger' },
];

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const { isLight } = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    display_name: '',
    username: '',
    bio: '',
    avatar_url: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    if (user) {
      const data = {
        display_name: user.display_name || '',
        username: user.username || '',
        bio: user.bio || '',
        avatar_url: user.avatar_url || '',
      };
      setFormData(data);
      setInitialData(JSON.stringify(data));
    }
  }, [user]);

  const hasChanges = initialData !== JSON.stringify(formData);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropComplete = async (croppedImageBlobUrl) => {
    setIsUploading(true);
    try {
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

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success('Avatar cropped and uploaded! Remember to save changes.');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.username.startsWith('@')) {
      toast.error('Username must start with @');
      return;
    }
    if (formData.username.length < 4) {
      toast.error('Username too short');
      return;
    }

    setIsSaving(true);
    try {
      // Check for username uniqueness if it changed
      if (formData.username !== user?.username) {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', formData.username)
          .neq('id', user.id)
          .maybeSingle();

        if (existing) {
          throw new Error('This username is already taken');
        }
      }

      await updateUser({
        display_name: formData.display_name,
        username: formData.username,
        bio: formData.bio,
        avatar_url: formData.avatar_url,
        updated_at: new Date().toISOString(),
      });
      setSuccessModalOpen(true);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUsernameChange = (val) => {
    let clean = val.toLowerCase().replace(/\s+/g, '');
    if (clean.length > 0 && !clean.startsWith('@')) {
      clean = '@' + clean;
    }
    setFormData({ ...formData, username: clean });
  };

  const displayName = formData.display_name || user?.display_name || 'User';

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate(-1)} 
        className={`mb-4 -ml-2 gap-2 ${isLight ? 'text-gray-600 hover:text-black' : 'text-gray-400 hover:text-white'}`}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>
      <h1 className={`text-2xl font-bold mb-8 ${isLight ? 'text-black' : 'text-white'}`}>Edit Profile</h1>

      {/* Profile Picture */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-center gap-6">
          <div className="relative">
            {formData.avatar_url ? (
              <div className="relative group/avatar">
                <img src={formData.avatar_url} alt={displayName} className="w-24 h-24 rounded-full object-cover border-2 border-purple-500" />
                <button 
                  onClick={() => {
                    setImageToCrop(formData.avatar_url);
                    setCropperOpen(true);
                  }}
                  className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center text-white transition-opacity"
                >
                  <Crop className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-medium">
                {displayName[0]?.toUpperCase()}
              </div>
            )}
            <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#2a2a2a] border border-gray-700 flex items-center justify-center text-white hover:bg-[#3a3a3a] cursor-pointer shadow-lg">
              <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} disabled={isUploading} />
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </label>
          </div>
          <div>
            <h3 className={`font-bold text-lg ${isLight ? 'text-black' : 'text-white'}`}>{displayName}</h3>
            <p className="text-gray-400 text-sm">{formData.username || (user?.email ? `@${user.email.split('@')[0]}` : '@user')}</p>
          </div>
        </div>

        {/* Stock Avatars */}
        <div className="space-y-3">
          <Label className={`${isLight ? 'text-black' : 'text-white'} text-xs font-medium uppercase tracking-wider opacity-60`}>Or pick a stock avatar</Label>
          <div className="flex flex-wrap gap-3">
            {STOCK_AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                type="button"
                onClick={() => setFormData({ ...formData, avatar_url: avatar.url })}
                className={`relative w-12 h-12 rounded-full border-2 transition-all p-0.5 ${
                  formData.avatar_url === avatar.url 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-transparent bg-white/5 hover:border-white/20'
                }`}
              >
                <img src={avatar.url} alt={avatar.label} className="w-full h-full rounded-full object-cover" />
                {formData.avatar_url === avatar.url && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center text-white">
                    <Check className="w-2.5 h-2.5" strokeWidth={4} />
                  </div>
                )}
              </button>
            ))}
          </div>
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
            onChange={(e) => handleUsernameChange(e.target.value)}
            placeholder="@unique_username"
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
          disabled={isSaving || isUploading || !hasChanges}
          className={`w-full font-bold py-6 rounded-xl transition-all ${
            !hasChanges || isSaving || isUploading
              ? (isLight ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60' : 'bg-white/5 text-gray-500 cursor-not-allowed opacity-40')
              : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:opacity-90'
          }`}
        >
          {isSaving ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Save className="w-5 h-5 mr-3" />}
          {isSaving ? 'Saving Changes...' : 'Save Changes'}
        </Button>
      </div>

      <ImageCropperModal
        open={cropperOpen}
        onOpenChange={setCropperOpen}
        image={imageToCrop}
        onCropComplete={handleCropComplete}
      />

      <SuccessModal 
        open={successModalOpen} 
        onOpenChange={setSuccessModalOpen}
        title="Profile Updated!"
        message="Your changes have been saved successfully."
      />
    </div>
  );
}
