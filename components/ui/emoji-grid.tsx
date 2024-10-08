'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Download, Heart } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { User } from '@supabase/supabase-js'; // Change this line

type Emoji = {
  id: string;
  image_url: string;
  prompt: string;
  likes_count: number;
  created_at: string;
};

export default function EmojiGrid({ newEmoji }: { newEmoji?: Emoji | null }) {
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [likedEmojis, setLikedEmojis] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchLikedEmojis = useCallback(async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from('likes')
      .select('emoji_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching liked emojis:', error);
    } else {
      setLikedEmojis(new Set(data.map(like => like.emoji_id)));
    }
  }, [user?.id]);

  const fetchEmojis = useCallback(async () => {
    const { data, error } = await supabase
      .from('emojis')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching emojis:', error);
    } else {
      setEmojis(data || []);
    }
  }, []);

  useEffect(() => {
    fetchEmojis();
    if (user) {
      fetchLikedEmojis();
    }
  }, [user, fetchLikedEmojis, fetchEmojis]);

  useEffect(() => {
    if (newEmoji) {
      setEmojis(prevEmojis => [newEmoji, ...prevEmojis]);
    }
  }, [newEmoji]);

  const handleLike = async (id: string) => {
    if (!user) {
      console.error('No user logged in');
      return;
    }

    const isLiked = likedEmojis.has(id);
    const newLikedEmojis = new Set(likedEmojis);

    try {
      const response = await fetch('/api/like-emoji', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emojiId: id, action: isLiked ? 'unlike' : 'like' }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(`Failed to update like: ${responseData.error}`);
      }

      setEmojis(emojis.map(emoji => 
        emoji.id === id ? { ...emoji, likes_count: responseData.likes_count } : emoji
      ));

      if (isLiked) {
        newLikedEmojis.delete(id);
      } else {
        newLikedEmojis.add(id);
      }
      setLikedEmojis(newLikedEmojis);
    } catch (error) {
      console.error('Error updating like:', error);
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {emojis.map((emoji) => (
            <div key={emoji.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative aspect-square">
                <Image
                  src={emoji.image_url}
                  alt={emoji.prompt}
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Error loading image:', emoji.image_url);
                    e.currentTarget.src = '/placeholder.png'; // Replace with a placeholder image
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
                  <button
                    onClick={() => handleDownload(emoji.image_url, emoji.prompt)}
                    className="p-2 bg-white rounded-full hover:bg-gray-200 mr-2"
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
                    <Heart size={20} fill={likedEmojis.has(emoji.id) ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>
              <div className="p-2 flex justify-between items-center">
                <p className="text-sm truncate flex-1">{emoji.prompt}</p>
                <div className="flex items-center">
                  <Heart size={16} className="text-red-500 mr-1" />
                  <span className="text-sm text-gray-500">{emoji.likes_count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}