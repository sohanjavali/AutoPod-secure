'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { AnimatedBackground } from '@/components/animated-background';
import { MainPromptArea } from '@/components/main-prompt-area';

export default function CreatePodcastPage() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <Header darkMode={darkMode} onDarkModeToggle={() => setDarkMode(!darkMode)} />
      <AnimatedBackground />
      <main className="relative z-10 min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/50">
        <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <MainPromptArea />
        </div>
      </main>
    </div>
  );
}
