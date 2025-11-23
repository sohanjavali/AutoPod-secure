'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PodcastCardProps {
  id: string;
  created_at: string;
  title: string;
  duration: number;
  style: string;
  description: string;
  onDelete?: (id: string) => void;
}

export function PodcastCard({
  id,
  created_at,
  title,
  duration,
  style,
  description,
  onDelete,
}: PodcastCardProps) {
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
        <Button asChild className="flex-1 bg-accent hover:bg-accent/90">
          <Link href={`/episode/${id}`}>Play</Link>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link href={`/episode/${id}`}>Details</Link>
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
    </div>
  );
}
