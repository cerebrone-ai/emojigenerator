'use client';
import { useState } from 'react';
import EmojiGenerator from "@/components/ui/emoji-generator";
import EmojiGrid from "@/components/ui/emoji-grid";

type Emoji = {
  id: string;
  image_url: string;
  prompt: string;
  likes: number;
  created_at: string;
};

export default function Home() {
  const [newEmoji, setNewEmoji] = useState<Emoji | undefined>(undefined);

  const handleEmojiGenerated = (emoji: Emoji) => {
    console.log('New emoji generated:', emoji);
    setNewEmoji(emoji);
  };

  return (
    <div className="min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Emoji Maker</h1>
        <EmojiGenerator onEmojiGenerated={handleEmojiGenerated} />
        <EmojiGrid newEmoji={newEmoji} />
      </main>
    </div>
  );
}
