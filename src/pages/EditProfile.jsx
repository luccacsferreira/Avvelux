import React, { useState, useEffect } from 'react';
import { apiClient as base44 } from '@/api/apiClient';
import { Camera, Save } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function EditProfile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    nickname: '',
    bio: '',
    website: '',
    location: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        setFormData({
          nickname: userData.nickname || userData.full_name?.split(' ')[0] || '',
          bio: userData.bio || '',
          website: userData.website || '',
          location: userData.location || '',
        });
      } catch (e) {}
    };
    loadUser();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await base44.auth.updateMe(formData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
    setIsSaving(false);
  };

  const nickname = formData.nickname || user?.full_name?.split(' ')[0] || 'User';

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-8">Edit Profile</h1>

      {/* Profile Picture */}
      <div className="flex items-center gap-6 mb-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-medium">
            {nickname[0]?.toUpperCase()}
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#2a2a2a] border border-gray-700 flex items-center justify-center text-white hover:bg-[#3a3a3a]">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <div>
          <h3 className="text-white font-medium">{user?.full_name}</h3>
          <p className="text-gray-400 text-sm">@{user?.email?.split('@')[0]}</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        <div>
          <Label className="text-white mb-2 block">Nickname</Label>
          <Input
            value={formData.nickname}
            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
            placeholder="Your display name"
            className="bg-[#2a2a2a] border-gray-700 text-white"
          />
        </div>

        <div>
          <Label className="text-white mb-2 block">Bio</Label>
          <Textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell us about yourself..."
            className="bg-[#2a2a2a] border-gray-700 text-white min-h-[100px]"
          />
        </div>

        <div>
          <Label className="text-white mb-2 block">Website</Label>
          <Input
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://yourwebsite.com"
            className="bg-[#2a2a2a] border-gray-700 text-white"
          />
        </div>

        <div>
          <Label className="text-white mb-2 block">Location</Label>
          <Input
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="City, Country"
            className="bg-[#2a2a2a] border-gray-700 text-white"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-gradient-to-r from-purple-600 to-cyan-600"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}