'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, Heart } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type Emoji = {
  id: string;
  image_url: string;
  prompt: string;
  likes: number;
  created_at: string;
};

export default function EmojiGrid({ newEmoji }: { newEmoji?: Emoji }) {
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [likedEmojis, setLikedEmojis] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchEmojis();
  }, []);

  useEffect(() => {
    if (newEmoji) {
      console.log('New emoji received:', newEmoji);
      setEmojis(prevEmojis => [newEmoji, ...prevEmojis]);
    }
  }, [newEmoji]);

  const fetchEmojis = async () => {
    console.log('Fetching emojis...');
    const { data, error } = await supabase
      .from('emojis')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching emojis:', error);
    } else {
      console.log('Fetched emojis:', data);
      setEmojis(data || []);
    }
  };

  const handleLike = async (id: string) => {
    if (likedEmojis.has(id)) return; // Prevent multiple likes

    const { data, error } = await supabase
      .from('emojis')
      .update({ likes: emojis.find(e => e.id === id)!.likes + 1 })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating likes:', error);
    } else {
      setEmojis(emojis.map(emoji => 
        emoji.id === id ? { ...emoji, likes: emoji.likes + 1 } : emoji
      ));
      setLikedEmojis(new Set(likedEmojis).add(id));
    }
  };

  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `emoji-${prompt}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Generated Emojis</h2>
      {emojis.length === 0 ? (
        <p>No emojis generated yet. Create your first emoji!</p>
      ) : (
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
                  onClick={() => handleDownload(emoji.image_url, emoji.prompt)}
                  className="p-2 bg-white rounded-full hover:bg-gray-200"
                >
                  <Download size={20} />
                </button>
                <button
                  onClick={() => handleLike(emoji.id)}
                  className={`p-2 rounded-full ${
                    likedEmojis.has(emoji.id)
                      ? 'bg-red-500 text-white'
                      : 'bg-white hover:bg-gray-200'
                  }`}
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
      )}
    </div>
  );
}