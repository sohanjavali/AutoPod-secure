'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { PodcastCard } from '@/components/podcast-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const MOCK_PODCASTS = [
  {
    id: 'podcast-1',
    title: 'Quantum Tunneling: Why Particles Cheat Walls',
    topic: 'Quantum Physics',
    duration: 30,
    tone: 'Calm Professor',
    style: 'Dialogue',
    speakers: 2,
    description: 'A deep dive into one of quantum mechanics\' most fascinating phenomena.',
    hasQuiz: true,
    createdDate: '2 days ago',
  },
  {
    id: 'podcast-2',
    title: 'The History of Jazz in America',
    topic: 'Music History',
    duration: 15,
    tone: 'Storytelling',
    style: 'Monologue',
    speakers: 1,
    description: 'Explore the roots and evolution of jazz from New Orleans to the modern day.',
    hasQuiz: false,
    createdDate: '5 days ago',
  },
  {
    id: 'podcast-3',
    title: 'Machine Learning: From Theory to Practice',
    topic: 'Artificial Intelligence',
    duration: 30,
    tone: 'Friendly Tutor',
    style: 'Dialogue',
    speakers: 2,
    description: 'An accessible introduction to machine learning concepts and real-world applications.',
    hasQuiz: true,
    createdDate: '1 week ago',
  },
  {
    id: 'podcast-4',
    title: 'The Future of Renewable Energy',
    topic: 'Clean Energy',
    duration: 30,
    tone: 'Debate Mode',
    style: 'Debate',
    speakers: 2,
    description: 'Two experts debate the viability and future of renewable energy sources.',
    hasQuiz: false,
    createdDate: '1 week ago',
  },
  {
    id: 'podcast-5',
    title: 'Ancient Rome: The Gladiatorial System',
    topic: 'History',
    duration: 15,
    tone: 'Comedic Explainer',
    style: 'Monologue',
    speakers: 1,
    description: 'Learn about the fascinating and brutal world of ancient Roman gladiators.',
    hasQuiz: true,
    createdDate: '2 weeks ago',
  },
];

export default function DashboardPage() {
  const [podcasts, setPodcasts] = useState(MOCK_PODCASTS);
  const [search, setSearch] = useState('');
  const [durationFilter, setDurationFilter] = useState('all');
  const [toneFilter, setToneFilter] = useState('all');
  const [styleFilter, setStyleFilter] = useState('all');

  const filteredPodcasts = podcasts.filter((podcast) => {
    const matchesSearch = podcast.title.toLowerCase().includes(search.toLowerCase()) ||
      podcast.topic.toLowerCase().includes(search.toLowerCase());
    const matchesDuration = durationFilter === 'all' || podcast.duration === Number(durationFilter);
    const matchesTone = toneFilter === 'all' || podcast.tone === toneFilter;
    const matchesStyle = styleFilter === 'all' || podcast.style === styleFilter;

    return matchesSearch && matchesDuration && matchesTone && matchesStyle;
  });

  const handleDelete = (id: string) => {
    setPodcasts(podcasts.filter((p) => p.id !== id));
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Podcasts</h1>
              <p className="mt-1 text-muted-foreground">
                {filteredPodcasts.length} of {podcasts.length} podcast{podcasts.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button asChild className="w-full bg-accent hover:bg-accent/90 sm:w-auto">
              <Link href="/">Create New Podcast</Link>
            </Button>
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-4 rounded-xl border border-border bg-card p-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Search</label>
              <Input
                placeholder="Search by topic or title…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border-border focus:border-accent"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Length</label>
                <select
                  value={durationFilter}
                  onChange={(e) => setDurationFilter(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
                >
                  <option value="all">All</option>
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Tone</label>
                <select
                  value={toneFilter}
                  onChange={(e) => setToneFilter(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
                >
                  <option value="all">All</option>
                  <option value="Calm Professor">Calm Professor</option>
                  <option value="Friendly Tutor">Friendly Tutor</option>
                  <option value="Debate Mode">Debate Mode</option>
                  <option value="Storytelling">Storytelling</option>
                  <option value="Comedic Explainer">Comedic Explainer</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Style</label>
                <select
                  value={styleFilter}
                  onChange={(e) => setStyleFilter(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
                >
                  <option value="all">All</option>
                  <option value="Monologue">Monologue</option>
                  <option value="Dialogue">Dialogue</option>
                  <option value="Debate">Debate</option>
                  <option value="Story Mode">Story Mode</option>
                </select>
              </div>
            </div>
          </div>

          {/* Podcast Grid */}
          {filteredPodcasts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPodcasts.map((podcast) => (
                <PodcastCard
                  key={podcast.id}
                  {...podcast}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-border bg-secondary/30 p-12 text-center">
              <div className="mb-3 text-4xl">🔍</div>
              <p className="text-muted-foreground">No podcasts match your filters.</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
