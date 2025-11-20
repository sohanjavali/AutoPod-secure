"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Library, Moon, Sun } from 'lucide-react';
import { createClient as createSupabaseClient } from '@/utiils/supabase/client';

interface HeaderProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
  darkMode?: boolean;
  onDarkModeToggle?: () => void;
}

export function Header({ isLoggedIn, onLogout, darkMode, onDarkModeToggle }: HeaderProps) {
  const [localLoggedIn, setLocalLoggedIn] = useState<boolean | null>(null);
  const [internalDark, setInternalDark] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // If parent didn't supply isLoggedIn, detect via Supabase in the browser
    if (typeof isLoggedIn === 'undefined') {
      const supabase = createSupabaseClient();

      let mounted = true;

      (async () => {
        try {
          const { data } = await supabase.auth.getUser();
          if (!mounted) return;
          setLocalLoggedIn(!!data?.user);
        } catch (err) {
          if (!mounted) return;
          setLocalLoggedIn(false);
        }
      })();

      const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
        if (mounted) setLocalLoggedIn(!!session);
      });

      return () => {
        mounted = false;
        sub?.subscription.unsubscribe();
      };
    }
  }, [isLoggedIn]);

  // Determine whether header should control theme internally or defer to parent props
  useEffect(() => {
    if (typeof darkMode === 'boolean') {
      setInternalDark(darkMode);
      return;
    }

    // Initialize internalDark from persisted preference or document class
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
      const htmlHasDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
      setInternalDark(stored === 'dark' || htmlHasDark)
    } catch (err) {
      // ignore
    }
  }, [darkMode]);

  useEffect(() => {
    // Sync the theme to the document element and persist preference when header controls it
    const resolved = typeof darkMode === 'boolean' ? darkMode : internalDark
    try {
      if (resolved) document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
      if (typeof darkMode === 'undefined') {
        localStorage.setItem('theme', resolved ? 'dark' : 'light')
      }
    } catch (err) {
      // ignore server-side
    }
  }, [darkMode, internalDark]);

  const resolvedLoggedIn = typeof isLoggedIn === 'boolean' ? isLoggedIn : !!localLoggedIn;

  const handleLogout = async () => {
    if (onLogout) return onLogout();

    try {
      const supabase = createSupabaseClient();
      await supabase.auth.signOut();
      // clear server cookies
      await fetch('/api/auth/clear-session', { method: 'POST' });
    } catch (err) {
      console.warn('Logout failed', err);
    }
    router.replace('/');
  };
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <span className="text-sm font-bold text-accent-foreground">🎙️</span>
          </div>
          <span className="text-xl font-bold text-foreground">AutoPod</span>
        </Link>
        <nav className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => {
              if (typeof onDarkModeToggle === 'function') return onDarkModeToggle()
              setInternalDark((s) => !s)
            }}
            className="hover-pop p-2"
            size="sm"
          >
            {(() => {
              const resolvedDark = typeof darkMode === 'boolean' ? darkMode : internalDark
              return resolvedDark ? (
                <Sun className="h-4 w-4 text-foreground" />
              ) : (
                <Moon className="h-4 w-4 text-foreground" />
              )
            })()}
          </Button>
          {resolvedLoggedIn && (
            <>
              <Button variant="ghost" asChild className="hover-pop gap-2">
                <Link href="/dashboard">
                  <Library className="h-4 w-4" />
                  <span className="hidden sm:inline">Library</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="hover-pop flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
