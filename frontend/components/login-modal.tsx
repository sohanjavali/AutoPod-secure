'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Mail, Lock } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: () => void;
}

export function LoginModal({ onClose, onLoginSuccess }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = () => {
    if (email && password) {
      setIsLoading(true);
      // Simulate login/signup
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess();
        onClose();
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md animate-in fade-in scale-in rounded-3xl bg-white p-8 shadow-2xl">
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

        {/* Submit button */}
        <Button
          onClick={handleSubmit}
          disabled={!email || !password || isLoading}
          className="hover-pop mt-6 w-full rounded-full bg-foreground py-3 text-white hover:bg-foreground/90"
        >
          {isLoading
            ? 'Please wait...'
            : isSignUp
              ? 'Create Account'
              : 'Sign In'}
        </Button>

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
  );
}
