'use client';
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import EmojiGrid from "@/components/ui/emoji-grid";

type Emoji = {
  id: string;
  image_url: string;
  prompt: string;
  likes_count: number;
  created_at: string;
};

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [generatedEmoji, setGeneratedEmoji] = useState<Emoji | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate-emoji', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

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

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Emoji Maker</h1>
      <form onSubmit={handleSubmit} className="mb-8 flex gap-2">
        <Input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your emoji..."
          className="flex-grow"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate'}
        </Button>
      </form>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <EmojiGrid newEmoji={generatedEmoji} />
    </main>
  );
}
