'use client';

import React from 'react';
import Link from 'next/link';
import { Home, User, BarChart3, BrainCircuit, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useModalStore } from '@/store/useModalStore';

export function Header() {
  const { openAuthModal } = useModalStore();
  return (
    <header className="bg-background flex items-center justify-between border-b px-6 py-4">
      <div className="flex items-center space-x-4">
        <Link href="/" className="text-xl font-bold">
          TypeAmp
        </Link>
      </div>

      <nav className="flex items-center space-x-6">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground flex items-center space-x-2 transition-colors"
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Link>
        <Link
          href="/profile"
          className="text-muted-foreground hover:text-foreground flex items-center space-x-2 transition-colors"
        >
          <User className="h-4 w-4" />
          <span>Profile</span>
        </Link>
        <Link
          href="/stats"
          className="text-muted-foreground hover:text-foreground flex items-center space-x-2 transition-colors"
        >
          <BarChart3 className="h-4 w-4" />
          <span>Stats</span>
        </Link>
        <Link
          href="/learn"
          className="text-muted-foreground hover:text-foreground flex items-center space-x-2 transition-colors"
        >
          <BrainCircuit className="h-4 w-4" />
          <span>Learn</span>
        </Link>
        <Link
          href="/settings"
          className="text-muted-foreground hover:text-foreground flex items-center space-x-2 transition-colors"
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Link>
      </nav>

      <Button variant="outline" onClick={openAuthModal}>
        Login
      </Button>
    </header>
  );
}
