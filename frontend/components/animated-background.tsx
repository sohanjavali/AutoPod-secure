'use client';

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-slate-900 dark:via-background dark:to-slate-800">
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
