"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Library, Moon, Sun } from 'lucide-react';
import { createClient as createSupabaseClient } from '@/utiils/supabase/client';
import { useTheme } from 'next-themes';

interface HeaderProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
  // legacy darkMode and onDarkModeToggle removed
}

export function Header({ isLoggedIn, onLogout }: HeaderProps) {
  const [localLoggedIn, setLocalLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();
  const { theme, setTheme, systemTheme } = useTheme();

  // Track client mount to avoid rendering theme-dependent UI during SS (prevent hydration mismatches)
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    // If parent didn't supply isLoggedIn, detect via Supabase in the browser
    if (typeof isLoggedIn === 'undefined') {
      const supabase = createSupabaseClient();

      (async () => {
        try {
          const { data } = await supabase.auth.getUser();
          setLocalLoggedIn(!!data?.user);
        } catch (err) {
          setLocalLoggedIn(false);
        }
      })();

      const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
        setLocalLoggedIn(!!session);
      });

      return () => {
        sub?.subscription.unsubscribe();
      };
    }
  }, [isLoggedIn]);

  // Resolve whether dark is active from next-themes
  const resolvedDark = (() => {
    if (!theme) return false;
    if (theme === 'system') return systemTheme === 'dark';
    return theme === 'dark';
  })();

  const handleToggle = () => {
    // toggle via next-themes
    try {
      // if theme is explicit 'dark' switch to light; otherwise set dark
      if (theme === 'dark' || (theme === 'system' && systemTheme === 'dark')) {
        setTheme('light');
      } else {
        setTheme('dark');
      }
    } catch (err) {
      // ignore
    }
  };

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
            onClick={handleToggle}
            className="hover-pop p-2"
            size="sm"
          >
            {isMounted ? (
              resolvedDark ? (
                <Sun className="h-4 w-4 text-foreground" />
              ) : (
                <Moon className="h-4 w-4 text-foreground" />
              )
            ) : (
              // Render a stable placeholder during SSR / first paint so server
              // and client markup match and avoid hydration mismatches.
              <span className="inline-block h-4 w-4" aria-hidden />
            )}
          </Button>
          {resolvedLoggedIn && (
            <>
              <Button variant="ghost" asChild className="hover-pop gap-2">
                <Link href="/library">
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
