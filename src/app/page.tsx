import React from 'react';
import { ConfigurationBar } from '@/components/game/ConfigurationBar';

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

      <div className="bg-card rounded-lg border p-8 text-center">
        <h2 className="mb-4 text-2xl font-semibold">Ready to Start Typing?</h2>
        <p className="text-muted-foreground mb-6">
          Configure your test settings above and click start when ready.
        </p>
        <div className="space-y-4">
          <div className="text-muted-foreground text-sm">
            Typing interface will be implemented next...
          </div>
        </div>
      </div>
    </div>
  );
}
