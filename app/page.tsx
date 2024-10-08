'use client';
import { useState, useEffect } from 'react';
import { createClient } from '../lib/supabase';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import EmojiGrid from "@/components/ui/emoji-grid";
import { useRouter } from 'next/navigation';
import { Session } from '@supabase/supabase-js';
import Image from 'next/image';

type Emoji = {
  id: string;
  image_url: string;
  prompt: string;
  likes_count: number;
  created_at: string;
};

export default function Home() {
  const [session, setSession] = useState<Session | null>(null)
  const [prompt, setPrompt] = useState('');
  const [generatedEmoji, setGeneratedEmoji] = useState<Emoji | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getSession = async () => {
      try {
        console.log('Fetching session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session fetched:', session);
        setSession(session);
        if (!session) {
          console.log('No session, redirecting to login...');
          router.push('/login');
        } else {
          console.log('Session found, staying on page');
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session);
      setSession(session);
      if (!session) {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setGeneratedEmoji(null);

    try {
      console.log('Sending request to generate emoji:', { prompt, userId: session?.user.id });
      const response = await fetch('/api/generate-emoji', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, userId: session?.user.id }),
      });

      const data = await response.json();
      console.log('Received response:', data);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${data.error}`);
      }

      setGeneratedEmoji(data);
    } catch (err) {
      console.error('Error generating emoji:', err);
      setError(`Failed to generate emoji. ${err instanceof Error ? err.message : 'Please try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return <div>Loading... Please wait.</div>;
  }

  if (!session) {
    return null; // This will prevent any flash of content before redirect
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Create Your Emoji</h1>
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <Input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your emoji..."
          className="w-full"
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Generating...' : 'Generate Emoji'}
        </Button>
      </form>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      
      {/* Newly generated emoji display */}
      {generatedEmoji && (
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Your Generated Emoji</h2>
          <div className="inline-block">
            <Image
              src={generatedEmoji.image_url}
              alt={generatedEmoji.prompt}
              width={200}
              height={200}
              className="mx-auto"
            />
            <p className="mt-2 text-lg">{generatedEmoji.prompt}</p>
          </div>
        </div>
      )}

      <EmojiGrid newEmoji={generatedEmoji} />
    </div>
  );
}
