'use client';
import { useState } from 'react';
import EmojiGenerator from "@/components/ui/emoji-generator";
import EmojiGrid from "@/components/ui/emoji-grid";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEmojiGenerated = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <div className="min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Emoji Maker</h1>
        <EmojiGenerator onEmojiGenerated={handleEmojiGenerated} />
        <EmojiGrid key={refreshKey} />
      </main>
    </div>
  );
}
