'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { AnimatedBackground } from '@/components/animated-background';
import { MainPromptArea } from '@/components/main-prompt-area';

export default function CreatePodcastPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <Header 
        isLoggedIn={isLoggedIn} 
        onLogout={() => setIsLoggedIn(false)}
        darkMode={darkMode}
        onDarkModeToggle={() => setDarkMode(!darkMode)}
      />
      <AnimatedBackground />
      <main className="relative z-10 min-h-screen bg-gradient-to-b from-background to-background/50">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
          <MainPromptArea isLoggedIn={isLoggedIn} onLoginSuccess={() => setIsLoggedIn(true)} />
        </div>
      </main>
    </div>
  );
}
