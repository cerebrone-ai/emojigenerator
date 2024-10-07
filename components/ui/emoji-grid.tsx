'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, Heart } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type Emoji = {
  id: string;
  image_url: string;
  likes: number;
};

export default function EmojiGrid() {
  const [emojis, setEmojis] = useState<Emoji[]>([]);

  useEffect(() => {
    fetchEmojis();
  }, []);

  const fetchEmojis = async () => {
    const { data, error } = await supabase
      .from('emojis')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching emojis:', error);
    } else {
      setEmojis(data || []);
    }
  };

  const handleLike = async (id: string) => {
    const { data, error } = await supabase
      .from('emojis')
      .update({ likes: emojis.find(e => e.id === id)!.likes + 1 })
      .eq('id', id);

    if (error) {
      console.error('Error updating likes:', error);
    } else {
      setEmojis(emojis.map(emoji => 
        emoji.id === id ? { ...emoji, likes: emoji.likes + 1 } : emoji
      ));
    }
  };

  const handleDownload = (imageUrl: string) => {
    window.open(imageUrl, '_blank');
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {emojis.map((emoji) => (
        <div key={emoji.id} className="relative group">
          <Image
            src={emoji.image_url}
            alt="Generated Emoji"
            width={128}
            height={128}
            className="rounded-lg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={() => handleDownload(emoji.image_url)}
              className="p-2 bg-white rounded-full"
            >
              <Download size={20} />
            </button>
            <button
              onClick={() => handleLike(emoji.id)}
              className="p-2 bg-white rounded-full"
            >
              <Heart size={20} />
            </button>
          </div>
          <span className="absolute bottom-1 right-1 bg-white px-2 py-1 rounded-full text-sm">
            {emoji.likes} likes
          </span>
        </div>
      ))}
    </div>
  );
}