"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { X, Mail, Lock } from 'lucide-react';
import { createClient as createSupabaseClient } from '@/utiils/supabase/client';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: () => void;
}

export function LoginModal({ onClose, onLoginSuccess }: LoginModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle form submission for sign-in or sign-up (using email/password)
  const handleSubmit = async () => {
    if (!email || !password) return;

    setErrorMessage(null);
    setIsLoading(true);

    const supabase = createSupabaseClient();

    // Sepearate sign-in and sign-up flows
    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        console.log('Signup error:', error);
        setErrorMessage(error.message ?? 'Authentication failed');
        setIsLoading(false);
        return;
      }

      // If signup returns a user, consider it successful (email confirm flows may still be required)
      if (data?.user) {
        // If a session is returned (rare with confirm flows), persist it server-side
        if (data.session) {
          await fetch('/api/auth/set-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
              expires_at: data.session.expires_at,
            }),
          })
        }
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setErrorMessage(error.message ?? 'Authentication failed');
        setIsLoading(false);
        return;
      }

      if (data?.session) {
        // Persist tokens to HttpOnly cookies so middleware can read them
        await fetch('/api/auth/set-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
          }),
        })
      }
    }

    onLoginSuccess()
    onClose()
    setIsLoading(false);
  };

  // Handle Google OAuth sign-in
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    const supabase = createSupabaseClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' },
    });
      
    if (error) {
      setErrorMessage(error.message ?? 'Google sign-in failed');
      setIsLoading(false);
    };
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md animate-in fade-in scale-in rounded-3xl bg-white dark:bg-card p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="hover-pop absolute right-6 top-6 rounded-lg p-2"
        >
          <X className="h-5 w-5 text-foreground" />
        </button>

        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-foreground">
            {isSignUp ? 'Join AutoPod' : 'Welcome to AutoPod'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {isSignUp
              ? 'Create an account to start generating podcasts'
              : 'Sign in to create amazing podcasts'}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Email field */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-xl border border-border bg-secondary py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          {/* Password field */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl border border-border bg-secondary py-3 pl-12 pr-12 text-foreground placeholder:text-muted-foreground transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-all hover:text-foreground"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        {/* Google sign-in button */}
        <Button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="mt-4 w-full gap-3 rounded-full border border-border bg-white dark:bg-secondary py-3 text-foreground hover:bg-blue-50 dark:hover:bg-secondary/80"
        >
          {/* Google icon (SVG) */}
          <svg width="18" height="18" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.4H272v95.3h146.9c-6.3 34.1-25 62.9-53.4 82v68.1h86.2c50.4-46.5 81.8-115 81.8-195z"/>
            <path fill="#34A853" d="M272 544.3c72.6 0 133.6-24.1 178.1-65.4l-86.2-68.1c-24 16.1-54.7 25.6-91.9 25.6-70.6 0-130.5-47.6-151.9-111.6H30.8v69.9C75.2 486.4 167.1 544.3 272 544.3z"/>
            <path fill="#FBBC05" d="M120.1 325.3c-10.8-31.9-10.8-66.1 0-98l-89.3-69.9C8.5 213.6 0 241 0 272c0 31 8.5 58.4 30.8 114.6l89.3-61.3z"/>
            <path fill="#EA4335" d="M272 107.7c38.9 0 73.9 13.4 101.4 39.8l76-76C405.6 24.8 345.9 0 272 0 167.1 0 75.2 57.9 30.8 143.4l89.3 69.9C141.5 155.3 201.4 107.7 272 107.7z"/>
          </svg>
          <span className="text-sm font-medium">Continue with Google</span>
        </Button>

        {/* Submit button */}
        <Button
          onClick={handleSubmit}
          disabled={!email || !password || isLoading}
          className="mt-4 w-full rounded-full bg-primary py-3 text-primary-foreground hover:bg-primary/90"
        >
          {isLoading
            ? 'Please wait...'
            : isSignUp
              ? 'Create Account'
              : 'Sign In'}
        </Button>

        {errorMessage && (
          <p className="mt-3 text-center text-sm text-destructive">{errorMessage}</p>
        )}

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-medium text-accent transition-all hover:underline"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  , document.body
  );
}
