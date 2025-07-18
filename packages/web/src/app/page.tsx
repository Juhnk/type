import React from 'react';
import { ConfigurationBar } from '@/components/game/ConfigurationBar';
import { TypingArea } from '@/components/game/TypingArea';

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to TypeAmp
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Frictionless skill amplification through typing practice
        </p>
      </div>

      <ConfigurationBar />

      <TypingArea />
    </div>
  );
}
