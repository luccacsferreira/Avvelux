import React from 'react';
import { Film, FileText, Image, ListVideo } from 'lucide-react';

const icons = {
  video: Film,
  clip: Film,
  post: FileText,
  image: Image,
  playlist: ListVideo,
};

export default function EmptyState({ type = 'video', message }) {
  const Icon = icons[type] || Film;
  const defaultMessages = {
    video: 'No videos yet',
    clip: 'No clips yet',
    post: 'No posts yet',
    playlist: 'No playlists yet',
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      <Icon className="w-16 h-16 mb-4 opacity-50" />
      <p className="text-lg">{message || defaultMessages[type]}</p>
    </div>
  );
}