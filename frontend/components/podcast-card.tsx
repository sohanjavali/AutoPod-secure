'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Play, Pause } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PodcastCardProps {
  id: string;
  created_at: string;
  title: string;
  duration: number;
  url?: string;
  style: string;
  description: string;
  onDelete?: (id: string) => void;
}

export function PodcastCard({
  id,
  created_at,
  title,
  duration,
  url,
  style,
  description,
  onDelete,
}: PodcastCardProps) {
  const [showPlayer, setShowPlayer] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [durationSec, setDurationSec] = useState(0);

  useEffect(() => {
    // When showing the player, try to start playback if a URL exists.
    if (showPlayer && url) {
      const p = audioRef.current?.play();
      if (p && typeof p.then === 'function') {
        p.catch(() => {
          // Autoplay might be blocked by browser - that's okay.
        });
      }
    } else {
      // If hiding the player, pause playback
      try {
        audioRef.current?.pause();
      } catch (e) {
        // ignore
      }
      setIsPlaying(false);
    }
  }, [showPlayer, url]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => setDurationSec(audio.duration || 0);
    const onTime = () => setCurrentTime(audio.currentTime || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

  // no volume controls in UI: leave volume to system/default

    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, [url, showPlayer]);

  function formatTime(s: number) {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-accent/30">

      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="line-clamp-2 text-lg font-semibold text-foreground">{title}</h3>
        </div>
      </div>

      <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{description}</p>

      <div className="mb-4 flex flex-wrap gap-2">
        <Badge variant="secondary">{duration}m</Badge>
        <Badge variant="secondary">{style}</Badge>
      </div>

      <p className="mb-4 text-xs text-muted-foreground">Created {created_at}</p>

      <div className="flex gap-2">
        <Button
          className="flex-1 bg-accent hover:bg-accent/90"
          onClick={() => setShowPlayer((s) => !s)}
        >
          {showPlayer ? 'Hide Player' : 'Play'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete?.(id)}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {showPlayer && (
        <div className="mt-4">
          {/* If a URL is provided render the native audio element with controls */}
          {url ? (
            <div className="flex flex-col gap-3">
              {/* Hidden native audio element used for playback control */}
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <audio ref={audioRef} src={url} className="hidden" />

              {/* Custom player UI */}
              <div className="flex items-center gap-3">
                <button
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  onClick={() => {
                    if (!audioRef.current) return;
                    if (isPlaying) {
                      audioRef.current.pause();
                    } else {
                      audioRef.current.play().catch(() => {});
                    }
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>

                <div className="flex-1">
                  <input
                    type="range"
                    min={0}
                    max={durationSec || 0}
                    step="0.1"
                    value={currentTime}
                    onChange={(e) => {
                      const t = Number(e.currentTarget.value || 0);
                      if (audioRef.current) audioRef.current.currentTime = t;
                      setCurrentTime(t);
                    }}
                    className="w-full appearance-none h-2 rounded-md bg-muted/60 accent-accent"
                  />
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(durationSec)}</span>
                  </div>
                </div>

                {/* volume controls removed - rely on system volume */}
              </div>

              <div className="text-xs text-muted-foreground">{isPlaying ? 'Playing' : 'Paused'}</div>
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-border bg-muted p-3 text-sm text-muted-foreground">
              Audio not available for this podcast.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
