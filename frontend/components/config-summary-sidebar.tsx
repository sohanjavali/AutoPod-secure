'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ConfigSummarySidebarProps {
  tone: string;
  style: string;
  duration: number;
  speakers: number;
  recentPodcasts: Array<{
    id: string;
    title: string;
    duration: number;
  }>;
}

export function ConfigSummarySidebar({
  tone,
  style,
  duration,
  speakers,
  recentPodcasts,
}: ConfigSummarySidebarProps) {
  return (
    <div className="sticky top-24 space-y-4">
      {/* Summary Card */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 font-semibold text-foreground">Configuration</h3>
        <p className="text-sm text-muted-foreground">
          This will be a {duration}-minute {tone.toLowerCase()} {style.toLowerCase()} with {speakers} speaker{speakers !== 1 ? 's' : ''}.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="secondary">{duration}m</Badge>
          <Badge variant="secondary">{tone}</Badge>
        </div>
      </div>

      {/* Recent Podcasts */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 font-semibold text-foreground">Recent Podcasts</h3>
        <div className="space-y-2">
          {recentPodcasts.map((podcast) => (
            <Button
              key={podcast.id}
              variant="ghost"
              asChild
              className="h-auto w-full justify-start truncate p-2 text-left text-xs"
            >
              <Link href={`/episode/${podcast.id}`}>
                <div className="truncate">
                  <div className="truncate font-medium text-foreground">{podcast.title}</div>
                  <div className="text-muted-foreground">{podcast.duration}m</div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
