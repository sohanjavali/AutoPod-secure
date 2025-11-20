'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, Library, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  isLoggedIn: boolean;
  onLogout: () => void;
  darkMode: boolean;
  onDarkModeToggle: () => void;
}

export function Header({ isLoggedIn, onLogout, darkMode, onDarkModeToggle }: HeaderProps) {
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
            onClick={onDarkModeToggle}
            className="hover-pop p-2"
            size="sm"
          >
            {darkMode ? (
              <Sun className="h-4 w-4 text-foreground" />
            ) : (
              <Moon className="h-4 w-4 text-foreground" />
            )}
          </Button>
          {isLoggedIn && (
            <>
              <Button variant="ghost" asChild className="hover-pop gap-2">
                <Link href="/dashboard">
                  <Library className="h-4 w-4" />
                  <span className="hidden sm:inline">Library</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={onLogout}
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
