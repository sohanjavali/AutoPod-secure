"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient as createSupabaseClient } from '@/utiils/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Play, Save, ArrowRight } from 'lucide-react';
import { LoginModal } from '@/components/login-modal';

const STYLE_PRESETS = ['Conversational', 'Educational', 'Entertaining', 'Professional'];

/* Languages supported in the UI (default: English) */
const LANGUAGE_PRESETS = [
  { label: 'English', code: 'en' },
  { label: 'French', code: 'fr' },
  { label: 'German', code: 'de' },
  { label: 'Spanish', code: 'es' },
  { label: 'Portuguese', code: 'pt' },
  { label: 'Chinese', code: 'zh' },
  { label: 'Japanese', code: 'ja' },
  { label: 'Hindi', code: 'hi' },
  { label: 'Italian', code: 'it' },
  { label: 'Korean', code: 'ko' },
  { label: 'Dutch', code: 'nl' },
  { label: 'Polish', code: 'pl' },
  { label: 'Russian', code: 'ru' },
  { label: 'Swedish', code: 'sv' },
  { label: 'Turkish', code: 'tr' },
  { label: 'Tagalog', code: 'tl' },
  { label: 'Bulgarian', code: 'bg' },
  { label: 'Romanian', code: 'ro' },
  { label: 'Arabic', code: 'ar' },
  { label: 'Czech', code: 'cs' },
  { label: 'Greek', code: 'el' },
  { label: 'Finnish', code: 'fi' },
  { label: 'Croatian', code: 'hr' },
  { label: 'Malay', code: 'ms' },
  { label: 'Slovak', code: 'sk' },
  { label: 'Danish', code: 'da' },
  { label: 'Tamil', code: 'ta' },
  { label: 'Ukrainian', code: 'uk' },
  { label: 'Hungarian', code: 'hu' },
  { label: 'Norwegian', code: 'no' },
  { label: 'Vietnamese', code: 'vi' },
  { label: 'Bengali', code: 'bn' },
  { label: 'Thai', code: 'th' },
  { label: 'Hebrew', code: 'he' },
  { label: 'Georgian', code: 'ka' },
  { label: 'Indonesian', code: 'id' },
  { label: 'Telugu', code: 'te' },
  { label: 'Gujarati', code: 'gu' },
  { label: 'Kannada', code: 'kn' },
  { label: 'Malayalam', code: 'ml' },
  { label: 'Marathi', code: 'mr' },
  { label: 'Punjabi', code: 'pa' },
];

interface GeneratedPodcast {
  id: string;
  title: string;
  description: string;
}

interface MainPromptAreaProps {
  onLoginSuccess?: () => void;
}

