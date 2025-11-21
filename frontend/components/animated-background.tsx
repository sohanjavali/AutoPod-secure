'use client';

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-slate-900 dark:via-background dark:to-slate-800">
      {/* High-visibility SVG animated layer (three moving gradient circles). Uses mix-blend and blur to look good in both themes */}
      <svg className="absolute inset-0 -z-10 w-full h-full svg-anim" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <defs>
          <radialGradient id="g1" cx="30%" cy="30%">
            <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity="1" />
            <stop offset="60%" stopColor="var(--color-chart-1)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="g2" cx="70%" cy="40%">
            <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity="1" />
            <stop offset="60%" stopColor="var(--color-chart-2)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="g3" cx="40%" cy="60%">
            <stop offset="0%" stopColor="var(--color-chart-3)" stopOpacity="1" />
            <stop offset="60%" stopColor="var(--color-chart-3)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className="move-1">
          <circle cx="180" cy="140" r="220" fill="url(#g1)" />
        </g>

        <g className="move-2">
          <circle cx="620" cy="120" r="190" fill="url(#g2)" />
        </g>

        <g className="move-3">
          <circle cx="420" cy="420" r="260" fill="url(#g3)" />
        </g>
      </svg>
      {/* Subtle moving gradient blobs (theme-aware) */}
      <div
        aria-hidden
        className="absolute left-8 top-28 h-72 w-72 rounded-full blob-blur animate-blob blob-blend opacity-60 dark:opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 30% 30%, var(--color-chart-1), transparent 50%)',
          animationDuration: '12s',
        }}
      />
      <div
        aria-hidden
        className="absolute right-8 top-12 h-64 w-64 rounded-full blob-blur animate-blob blob-blend opacity-52 dark:opacity-16 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 70% 40%, var(--color-chart-2), transparent 50%)',
          animationDuration: '14s',
          animationDelay: '3s',
        }}
      />
      <div
        aria-hidden
        className="absolute left-1/3 bottom-12 h-96 w-96 rounded-full blob-blur animate-blob blob-blend opacity-48 dark:opacity-12 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 40% 60%, var(--color-chart-3), transparent 50%)',
          animationDuration: '18s',
          animationDelay: '6s',
        }}
      />

      {/* Larger, softer floating light cubes */}
      <div className="absolute top-10 left-12 h-24 w-24 rounded-2xl border-2 border-blue-200/50 animate-float opacity-25 dark:border-blue-400/30 dark:opacity-20" />
      <div className="absolute top-1/4 right-16 h-32 w-32 rounded-2xl border-2 border-purple-200/40 animate-float-delay-1 opacity-20 dark:border-purple-400/25 dark:opacity-15" />
      <div className="absolute bottom-32 left-1/3 h-40 w-40 rounded-3xl border-2 border-blue-200/35 animate-float-delay-2 opacity-18 dark:border-blue-400/20 dark:opacity-14" />
      <div className="absolute bottom-16 right-1/4 h-28 w-28 rounded-2xl border-2 border-purple-200/45 animate-float opacity-22 dark:border-purple-400/30 dark:opacity-18" style={{ animationDelay: '2s' }} />
      <div className="absolute top-2/3 right-12 h-20 w-20 rounded-xl border-2 border-blue-200/50 animate-float-delay-1 opacity-24 dark:border-blue-400/30 dark:opacity-20" style={{ animationDelay: '4s' }} />
      <div className="absolute bottom-40 left-16 h-32 w-32 rounded-2xl border-2 border-purple-200/40 animate-float-delay-2 opacity-20 dark:border-purple-400/25 dark:opacity-15" style={{ animationDelay: '1s' }} />
    </div>
  );
}
