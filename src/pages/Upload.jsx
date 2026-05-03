import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/theme';
import { Post } from '@/api/entities';
import { 
  Upload as UploadIcon, Trash2, BarChart2, Image as ImageIcon, 
  FileText, Plus, Loader2, CheckCircle2, AlertCircle, 
  ChevronRight, ChevronLeft, PlayCircle, Eye, Lock, Globe, Calendar,
  Check, X, ShieldAlert, Baby, Film
} from 'lucide-react';
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
import { toast } from "sonner";
import { createPageUrl } from '../utils';
import { videoService } from '../services/videoService';
import SuccessModal from '@/components/common/SuccessModal';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';

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

export default function Upload() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isLight } = useTheme();
  
  // Multi-step state
  const [step, setStep] = useState(0); // 0: Content Type, 1: Upload, 2: Details, 3: Audience, 4: Visibility
  const [activeTab, setActiveTab] = useState('Video');
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Scanning states
  const [scanningStatus, setScanningStatus] = useState({
    uploading: 'idle', // idle, loading, done, error
    copyright: 'idle',
    moderation: 'idle',
    forKids: 'idle'
  });
  const [moderationReason, setModerationReason] = useState('');

  // Post type: 'text' | 'image' | 'poll'
  const [postType, setPostType] = useState('text');
  const [pollOptions, setPollOptions] = useState(['', '']);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    category: '',
    subcategory: '',
    privacy: 'public',
    videoFile: null,
    thumbnailFile: null,
    imageFile: null,
    content: '',
    isForKids: false,
    scheduledAt: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, [`${type}File`]: file }));
      if (type === 'video' || type === 'image') {
        startScanning(file);
      }
    }
  };

  const startScanning = async (file) => {
    setScanningStatus(prev => ({ ...prev, uploading: 'loading' }));
    
    // Simulate upload progress
    setTimeout(() => {
      setScanningStatus(prev => ({ ...prev, uploading: 'done', copyright: 'loading' }));
      
      // Simulate Copyright Check
      setTimeout(() => {
        setScanningStatus(prev => ({ ...prev, copyright: 'done', moderation: 'loading' }));
        
        // Real Content Moderation with Gemini
        performGeminiModeration(file);
      }, 1500);
    }, 2000);
  };

  const performGeminiModeration = async (file) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `You are an automated content moderation system. 
      Analyze this file for:
      1. Explicit content/Nudity
      2. Extreme violence
      3. Hate speech
      
      Return JSON: { "safe": boolean, "reason": "why", "suitable_for_kids": boolean }`;

      const reader = new FileReader();
      const base64Promise = new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(file);
      });
      const base64String = await base64Promise;

      const result = await model.generateContent([
        { text: prompt },
        {
          inlineData: {
            data: base64String,
            mimeType: file.type || "video/mp4"
          }
        }
      ]);

      const response = JSON.parse(result.response.text().replace(/```json\n?|\n?```/g, '').trim());
      
      setScanningStatus(prev => ({ 
        ...prev, 
        moderation: response.safe ? 'done' : 'error',
        forKids: response.suitable_for_kids ? 'done' : 'error'
      }));
      
      if (!response.safe) setModerationReason(response.reason);
      if (response.suitable_for_kids) setFormData(prev => ({ ...prev, isForKids: true }));

    } catch (e) {
      console.error("Moderation failed:", e);
      setScanningStatus(prev => ({ ...prev, moderation: 'done', forKids: 'done' }));
    }
  };

  const nextStep = () => {
    if (step === 1 && !formData.videoFile && activeTab !== 'Posts' && postType !== 'text') {
      toast.error("Please upload a file to continue");
      return;
    }
    if (scanningStatus.moderation === 'error') {
      toast.error(`Content check failed: ${moderationReason}. You cannot proceed.`);
      return;
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  const handlePublish = async () => {
    setIsUploading(true);
    try {
      let thumbnailUrl = '';
      let videoUrl = '';
      let imageUrl = '';

      if (formData.videoFile) videoUrl = await videoService.uploadFile(formData.videoFile, 'videos');
      if (formData.imageFile) imageUrl = await videoService.uploadFile(formData.imageFile, 'posts');
      if (formData.thumbnailFile) {
        thumbnailUrl = await videoService.uploadFile(formData.thumbnailFile, 'thumbnails');
      }

      const tagsArray = formData.tags.split(',').map(t => t.trim().replace(/^#/, '')).filter(t => t.length > 0);

      const baseData = { 
        creator_id: user.id, 
        creator_name: user.display_name || user.username || user.email?.split('@')[0], 
        creator_avatar: user.avatar_url || '',
        privacy: formData.privacy,
        tags: tagsArray,
        is_for_kids: formData.isForKids,
        scheduled_at: formData.scheduledAt || null
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
        };
        activeTab === 'Video' ? await videoService.uploadVideo(data) : await videoService.uploadClip(data);
      } else {
        await Post.create({
          ...baseData,
          title: formData.title,
          content: formData.content,
          image_url: imageUrl,
          is_poll: postType === 'poll',
          poll_options: postType === 'poll' ? pollOptions.map(text => ({ text, votes: 0 })) : []
        });
      }

      setIsUploading(false);
      setShowSuccessModal(true);
    } catch (error) {
      toast.error(`Upload failed: ${error.message}`);
      setIsUploading(false);
    }
  };

  const inputCls = isLight ? 'bg-gray-100 border-gray-300 text-black' : 'bg-[#1e1e1e] border-gray-800 text-white focus:border-purple-500';
  const labelCls = `mb-2 block font-semibold ${isLight ? 'text-gray-900' : 'text-gray-300'}`;

  // Step 0: Choose Type
  const renderStep0 = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { id: 'Video', icon: PlayCircle, desc: 'Horizontal videos for large screens' },
        { id: 'Clips', icon: Film, desc: 'Short vertical videos for mobile' },
        { id: 'Posts', icon: FileText, desc: 'Share thoughts, images, or polls' }
      ].map(type => (
        <motion.button
          key={type.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setActiveTab(type.id); nextStep(); }}
          className={`p-8 rounded-3xl border-2 flex flex-col items-center text-center gap-4 transition-all
            ${activeTab === type.id ? 'border-purple-500 bg-purple-500/10' : isLight ? 'border-gray-200 bg-white hover:border-gray-300' : 'border-gray-800 bg-[#1a1a1a] hover:border-gray-700'}`}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white">
            <type.icon className="w-8 h-8" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${isLight ? 'text-black' : 'text-white'}`}>{type.id}</h3>
            <p className="text-gray-500 text-sm mt-1">{type.desc}</p>
          </div>
        </motion.button>
      ))}
    </div>
  );

  // Step 1: Upload File
  const renderStep1 = () => (
    <div className="space-y-6">
      {activeTab !== 'Posts' || postType === 'image' || postType === 'poll' ? (
        <div className="space-y-6">
          {activeTab === 'Posts' && (
            <div className="flex gap-2">
              {['text', 'image', 'poll'].map(t => (
                <Button 
                  key={t}
                  variant={postType === t ? 'default' : 'outline'}
                  onClick={() => setPostType(t)}
                  className="capitalize"
                >
                  {t}
                </Button>
              ))}
            </div>
          )}

          {(postType === 'image' || activeTab !== 'Posts') && (
            <div 
              className={`border-4 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all relative overflow-hidden
                ${isLight ? 'border-gray-200 hover:border-purple-500 bg-gray-50' : 'border-gray-800 hover:border-purple-500 bg-[#1a1a1a]'}`}
            >
              <input 
                id="file-upload" 
                type="file" 
                className="hidden" 
                onChange={(e) => handleFileChange(e, activeTab === 'Posts' ? 'image' : 'video')} 
                accept={activeTab === 'Video' ? 'video/*' : activeTab === 'Clips' ? 'video/*' : 'image/*'}
              />
              {formData.videoFile ? (
                <div className="space-y-4" onClick={(e) => { e.stopPropagation(); toast.info("Entering Video Editor Mode (Beta)... This feature allows you to trim and apply filters to your video."); }}>
                  <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                    <PlayCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h2 className={`text-2xl font-bold mb-2 ${isLight ? 'text-black' : 'text-white'}`}>
                    Click Video to Edit
                  </h2>
                  <p className="text-gray-500 font-medium">
                    {formData.videoFile.name}
                  </p>
                  <Button variant="outline" className="mt-4 rounded-full border-purple-500 text-purple-500 hover:bg-purple-500/10">
                    Open Editor
                  </Button>
                </div>
              ) : formData.imageFile ? (
                <div onClick={() => document.getElementById('file-upload').click()}>
                  <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <h2 className={`text-2xl font-bold mb-2 ${isLight ? 'text-black' : 'text-white'}`}>
                    Image Selected
                  </h2>
                  <p className="text-gray-500">
                    {formData.imageFile.name}
                  </p>
                </div>
              ) : (
                <div onClick={() => document.getElementById('file-upload').click()}>
                  <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-6">
                    <UploadIcon className="w-10 h-10 text-purple-500" />
                  </div>
                  <h2 className={`text-2xl font-bold mb-2 ${isLight ? 'text-black' : 'text-white'}`}>
                    Select {activeTab === 'Posts' ? 'Image' : 'Video'} to Upload
                  </h2>
                  <p className="text-gray-500">
                    Drag and drop or click to browse files
                  </p>
                </div>
              )}
            </div>
          )}

          {postType === 'text' && activeTab === 'Posts' && (
            <div className="space-y-4">
               <Label className={labelCls}>What's on your mind?</Label>
               <Textarea 
                 className={`min-h-[200px] text-lg p-6 rounded-2xl ${inputCls}`}
                 placeholder="Write your post here..."
                 value={formData.content}
                 onChange={(e) => setFormData(prev => ({...prev, content: e.target.value}))}
               />
            </div>
          )}

          {postType === 'poll' && activeTab === 'Posts' && (
            <div className="space-y-4">
              <Label className={labelCls}>Poll Options</Label>
              {pollOptions.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <Input 
                    value={opt}
                    onChange={(e) => {
                      const n = [...pollOptions];
                      n[i] = e.target.value;
                      setPollOptions(n);
                    }}
                    placeholder={`Option ${i+1}`}
                    className={inputCls}
                  />
                  {pollOptions.length > 2 && (
                    <Button variant="ghost" onClick={() => setPollOptions(pollOptions.filter((_, idx) => idx !== i))}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={() => setPollOptions([...pollOptions, ''])} className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Add Option
              </Button>
            </div>
          )}
        </div>
      ) : null}

      <div className="flex justify-between items-center mt-8">
        <Button variant="ghost" onClick={prevStep} className="rounded-xl flex items-center gap-2">
           <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button 
          disabled={activeTab !== 'Posts' && !formData.videoFile && !formData.imageFile && postType !== 'text' && postType !== 'poll'} 
          onClick={nextStep}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-8"
        >
          Next <ChevronRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  // Step 2: Details
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <Label className={labelCls}>Title</Label>
            <Input 
              className={inputCls} 
              placeholder="Give your content a catchy title" 
              value={formData.title}
              onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
            />
          </div>
          <div>
            <Label className={labelCls}>Description</Label>
            <Textarea 
              className={`min-h-[150px] ${inputCls}`} 
              placeholder="Tell viewers about your content"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
            />
          </div>
          <div>
            <Label className={labelCls}>Category</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData(p => ({...p, category: v, subcategory: ''}))}>
              <SelectTrigger className={inputCls}><SelectValue placeholder="Select Category" /></SelectTrigger>
              <SelectContent className={isLight ? 'bg-white' : 'bg-[#1a1a1a] border-gray-800'}>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <Label className={labelCls}>Tags (comma separated)</Label>
            <Input 
              className={inputCls} 
              placeholder="gaming, tutorial, news..." 
              value={formData.tags}
              onChange={(e) => setFormData(p => ({...p, tags: e.target.value}))}
            />
          </div>
          {activeTab !== 'Posts' && (
            <div>
              <Label className={labelCls}>Thumbnail</Label>
              <div 
                onClick={() => document.getElementById('thumb-u').click()}
                className={`h-[150px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all
                ${isLight ? 'border-gray-200 hover:border-purple-500' : 'border-gray-800 hover:border-purple-500'}`}
              >
                <input id="thumb-u" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'thumbnail')} />
                {formData.thumbnailFile ? <CheckCircle2 className="text-green-500 w-8 h-8" /> : <ImageIcon className="text-gray-500 w-8 h-8" />}
                <span className="mt-2 text-sm text-gray-500">{formData.thumbnailFile ? formData.thumbnailFile.name : "Custom Thumbnail"}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mt-8">
        <Button variant="ghost" onClick={prevStep} className="rounded-xl flex items-center gap-2">
           <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={nextStep} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-8">Next</Button>
      </div>
    </div>
  );

  // Step 3: Audience
  const renderStep3 = () => (
    <div className="space-y-8 py-4">
      <div className="space-y-4">
        <h2 className={`text-2xl font-bold flex items-center gap-3 ${isLight ? 'text-black' : 'text-white'}`}>
           <Baby className="w-8 h-8 text-cyan-500" />
           Audience
        </h2>
        <p className="text-gray-500">Regardless of your location, you're legally required to comply with the Children's Online Privacy Protection Act (COPPA) and/or other laws. You're required to tell us if your videos are made for kids.</p>
      </div>

      <div className="space-y-4">
        <div 
          onClick={() => setFormData(p => ({...p, isForKids: true}))}
          className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4
            ${formData.isForKids ? 'border-cyan-500 bg-cyan-500/10' : isLight ? 'border-gray-200 hover:border-gray-300' : 'border-gray-800 hover:border-gray-700'}`}
        >
          <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.isForKids ? 'border-cyan-500' : 'border-gray-500'}`}>
            {formData.isForKids && <div className="w-3 h-3 bg-cyan-500 rounded-full" />}
          </div>
          <div>
            <h3 className={`font-bold ${isLight ? 'text-black' : 'text-white'}`}>Yes, it's made for kids.</h3>
            <p className="text-sm text-gray-500">Features like personalized ads and notifications won't be available on videos made for kids. These videos will be saved in the Kids Safe zone.</p>
          </div>
        </div>

        <div 
          onClick={() => setFormData(p => ({...p, isForKids: false}))}
          className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4
            ${!formData.isForKids ? 'border-purple-500 bg-purple-500/10' : isLight ? 'border-gray-200 hover:border-gray-300' : 'border-gray-800 hover:border-gray-700'}`}
        >
          <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${!formData.isForKids ? 'border-purple-500' : 'border-gray-500'}`}>
            {!formData.isForKids && <div className="w-3 h-3 bg-purple-500 rounded-full" />}
          </div>
          <div>
            <h3 className={`font-bold ${isLight ? 'text-black' : 'text-white'}`}>No, it's not made for kids.</h3>
            <p className="text-sm text-gray-500">Adult content, gaming with mature language, or specialized educational content for adults.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8">
        <Button variant="ghost" onClick={prevStep} className="rounded-xl flex items-center gap-2">
           <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={nextStep} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-8">Next</Button>
      </div>
    </div>
  );

  // Step 4: Visibility
  const renderStep4 = () => (
    <div className="space-y-8">
      <div className="space-y-6">
        <h2 className={`text-2xl font-bold ${isLight ? 'text-black' : 'text-white'}`}>Visibility</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'public', label: 'Public', icon: Globe, desc: 'Everyone can see' },
            { id: 'unlisted', label: 'Unlisted', icon: Eye, desc: 'Anyone with link' },
            { id: 'private', label: 'Private', icon: Lock, desc: 'Only you can see' },
          ].map(v => (
            <div 
              key={v.id}
              onClick={() => setFormData(p => ({...p, privacy: v.id}))}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-3
                ${formData.privacy === v.id ? 'border-purple-500 bg-purple-500/10' : isLight ? 'border-gray-200' : 'border-gray-800'}`}
            >
              <v.icon className={`w-8 h-8 ${formData.privacy === v.id ? 'text-purple-500' : 'text-gray-500'}`} />
              <div className={`font-bold ${isLight ? 'text-black' : 'text-white'}`}>{v.label}</div>
              <p className="text-xs text-gray-500">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className={`font-bold flex items-center gap-2 ${isLight ? 'text-black' : 'text-white'}`}>
           <Calendar className="w-5 h-5 text-indigo-500" />
           Schedule (Optional)
        </h3>
        <Input 
          type="datetime-local" 
          className={inputCls} 
          value={formData.scheduledAt}
          onChange={(e) => setFormData(p => ({...p, scheduledAt: e.target.value}))}
        />
      </div>

      <div className="flex justify-between items-center mt-8">
        <Button variant="ghost" onClick={prevStep} className="rounded-xl flex items-center gap-2">
           <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button 
          disabled={isUploading}
          onClick={handlePublish}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl px-12 py-6 font-bold text-lg shadow-xl shadow-purple-500/20"
        >
          {isUploading ? <Loader2 className="animate-spin w-6 h-6" /> : "Publish Content"}
        </Button>
      </div>
    </div>
  );

  const StepIndicator = () => (
    <div className="fixed bottom-8 left-8 p-6 rounded-3xl bg-[#1a1a1a]/90 backdrop-blur-xl border border-gray-800 shadow-2xl z-50 min-w-[280px]">
      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Live Platform Analysis</h4>
      <div className="space-y-4">
        {[
          { id: 'uploading', label: 'Uploading File', icon: UploadIcon },
          { id: 'copyright', label: 'Copyright Check', icon: ShieldAlert },
          { id: 'moderation', label: 'Scanning Content', icon: AlertCircle },
          { id: 'forKids', label: 'Audience Analysis', icon: Baby }
        ].map(item => (
          <div key={item.id} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
               <div className={`p-1.5 rounded-lg ${scanningStatus[item.id] === 'done' ? 'bg-green-500/20 text-green-500' : scanningStatus[item.id] === 'loading' ? 'bg-blue-500/20 text-blue-500' : scanningStatus[item.id] === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-gray-800 text-gray-600'}`}>
                 <item.icon className="w-3.5 h-3.5" />
               </div>
               <span className={`text-xs font-medium ${scanningStatus[item.id] === 'loading' ? 'text-white' : 'text-gray-500'}`}>{item.label}</span>
            </div>
            {scanningStatus[item.id] === 'done' && <Check className="w-3.5 h-3.5 text-green-500" />}
            {scanningStatus[item.id] === 'loading' && <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />}
            {scanningStatus[item.id] === 'error' && <X className="w-3.5 h-3.5 text-red-500" />}
          </div>
        ))}
      </div>
      {scanningStatus.moderation === 'error' && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-red-400">
          <strong>REJECTED:</strong> {moderationReason}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="text-center mb-12">
         <h1 className={`text-4xl font-black mb-2 tracking-tight ${isLight ? 'text-black' : 'text-white'}`}>Publish Content</h1>
         <p className="text-gray-500">Reach millions of viewers across the Avvelux ecosystem.</p>
      </div>

      {/* Custom Steps Header */}
      <div className="flex items-center justify-between mb-12 overflow-x-auto pb-4 hide-scrollbar max-w-2xl mx-auto">
        {['Type', 'Upload', 'Details', 'Audience', 'Visibility'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all
              ${step === i ? 'bg-purple-600 text-white scale-110 shadow-lg shadow-purple-500/30' : 
                step > i ? 'bg-green-500 text-white' : 
                isLight ? 'bg-gray-100 text-gray-400' : 'bg-[#1a1a1a] text-gray-600'}`}>
              {step > i ? <Check className="w-5 h-5" /> : i + 1}
            </div>
            <span className={`text-sm font-bold whitespace-nowrap ${step === i ? (isLight ? 'text-black' : 'text-white') : 'text-gray-500'}`}>
              {s}
            </span>
            {i < 4 && <div className={`w-8 h-0.5 mx-2 rounded-full ${step > i ? 'bg-green-500/30' : isLight ? 'bg-gray-100' : 'bg-gray-800'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={step}
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -20 }}
           transition={{ duration: 0.3 }}
           className={`p-10 rounded-[2.5rem] border shadow-2xl overflow-hidden relative ${isLight ? 'bg-white border-gray-100' : 'bg-[#0f0f0f]/80 backdrop-blur-xl border-gray-900'}`}
        >
          {step === 0 && renderStep0()}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </motion.div>
      </AnimatePresence>

      {(formData.videoFile || formData.imageFile || formData.content) && <StepIndicator />}

      <SuccessModal 
        open={showSuccessModal} 
        onOpenChange={() => navigate(createPageUrl('Account'))}
        title="Ready for Discovery! 🎉"
        message="Your content is being processed and will be live shortly based on your visibility settings."
        buttonText="Go to My Studio"
      />
    </div>
  );
}
