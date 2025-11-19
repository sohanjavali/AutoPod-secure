'use client';

interface Speaker {
  name: string;
  color: string;
}

interface TranscriptLine {
  speaker: string;
  text: string;
}

interface TranscriptSectionProps {
  transcript: TranscriptLine[];
  speakers: Speaker[];
}

export function TranscriptSection({ transcript, speakers }: TranscriptSectionProps) {
  const getSpeakerColor = (speakerName: string) => {
    const speaker = speakers.find((s) => s.name === speakerName);
    return speaker?.color || 'bg-muted';
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-6">
      {transcript.map((line, index) => (
        <div key={index} className="flex gap-3">
          <div className={`${getSpeakerColor(line.speaker)} rounded-lg px-3 py-1 text-xs font-semibold text-card-foreground flex-shrink-0`}>
            {line.speaker}
          </div>
          <p className="text-sm leading-relaxed text-foreground">{line.text}</p>
        </div>
      ))}
    </div>
  );
}
