import React, { useState, useEffect } from 'react';
import { auth } from '@/api/sdk';
import { Group } from '@/api/entities';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Search, Lock, Globe, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useTheme } from '@/lib/theme';

const CATEGORIES = ['All', 'Business', 'Self-Help', 'Gaming', 'Tech', 'Music', 'Sports', 'General'];

const CATEGORY_COVERS = {
  Business: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  'Self-Help': 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400',
  Gaming: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400',
  Tech: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
  Music: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
  Sports: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
  General: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400',
};

export default function Groups() {
  const { isLight } = useTheme();
  const qc = useQueryClient();
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: 'General', is_public: true });

  useEffect(() => { auth.me().then(setUser).catch(() => {}); }, []);

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: () => Group.list('-created_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => Group.create(data),
    onSuccess: () => { qc.invalidateQueries(['groups']); setShowCreate(false); setForm({ name: '', description: '', category: 'General', is_public: true }); },
  });

  const joinMutation = useMutation({
    mutationFn: ({ group, userId }) => {
      const members = [...(group.member_ids || []), userId];
      return Group.update(group.id, { member_ids: members, member_count: members.length });
    },
    onSuccess: () => qc.invalidateQueries(['groups']),
  });

  const leaveMutation = useMutation({
    mutationFn: ({ group, userId }) => {
      const members = (group.member_ids || []).filter(id => id !== userId);
      return Group.update(group.id, { member_ids: members, member_count: members.length });
    },
    onSuccess: () => qc.invalidateQueries(['groups']),
  });

  const handleCreate = () => {
    if (!form.name.trim() || !user) return;
    createMutation.mutate({
      ...form,
      creator_id: user.id,
      creator_name: user.full_name,
      member_ids: [user.id],
      member_count: 1,
      image_url: CATEGORY_COVERS[form.category],
    });
  };

  const filtered = groups.filter(g => {
    const matchCat = activeCategory === 'All' || g.category === activeCategory;
    const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const cardBg = isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#2a2a2a] border-gray-800';
  const text = isLight ? 'text-gray-900' : 'text-white';
  const muted = isLight ? 'text-gray-500' : 'text-gray-400';

  return (
    <div className={`min-h-screen ${isLight ? 'bg-white' : 'bg-[#1a1a1a]'} ${text}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Communities</h1>
          <p className={`text-sm ${muted}`}>Find your community</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-gradient-to-r from-purple-600 to-cyan-500 text-white">
          <Plus className="w-4 h-4 mr-1" /> Create Community
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${muted}`} />
        <Input
          placeholder="Search communities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`pl-10 ${isLight ? 'bg-gray-100 border-gray-200' : 'bg-[#2a2a2a] border-gray-700'} ${text}`}
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat
                ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white'
                : isLight ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Communities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(group => {
          const isMember = user && (group.member_ids || []).includes(user.id);
          return (
            <div key={group.id} className={`border rounded-2xl overflow-hidden ${cardBg}`}>
              <img
                src={group.image_url || CATEGORY_COVERS[group.category] || CATEGORY_COVERS.General}
                alt={group.name}
                className="w-full h-28 object-cover"
              />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold leading-tight line-clamp-1">{group.name}</h3>
                  {group.is_public ? <Globe className={`w-4 h-4 flex-shrink-0 ${muted}`} /> : <Lock className={`w-4 h-4 flex-shrink-0 ${muted}`} />}
                </div>
                <p className={`text-xs ${muted} mb-1`}>{group.category}</p>
                <p className={`text-sm ${muted} line-clamp-2 mb-3`}>{group.description || 'No description.'}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs flex items-center gap-1 ${muted}`}>
                    <Users className="w-3.5 h-3.5" /> {group.member_count || 0} members
                  </span>
                  <div className="flex gap-2">
                    {isMember ? (
                      <>
                        <Link to={createPageUrl(`Forum?groupId=${group.id}`)} className="text-xs text-purple-400 hover:underline flex items-center gap-1">
                          Forum <ArrowRight className="w-3 h-3" />
                        </Link>
                        <button
                          onClick={() => leaveMutation.mutate({ group, userId: user.id })}
                          className={`text-xs ${muted} hover:text-red-400 transition-colors`}
                        >Leave</button>
                      </>
                    ) : (
                      <button
                        onClick={() => user && joinMutation.mutate({ group, userId: user.id })}
                        className="text-xs bg-gradient-to-r from-purple-600 to-cyan-500 text-white px-3 py-1 rounded-full hover:opacity-90"
                      >Join</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className={`text-center py-16 ${muted}`}>
          <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No communities found. Be the first to create one!</p>
        </div>
      )}

      {/* Create Community Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className={isLight ? 'bg-white' : 'bg-[#2a2a2a] border-gray-700 text-white'}>
          <DialogHeader>
            <DialogTitle className={text}>Create a Community</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              placeholder="Community name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className={isLight ? '' : 'bg-[#1a1a1a] border-gray-700 text-white'}
            />
            <textarea
              placeholder="Description (optional)"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className={`w-full rounded-md border px-3 py-2 text-sm resize-none h-20 ${isLight ? 'border-gray-200 bg-white' : 'bg-[#1a1a1a] border-gray-700 text-white'}`}
            />
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className={`w-full rounded-md border px-3 py-2 text-sm ${isLight ? 'border-gray-200 bg-white text-gray-900' : 'bg-[#1a1a1a] border-gray-700 text-white'}`}
            >
              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <label className={`flex items-center gap-2 text-sm cursor-pointer ${muted}`}>
              <input type="checkbox" checked={form.is_public} onChange={e => setForm({ ...form, is_public: e.target.checked })} />
              Public community
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} className="bg-gradient-to-r from-purple-600 to-cyan-500 text-white" disabled={!form.name.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}