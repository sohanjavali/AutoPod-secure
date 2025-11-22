"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient as createSupabaseClient } from '@/utiils/supabase/client';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Play, Save, ArrowRight } from 'lucide-react';
import { LoginModal } from '@/components/login-modal';

const STYLE_PRESETS = ['Conversational', 'Educational', 'Entertaining', 'Professional'];

// Languages supported in the UI (default: English)
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
  const [duration, setDuration] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPodcast, setGeneratedPodcast] = useState<GeneratedPodcast | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [language, setLanguage] = useState('en');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Get label for selected language code
  const selectedLanguageLabel =
    LANGUAGE_PRESETS.find((l) => l.code === language)?.label ?? 'English';

  // Handle on click for the generate button
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

    // First, validate the prompt (see if it's safe and feasible)
    const validation = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/validate-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: prompt.trim() }),
    }).then(res => res.json());

    // If validation explicitly fails, show the reason to the user and stop
    if (!validation?.data?.isValid) {
      setValidationError(validation.data.reason ?? 'Cannot generate podcast for the given prompt.');
      setIsLoading(false);
      return;
    }

    // Now, proceed to generate the podcast
    const generation = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/generate-podcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: validation.data.sanitizedTopic.trim(),
        style,
        duration,
        language,
      }),
    })

    setIsLoading(false);
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
            Describe what you want, choose your style and duration, and let AI do the rest.
          </p>
        </div>

        <div className="mb-12">
          <div className="rounded-3xl border border-border/50 bg-white shadow-2xl transition-all hover:shadow-3xl hover:border-border/70 p-8 dark:bg-card">
            <div className="space-y-6">
              {/* Input field */}
              <textarea
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  // Clear previous validation error when the user edits the prompt
                  setValidationError(null);
                }}
                placeholder="What do you want your podcast to be about?"
                rows={3}
                readOnly={isLoading}
                className="w-full resize-none rounded-3xl border-0 bg-blue-50/60 px-6 py-4 text-sm font-medium text-foreground placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-blue-300/40 dark:bg-secondary dark:text-foreground"
              />

              {validationError && (
                <p className="mt-2 text-sm text-red-600">{validationError}</p>
              )}

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
                    {[10, 20].map((min) => (
                      <button
                        key={min}
                        onClick={() => setDuration(min)}
                        className={`hover-pop rounded-full px-6 py-2 font-medium text-sm transition-all ${
                          duration === min
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
