'use client';

import { useState } from 'react';
import { Input } from './input';
import { Button } from './button';
import Image from 'next/image';
import { supabase } from '../../lib/supabase';

type Emoji = {
  id: string;
  image_url: string;
  prompt: string;
  likes: number;
  created_at: string;
};

export default function EmojiGenerator({ onEmojiGenerated }: { onEmojiGenerated: (emoji: Emoji) => void }) {
  const [prompt, setPrompt] = useState('');
  const [generatedEmoji, setGeneratedEmoji] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateEmoji = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-emoji', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (data.imageUrl) {
        setGeneratedEmoji(data.imageUrl);
        
        // Save the generated emoji to Supabase
        const { data: insertData, error: supabaseError } = await supabase
          .from('emojis')
          .insert({ image_url: data.imageUrl, prompt: prompt })
          .select();
        
        if (supabaseError) {
          console.error('Error saving emoji to Supabase:', supabaseError);
          setError('Error saving emoji. Please try again.');
        } else if (insertData && insertData.length > 0) {
          console.log('New emoji saved:', insertData[0]);
          onEmojiGenerated(insertData[0] as Emoji);
        }
      } else {
        throw new Error(data.error || 'Failed to generate emoji');
      }
    } catch (error) {
      console.error('Error generating emoji:', error);
      setError('Failed to generate emoji. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <div className="flex gap-4 mb-4">
        <Input
          type="text"
          placeholder="Enter a prompt to generate an emoji"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="flex-grow"
        />
        <Button onClick={generateEmoji} disabled={isGenerating}>
          {isGenerating ? 'Generating...' : 'Generate'}
        </Button>
      </div>
      <div className="h-64 w-64 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
        {isGenerating ? (
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
        ) : generatedEmoji ? (
          <Image src={generatedEmoji} alt="Generated Emoji" width={256} height={256} />
        ) : (
          <span className="text-gray-400">Your emoji will appear here</span>
        )}
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}