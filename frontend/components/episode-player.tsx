'use client';

import { useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EpisodePlayerProps {
  title: string;
  topic: string;
  duration: number;
  tone: string;
  style: string;
  speakers: number;
}

export function EpisodePlayer({
  title,
  topic,
  duration,
  tone,
  style,
  speakers,
}: EpisodePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const totalDuration = duration * 60; // Convert to seconds

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold text-foreground">{title}</h2>
        <p className="mb-4 text-muted-foreground">{topic}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{duration}m</Badge>
          <Badge variant="secondary">{tone}</Badge>
          <Badge variant="secondary">{style}</Badge>
          <Badge variant="secondary">{speakers} speaker{speakers !== 1 ? 's' : ''}</Badge>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        <Button
          size="lg"
          className="h-16 w-16 rounded-full bg-accent hover:bg-accent/90"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6 translate-x-0.5" />
          )}
        </Button>

        <div className="w-full">
          <div className="mb-2 h-1.5 w-full rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${(currentTime / totalDuration) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Volume2 className="h-4 w-4" />
          <div className="h-1 w-20 rounded-full bg-secondary">
            <div className="h-full w-1/2 rounded-full bg-accent" />
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
