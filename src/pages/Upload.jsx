import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/theme';
import { Post } from '@/api/entities';
import { Upload as UploadIcon, Trash2, BarChart2, Image, FileText, Plus, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { createPageUrl } from '../utils';

const CATEGORIES = [
  'Gaming', 'Podcasts', 'Pranks & Comedy', 'Geopolitics', 'React Videos',
  'Music', 'Sports', 'Tech & Science', 'Cooking & Food', 'Travel & Adventure',
  'Fashion & Beauty', 'Health & Wellness',
  'Business & Entrepreneurship', 'Finance & Investing', 'Self-Help & Motivation',
  'News & Current Events', 'Animals & Nature',
  'DIY & Crafts', 'Art & Design', 'Anime & Manga', 'Movies & TV',
  'Crypto & Web3', 'Cars & Automotive', 'Spirituality',
  'Parenting & Family', 'Relationships & Dating', 'Philosophy & History',
];

const SUBCATEGORIES = {
  'Gaming': ['PC Gaming', 'Console Gaming', 'Mobile Gaming', 'Esports', 'Game Reviews', 'Game Dev', 'Retro Gaming', 'VR Gaming', 'Speedrunning', "Let's Play"],
  'Podcasts': ['True Crime', 'Comedy', 'Business', 'Science', 'History', 'Society', 'Interview', 'Storytelling', 'News', 'Health'],
  'Pranks & Comedy': ['Public Pranks', 'Office Pranks', 'Prank Calls', 'Hidden Camera', 'Social Experiments', 'Stand Up', 'Skits', 'Memes'],
  'Geopolitics': ['Middle East', 'Europe', 'Asia Pacific', 'Americas', 'Africa', 'NATO & Defense', 'Trade Wars', 'Elections', 'Diplomacy', 'Conflict Zones'],
  'React Videos': ['Music Reactions', 'Movie Reactions', 'News Reactions', 'Gameplay Reactions', 'Blind Reactions', 'First Listen', 'Debate Reactions'],
  'Music': ['Hip Hop', 'Pop', 'Rock', 'Electronic', 'Classical', 'Jazz', 'R&B', 'Country', 'Metal', 'Lo-fi'],
  'Sports': ['Football', 'Basketball', 'Soccer', 'Tennis', 'Baseball', 'MMA / UFC', 'Boxing', 'Olympics', 'Extreme Sports', 'Highlights'],
  'Tech & Science': ['AI & Machine Learning', 'Programming', 'Gadgets & Reviews', 'Cybersecurity', 'Space & Astronomy', 'Biology', 'Physics', 'Engineering'],
  'Cooking & Food': ['Recipes', 'Baking', 'BBQ & Grilling', 'Vegan', 'Street Food', 'Fine Dining', 'Quick Meals', 'World Cuisine'],
  'Travel & Adventure': ['Backpacking', 'Luxury Travel', 'Road Trips', 'Solo Travel', 'Budget Travel', 'Travel Hacks', 'City Guides'],
  'Fashion & Beauty': ['Streetwear', 'Luxury Fashion', 'Makeup Tutorials', 'Skincare', 'Hairstyles', 'Outfit Ideas'],
  'Health & Wellness': ['Nutrition', 'Sleep', 'Immune Health', 'Gut Health', 'Mental Health', 'Longevity', 'Biohacking'],
  'Business & Entrepreneurship': ['Startup Stories', 'Marketing', 'Sales', 'Leadership', 'Side Hustle', 'E-commerce', 'Branding'],
  'Finance & Investing': ['Stock Market', 'Real Estate', 'Crypto', 'Personal Finance', 'Index Funds', 'Budgeting'],
  'Self-Help & Motivation': ['Productivity', 'Habits', 'Mindset', 'Goal Setting', 'Confidence', 'Morning Routines', 'Discipline'],
  'News & Current Events': ['World News', 'Political Analysis', 'Economy', 'Technology News', 'Environmental'],
  'Animals & Nature': ['Dogs', 'Cats', 'Wildlife', 'Ocean Life', 'Birds', 'Conservation'],
  'DIY & Crafts': ['Woodworking', 'Knitting', 'Home Improvement', '3D Printing', 'Painting'],
  'Art & Design': ['Digital Art', 'Illustration', 'Graphic Design', 'Photography', 'Animation'],
  'Anime & Manga': ['Shonen', 'Shojo', 'Isekai', 'Slice of Life', 'Reviews', 'Rankings'],
  'Movies & TV': ['Movie Reviews', 'TV Show Reviews', 'Fan Theories', 'Best Lists', 'Trailers'],
  'Crypto & Web3': ['Bitcoin', 'Ethereum', 'Altcoins', 'NFTs', 'DeFi', 'Blockchain Tech'],
  'Cars & Automotive': ['Car Reviews', 'EV & Tesla', 'Supercars', 'Motorcycles', 'Racing'],
  'Spirituality': ['Meditation', 'Astrology', 'Manifestation', 'Religion & Faith'],
  'Parenting & Family': ['Baby & Toddler', 'Parenting Tips', 'Homeschooling', 'Family Activities'],
  'Relationships & Dating': ['Dating Advice', 'Marriage', 'Breakups & Healing', 'Social Skills'],
  'Philosophy & History': ['Ancient Philosophy', 'Modern Philosophy', 'World History', 'Ethics & Morality'],
};

import { videoService } from '../services/videoService';

import SuccessModal from '@/components/common/SuccessModal';

export default function Upload() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isLight } = useTheme();
  const [activeTab, setActiveTab] = useState('Video');
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Post type: 'text' | 'image' | 'poll'
  const [postType, setPostType] = useState('text');
  const [pollOptions, setPollOptions] = useState(['', '']);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    privacy: 'public',
    videoFile: null,
    thumbnailFile: null,
    imageFile: null,
    content: '',
  });

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) setFormData({ ...formData, [`${type}File`]: file });
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setFormData({ ...formData, [`${type}File`]: file });
  };

  const isFormComplete = () => {
    if (activeTab === 'Video' || activeTab === 'Clips') {
      return formData.title && formData.category && formData.subcategory && formData.videoFile;
    } else if (activeTab === 'Posts') {
      if (!formData.title) return false;
      if (postType === 'text') return formData.content.trim().length > 0;
      if (postType === 'image') return !!formData.imageFile;
      if (postType === 'poll') return pollOptions.filter(o => o.trim()).length >= 2;
    }
    return false;
  };

  const handlePublishClick = () => {
    if (!user) { toast.error('Please log in to upload content'); return; }
    setShowConfirmDialog(true);
  };

  const captureFirstFrame = (videoFile) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(videoFile);
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        // Seek to 0.1 to avoid possible black frame at 0
        video.currentTime = 0.1;
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          // Clean up URL object
          URL.revokeObjectURL(video.src);
          if (blob) {
            const file = new File([blob], "thumbnail.jpg", { type: "image/jpeg" });
            resolve(file);
          } else {
            reject(new Error("Failed to capture frame"));
          }
        }, 'image/jpeg', 0.85);
      };

      video.onerror = (e) => {
        URL.revokeObjectURL(video.src);
        reject(e);
      };
    });
  };

  const handleConfirmPublish = async () => {
    setShowConfirmDialog(false);
    setIsUploading(true);
    try {
      let thumbnailUrl = '';
      let videoUrl = '';
      let imageUrl = '';

      let finalThumbnailFile = formData.thumbnailFile;
      
      // Auto-generate thumbnail if missing for video/clips
      if (!finalThumbnailFile && (activeTab === 'Video' || activeTab === 'Clips') && formData.videoFile) {
        try {
          finalThumbnailFile = await captureFirstFrame(formData.videoFile);
        } catch (e) {
          console.error("Error generating thumbnail:", e);
        }
      }

      if (finalThumbnailFile) {
        thumbnailUrl = await videoService.uploadFile(finalThumbnailFile, 'thumbnails');
      }
      if (formData.videoFile) {
        videoUrl = await videoService.uploadFile(formData.videoFile, 'videos');
      }
      if (formData.imageFile) {
        imageUrl = await videoService.uploadFile(formData.imageFile, 'posts');
      }

      const baseData = { 
        creator_id: user.id, 
        creator_name: user.display_name || user.username || user.email?.split('@')[0] || 'User', 
        creator_avatar: user.avatar_url || '',
        privacy: formData.privacy,
      };

      if (activeTab === 'Video' || activeTab === 'Clips') {
        const data = {
          ...baseData,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          subcategory: formData.subcategory,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          views: 0,
          likes_count: 0,
        };
        console.log(`Publishing ${activeTab}:`, data);
        if (activeTab === 'Video') {
          await videoService.uploadVideo(data);
        } else {
          await videoService.uploadClip(data);
        }
      } else if (activeTab === 'Posts') {
        const postData = {
          ...baseData,
          title: formData.title,
          content: postType !== 'poll' ? formData.content : '',
          image_url: postType === 'image' ? imageUrl : '',
          is_poll: postType === 'poll',
          poll_options: postType === 'poll' ? pollOptions.filter(o => o.trim()).map(text => ({ text, votes: 0 })) : [],
          likes_count: 0,
          comments_count: 0,
        };
        console.log('Publishing Post:', postData);
        await Post.create(postData);
      }

      setIsUploading(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.message || error.error_description || 'Failed to upload content';
      toast.error(`Upload failed: ${errorMessage}`);
      setIsUploading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate(createPageUrl('Account'));
  };

  const tabs = ['Video', 'Clips', 'Posts'];

  const UploadBox = ({ label, accept, type, hint }) => {
    const hasFile = !!formData[`${type}File`];
    return (
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
          ${dragOver ? 'border-purple-500 bg-purple-500/10' : isLight ? 'border-gray-300 hover:border-purple-500/50' : 'border-gray-600 hover:border-purple-500/50'}
          ${hasFile ? (isLight ? 'border-green-500 bg-green-50' : 'border-green-500 bg-green-900/10') : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => handleDrop(e, type)}
        onClick={() => document.getElementById(`${type}-input`).click()}
      >
        <input id={`${type}-input`} type="file" accept={accept} onChange={(e) => handleFileChange(e, type)} className="hidden" />
        <UploadIcon className={`w-8 h-8 mx-auto mb-2 ${hasFile ? 'text-green-500' : isLight ? 'text-gray-400' : 'text-gray-500'}`} />
        <p className={hasFile ? 'text-green-500 font-medium' : 'text-cyan-400'}>
          {hasFile ? formData[`${type}File`].name : hint}
        </p>
      </div>
    );
  };

  const inputCls = isLight ? 'bg-gray-100 border-gray-300 text-black' : 'bg-[#2a2a2a] border-gray-700 text-white';
  const labelCls = `mb-2 block ${isLight ? 'text-black' : 'text-white'}`;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className={`text-2xl font-bold mb-6 ${isLight ? 'text-black' : 'text-white'}`}>Upload Zone</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? isLight ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
                : isLight ? 'bg-white text-black border border-gray-300 hover:bg-gray-50' : 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* VIDEO / CLIPS upload boxes */}
        {(activeTab === 'Video' || activeTab === 'Clips') && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className={labelCls}>{activeTab === 'Clips' ? 'Upload Vertical Video (9:16)' : 'Upload Video'}</Label>
              <UploadBox accept="video/mp4" type="video" hint="Drop MP4 here or click" />
            </div>
            <div>
              <Label className={labelCls}>Upload Thumbnail</Label>
              <UploadBox accept="image/png,image/jpeg" type="thumbnail" hint="Drop PNG/JPG here or click" />
            </div>
          </div>
        )}

        {/* POST TYPE SELECTOR */}
        {activeTab === 'Posts' && (
          <div>
            <Label className={labelCls}>Post Type</Label>
            <div className="flex gap-2">
              {[
                { id: 'text', icon: FileText, label: 'Text' },
                { id: 'image', icon: Image, label: 'Image' },
                { id: 'poll', icon: BarChart2, label: 'Poll' },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setPostType(id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    postType === id
                      ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                      : isLight ? 'border-gray-300 text-gray-700 hover:border-gray-400' : 'border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Title */}
        <div>
          <Label className={labelCls}>Title</Label>
          <div className="relative">
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={activeTab === 'Posts' ? 'Post title or question...' : 'Video title'}
              maxLength={100}
              className={inputCls}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 text-xs">{formData.title.length}/100</span>
          </div>
        </div>

        {/* TEXT post content */}
        {activeTab === 'Posts' && postType === 'text' && (
          <div>
            <Label className={labelCls}>Content</Label>
            <div className="relative">
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Share your thoughts, ideas, or insights..."
                maxLength={2000}
                className={`min-h-[150px] resize-none ${inputCls}`}
              />
              <span className={`absolute right-3 bottom-3 text-cyan-400 text-xs`}>{formData.content.length}/2000</span>
            </div>
          </div>
        )}

        {/* IMAGE post upload */}
        {activeTab === 'Posts' && postType === 'image' && (
          <div>
            <Label className={labelCls}>Image</Label>
            <UploadBox accept="image/png,image/jpeg,image/webp" type="image" hint="Drop an image here or click to browse" />
            <div className="mt-3">
              <Label className={labelCls}>Caption (optional)</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Add a caption..."
                maxLength={500}
                className={`min-h-[80px] resize-none ${inputCls}`}
              />
            </div>
          </div>
        )}

        {/* POLL post builder */}
        {activeTab === 'Posts' && postType === 'poll' && (
          <div>
            <Label className={labelCls}>Poll Options</Label>
            <div className="space-y-2">
              {pollOptions.map((option, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const next = [...pollOptions];
                      next[idx] = e.target.value;
                      setPollOptions(next);
                    }}
                    placeholder={`Option ${idx + 1}`}
                    maxLength={80}
                    className={inputCls}
                  />
                  {pollOptions.length > 2 && (
                    <button
                      onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                      className="text-red-400 hover:text-red-300 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {pollOptions.length < 6 && (
                <button
                  onClick={() => setPollOptions([...pollOptions, ''])}
                  className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-dashed transition-colors ${isLight ? 'border-gray-300 text-gray-600 hover:border-purple-400' : 'border-gray-700 text-gray-400 hover:border-purple-600'}`}
                >
                  <Plus className="w-4 h-4" />
                  Add Option
                </button>
              )}
            </div>
          </div>
        )}

        {/* Video Description */}
        {(activeTab === 'Video' || activeTab === 'Clips') && (
          <div>
            <Label className={labelCls}>Description</Label>
            <div className="relative">
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your video..."
                maxLength={2000}
                className={`min-h-[120px] resize-none ${inputCls}`}
              />
              <span className="absolute right-3 bottom-3 text-cyan-400 text-xs">{formData.description.length}/2000</span>
            </div>
          </div>
        )}

        {/* Category & Subcategory */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className={labelCls}>Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value, subcategory: '' })}>
              <SelectTrigger className={inputCls}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className={isLight ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-gray-700'}>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} className={isLight ? 'text-black' : 'text-white'}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(activeTab === 'Video' || activeTab === 'Clips') && (
            <div>
              <Label className={labelCls}>Subcategory</Label>
              <Select
                value={formData.subcategory}
                onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
                disabled={!formData.category}
              >
                <SelectTrigger className={inputCls}>
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent className={isLight ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-gray-700'}>
                  {(SUBCATEGORIES[formData.category] || []).map((sub) => (
                    <SelectItem key={sub} value={sub} className={isLight ? 'text-black' : 'text-white'}>{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Privacy */}
        <div>
          <Label className={labelCls}>Privacy</Label>
          <Select value={formData.privacy} onValueChange={(value) => setFormData({ ...formData, privacy: value })}>
            <SelectTrigger className={`w-48 ${inputCls}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={isLight ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-gray-700'}>
              <SelectItem value="public" className={isLight ? 'text-black' : 'text-white'}>Public</SelectItem>
              <SelectItem value="private" className={isLight ? 'text-black' : 'text-white'}>Private</SelectItem>
              <SelectItem value="unlisted" className={isLight ? 'text-black' : 'text-white'}>Unlisted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Submit */}
        <Button
          onClick={handlePublishClick}
          disabled={isUploading || !isFormComplete()}
          className={`w-full py-8 font-bold text-xl rounded-2xl transition-all ${
            !isFormComplete() || isUploading
              ? (isLight ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white/5 text-gray-600 cursor-not-allowed opacity-40')
              : 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:opacity-90 shadow-xl shadow-purple-500/20'
          }`}
        >
          {isUploading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              Publishing...
            </div>
          ) : 'Publish'}
        </Button>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className={isLight ? 'bg-white' : 'bg-[#2a2a2a] border-gray-700'}>
          <DialogHeader>
            <DialogTitle className={isLight ? 'text-black' : 'text-white'}>Confirm Publication</DialogTitle>
            <DialogDescription className={isLight ? 'text-gray-600' : 'text-gray-400'}>
              Are you sure you want to publish "{formData.title}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowConfirmDialog(false)} className={`border-none ${isLight ? 'bg-gray-200 text-black hover:bg-gray-300' : 'bg-[#2a2a2a] text-white hover:bg-[#333]'}`}>Cancel</Button>
            <Button onClick={handleConfirmPublish} className="bg-gradient-to-r from-purple-600 to-cyan-500 text-white">Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SuccessModal 
        open={showSuccessModal} 
        onOpenChange={handleSuccessClose}
        title="Published Successfully! 🎉"
        message="Your content is now live and available for the community to discover."
        buttonText="Go to Account"
      />
    </div>
  );
}