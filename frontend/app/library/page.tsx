"use client";

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { Header } from '@/components/header';
import { PodcastCard } from '@/components/podcast-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { createClient as createSupabaseClient } from '@/utiils/supabase/client';

interface Podcast {
  id: string;
  created_at: string
  title: string;
  duration: number;
  url: string;
  style: string;
  description: string;
}

export default function LibraryPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [durationFilter, setDurationFilter] = useState('all');
  const [toneFilter, setToneFilter] = useState('all');
  const [styleFilter, setStyleFilter] = useState('all');

  useEffect(() => {
    async function fetchPodcasts() {
      setIsLoading(true);
      const supabase = createSupabaseClient();
      
      const { data, error } = await supabase.auth.getSession();
      const session = data?.session;

      if (!session || error) {
        redirect('/');
      }

      // Fetch podcasts from backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/get-podcasts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({}),
      }).then(res => res.json());

      if (!response.success) {
        setIsLoading(false);
        redirect('/');
      }

      setPodcasts(response.data as Podcast[]);
      setIsLoading(false);

      console.log(response);
    }

    fetchPodcasts();
  }, []);

  const filteredPodcasts = podcasts.filter((podcast) => {
    const matchesSearch = podcast.title.toLowerCase().includes(search.toLowerCase()) ||
      podcast.title.toLowerCase().includes(search.toLowerCase());
    const matchesDuration = durationFilter === 'all' || podcast.duration === Number(durationFilter);
    const matchesStyle = styleFilter === 'all' || podcast.style === styleFilter;

    return matchesSearch && matchesDuration && matchesStyle;
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
                  <option value="15">5 min</option>
                  <option value="30">10 min</option>
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
                  <option value="Calm Professor">Conversational</option>
                  <option value="Friendly Tutor">Educational</option>
                  <option value="Debate Mode">Entertaining</option>
                  <option value="Storytelling">Professional</option>
                </select>
              </div>
            </div>
          </div>

          {/* Podcast Grid */}
          {isLoading ? (
            <div className="rounded-xl border-2 border-dashed border-border bg-secondary/30 p-12 text-center animate-pulse" aria-busy>
              <div className="mb-3 text-4xl">⏳</div>
              <p className="text-muted-foreground">Loading podcasts…</p>
            </div>
          ) : filteredPodcasts.length > 0 ? (
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
