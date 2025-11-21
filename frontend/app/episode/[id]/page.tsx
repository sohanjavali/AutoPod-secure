'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { EpisodePlayer } from '@/components/episode-player';
import { TranscriptSection } from '@/components/transcript-section';
import { QuizSection } from '@/components/quiz-section';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const MOCK_EPISODE = {
  id: 'podcast-1',
  title: 'Quantum Tunneling: Why Particles Cheat Walls',
  topic: 'Quantum Physics',
  duration: 30,
  tone: 'Calm Professor',
  style: 'Dialogue',
  speakers: 2,
  transcript: [
    {
      speaker: 'Professor',
      text: 'Today, we\'re going to explore one of the most mind-bending phenomena in quantum mechanics: quantum tunneling.',
    },
    {
      speaker: 'Student',
      text: 'Quantum tunneling? That sounds like particles going through walls, which shouldn\'t be possible.',
    },
    {
      speaker: 'Professor',
      text: 'Exactly! In classical physics, if a particle doesn\'t have enough energy to overcome a barrier, it can\'t get through. But in the quantum world, things work differently.',
    },
    {
      speaker: 'Student',
      text: 'How is that possible?',
    },
    {
      speaker: 'Professor',
      text: 'It comes down to the wave-particle duality of quantum mechanics. Particles at the quantum scale behave like waves, and waves have a probability of existing beyond barriers.',
    },
    {
      speaker: 'Student',
      text: 'So particles don\'t have a definite position?',
    },
    {
      speaker: 'Professor',
      text: 'Precisely! According to quantum mechanics, a particle is described by a probability wave. Even when it shouldn\'t have enough energy to cross a barrier, there\'s a non-zero probability it will appear on the other side.',
    },
  ],
  speakers: [
    { name: 'Professor', color: 'bg-indigo-500' },
    { name: 'Student', color: 'bg-cyan-500' },
  ],
  quiz: [
    {
      id: 'q1',
      question: 'What is the primary reason particles can tunnel through barriers in quantum mechanics?',
      options: [
        'They move very fast',
        'They behave like waves with probability distributions',
        'They have magnetic properties',
        'Barriers are not real at the quantum level',
      ],
      correctAnswer: 1,
      explanation: 'Quantum particles exhibit wave-particle duality, meaning they behave like waves with probability distributions, allowing them to exist beyond barriers.',
    },
    {
      id: 'q2',
      question: 'In classical physics, what happens when a particle lacks energy to overcome a barrier?',
      options: [
        'It tunnels through',
        'It bounces back',
        'It disappears',
        'It slows down indefinitely',
      ],
      correctAnswer: 1,
      explanation: 'In classical physics, a particle without sufficient energy simply bounces back—it cannot pass through the barrier.',
    },
    {
      id: 'q3',
      question: 'Which concept is key to understanding quantum tunneling?',
      options: [
        'Relativity',
        'Wave-particle duality',
        'Entropy',
        'Gravity',
      ],
      correctAnswer: 1,
      explanation: 'Wave-particle duality is the fundamental concept that explains how quantum particles can tunnel through barriers.',
    },
  ],
};

export default function EpisodePage() {
  const [activeTab, setActiveTab] = useState<'transcript' | 'quiz'>('transcript');

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Button variant="ghost" asChild className="mb-6 gap-2">
            <Link href="/library">
              <ChevronLeft className="h-4 w-4" />
              Back to My Podcasts
            </Link>
          </Button>

          {/* Player */}
          <div className="mb-12">
            <EpisodePlayer
              title={MOCK_EPISODE.title}
              topic={MOCK_EPISODE.topic}
              duration={MOCK_EPISODE.duration}
              tone={MOCK_EPISODE.tone}
              style={MOCK_EPISODE.style}
              speakers={MOCK_EPISODE.speakers}
            />
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab('transcript')}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === 'transcript'
                  ? 'border-b-2 border-accent text-accent'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Transcript
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === 'quiz'
                  ? 'border-b-2 border-accent text-accent'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Quick Quiz
            </button>
          </div>

          {/* Content */}
          <div className="mb-12 animate-in fade-in">
            {activeTab === 'transcript' && (
              <TranscriptSection
                transcript={MOCK_EPISODE.transcript}
                speakers={MOCK_EPISODE.speakers}
              />
            )}
            {activeTab === 'quiz' && <QuizSection questions={MOCK_EPISODE.quiz} />}
          </div>
        </div>
      </main>
    </>
  );
}