export function MainPromptArea({ onLoginSuccess }: MainPromptAreaProps) {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Conversational');
  const [length, setLength] = useState(15);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPodcast, setGeneratedPodcast] = useState<GeneratedPodcast | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [language, setLanguage] = useState('en');

  const selectedLanguageLabel =
    LANGUAGE_PRESETS.find((l) => l.code === language)?.label ?? 'English';

  const handleGeneratePodcast = async () => {
    const supabase = createSupabaseClient();
    
    const { data, error } = await supabase.auth.getUser();
    const user = data?.user;

    if (!user || error) {
      setShowLoginModal(true);
      return;
    }

    if (!prompt.trim()) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockPodcast: GeneratedPodcast = {
        id: `podcast-${Date.now()}`,
        title: `${prompt.split(' ').slice(0, 5).join(' ')}`,
        description: `A ${length}-minute ${style.toLowerCase()} podcast episode (in ${selectedLanguageLabel}) discussing "${prompt}".`,
      };
      setGeneratedPodcast(mockPodcast);
      setIsLoading(false);
    }, 1500);
  };

  const handleSaveToLibrary = () => {
    if (generatedPodcast) {
      router.push(`/dashboard`);
    }
  };

  const handlePlayPreview = () => {
    if (generatedPodcast) {
      router.push(`/episode/${generatedPodcast.id}`);
    }
  };

  const handleGoToEpisode = () => {
    if (generatedPodcast) {
      router.push(`/episode/${generatedPodcast.id}`);
    }
  };

  return (
    <>
      <div className="w-full">
        {/* Hero section */}
        <div className="mb-16 text-center">
          <h1 className="text-balance text-5xl font-bold text-foreground sm:text-6xl lg:text-7xl">
            Generate podcasts <br /> in seconds
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Describe what you want, choose your style and length, and let AI create it.
          </p>
        </div>

        <div className="mb-12">
          <div className="rounded-3xl border border-border/50 bg-white shadow-2xl transition-all hover:shadow-3xl hover:border-border/70 p-8 dark:bg-card">
            <div className="space-y-6">
              {/* Input field */}
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="What do you want your podcast to be about?"
                rows={3}
                className="w-full resize-none rounded-3xl border-0 bg-blue-50/60 px-6 py-4 text-sm font-medium text-foreground placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-blue-300/40 dark:bg-secondary dark:text-foreground"
              />

              {/* Controls row */}
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-end">
                {/* Style dropdown */}
                <div className="flex items-center gap-4">
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="hover-pop rounded-full border border-blue-200/50 bg-blue-50/60 px-5 py-2 text-sm font-medium text-foreground transition-all focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-300/30 dark:bg-secondary dark:border-border"
                  >
                    {STYLE_PRESETS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  {/* Language dropdown */}
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="hover-pop rounded-full border border-blue-200/50 bg-blue-50/60 px-4 py-2 text-sm font-medium text-foreground transition-all focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-300/30 dark:bg-secondary dark:border-border"
                  >
                    {LANGUAGE_PRESETS.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.label} ({l.code})
                      </option>
                    ))}
                  </select>
                  {/* Length buttons */}
                  <div className="flex gap-3">
                    {[15, 30].map((min) => (
                      <button
                        key={min}
                        onClick={() => setLength(min)}
                        className={`hover-pop rounded-full px-6 py-2 font-medium text-sm transition-all ${
                          length === min
                            ? 'bg-primary text-primary-foreground shadow-lg'
                            : 'border border-blue-200/50 bg-blue-50/60 text-foreground hover:bg-blue-100/60 dark:bg-secondary dark:border-border'
                        }`}
                      >
                        {min}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate button */}
                <Button
                  onClick={handleGeneratePodcast}
                  disabled={!prompt.trim() || isLoading}
                  className="hover-pop w-full gap-2 rounded-full bg-primary px-7 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:w-auto disabled:opacity-50"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div>
          {isLoading && (
            <div className="rounded-3xl border border-border bg-card p-16 text-center shadow-lg">
              <div className="mb-4 inline-block">
                <Loader2 className="h-8 w-8 animate-spin text-foreground" />
              </div>
              <p className="text-muted-foreground">Creating your podcast...</p>
            </div>
          )}

          {generatedPodcast && !isLoading && (
            <div className="rounded-3xl border border-border bg-white dark:bg-card shadow-xl p-8 animate-in fade-in">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground">{generatedPodcast.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{generatedPodcast.description}</p>
              </div>

              <div className="mb-6 flex flex-wrap gap-2">
                <Badge className="rounded-full bg-blue-100 text-foreground dark:bg-secondary">{length}m</Badge>
                <Badge className="rounded-full bg-blue-100 text-foreground dark:bg-secondary">{style}</Badge>
                <Badge className="rounded-full bg-blue-100 text-foreground dark:bg-secondary">{selectedLanguageLabel}</Badge>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handlePlayPreview}
                  className="hover-pop gap-2 rounded-full bg-foreground text-white py-2 text-sm"
                >
                  <Play className="h-4 w-4" />
                  Play Preview
                </Button>
                <Button
                  onClick={handleSaveToLibrary}
                  variant="outline"
                  className="hover-pop gap-2 rounded-full border-border py-2 text-sm"
                >
                  <Save className="h-4 w-4" />
                  Save to Library
                </Button>
                <Button
                  onClick={handleGoToEpisode}
                  variant="outline"
                  className="hover-pop gap-2 rounded-full border-border py-2 text-sm"
                >
                  Go to Episode
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setGeneratedPodcast(null)}
                  variant="ghost"
                  className="hover-pop rounded-full text-xs py-2"
                >
                  Create Another
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Login modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={onLoginSuccess ?? (() => setShowLoginModal(false))}
        />
      )}
    </>
  );
}
