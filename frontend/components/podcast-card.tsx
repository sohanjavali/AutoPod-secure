'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PodcastCardProps {
  id: string;
  title: string;
  topic: string;
  duration: number;
  tone: string;
  style: string;
  speakers: number;
  description: string;
  hasQuiz?: boolean;
  createdDate: string;
  onDelete?: (id: string) => void;
}

export function PodcastCard({
  id,
  title,
  topic,
  duration,
  tone,
  style,
  speakers,
  description,
  hasQuiz,
  createdDate,
  onDelete,
}: PodcastCardProps) {
  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-accent/30">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="line-clamp-2 text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{topic}</p>
        </div>
      </div>

      <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{description}</p>

      <div className="mb-4 flex flex-wrap gap-2">
        <Badge variant="secondary">{duration}m</Badge>
        <Badge variant="secondary">{tone}</Badge>
        <Badge variant="secondary">{style}</Badge>
        {speakers && <Badge variant="secondary">{speakers} speaker{speakers !== 1 ? 's' : ''}</Badge>}
        {hasQuiz && <Badge className="bg-accent text-accent-foreground">Quiz</Badge>}
      </div>

      <p className="mb-4 text-xs text-muted-foreground">Created {createdDate}</p>

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
