import React, { useState, useEffect } from 'react';
import { auth } from '@/api/sdk';
import { Note } from '@/api/entities';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import EmptyState from '../components/common/EmptyState';
import { useTheme } from '@/lib/theme';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Notes() {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const queryClient = useQueryClient();
  const { isLight } = useTheme();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await auth.me();
        setUser(userData);
      } catch (e) {}
    };
    loadUser();
  }, []);

  const { data: notes = [] } = useQuery({
    queryKey: ['notes', user?.email],
    queryFn: () => user ? Note.filter({ created_by: user.email }, '-created_date') : [],
    enabled: !!user,
  });

  const addNoteMutation = useMutation({
    mutationFn: (data) => Note.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['notes', user?.email]);
      setNoteTitle('');
      setNoteContent('');
      setIsOpen(false);
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id) => Note.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['notes', user?.email]),
  });

  const handleAddNote = () => {
    if (!noteTitle.trim() || !noteContent.trim() || !user) return;
    addNoteMutation.mutate({
      title: noteTitle,
      content: noteContent,
    });
  };

  const bgColor = isLight ? 'bg-white' : 'bg-[#1a1a1a]';
  const textColor = isLight ? 'text-black' : 'text-white';
  const borderColor = isLight ? 'border-gray-200' : 'border-gray-800';
  const cardBg = isLight ? 'bg-gray-50' : 'bg-[#2a2a2a]';
  const textMuted = isLight ? 'text-gray-600' : 'text-gray-400';
  const inputBg = isLight ? 'bg-gray-100' : 'bg-[#2a2a2a]';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-2xl font-bold ${textColor}`}>Notes</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent className={`${bgColor} ${borderColor} ${textColor}`}>
            <DialogHeader>
              <DialogTitle className={textColor}>Create New Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Note title..."
                className={`${inputBg} ${isLight ? 'border-gray-200' : 'border-gray-700'} ${textColor}`}
              />
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your note..."
                className={`${inputBg} ${isLight ? 'border-gray-200' : 'border-gray-700'} ${textColor} min-h-[150px]`}
              />
              <Button onClick={handleAddNote} className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white">
                Save Note
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {notes.length === 0 ? (
        <EmptyState type="post" message="No notes yet" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div key={note.id} className={`${cardBg} rounded-xl p-4 border ${borderColor}`}>
              <div className="flex items-start justify-between mb-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <div className="flex gap-2">
                  <button className={`${textMuted} hover:text-cyan-400 transition-colors`}>
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteNoteMutation.mutate(note.id)}
                    className={`${textMuted} hover:text-red-400 transition-colors`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className={`${textColor} font-medium mb-2`}>{note.title}</h3>
              <p className={`${textMuted} text-sm line-clamp-3 whitespace-pre-wrap`}>{note.content}</p>
              <p className="text-gray-500 text-xs mt-3">Created recently</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
