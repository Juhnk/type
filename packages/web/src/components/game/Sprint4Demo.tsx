'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { generateTextFromWords } from '@/lib/textGenerator';

/**
 * Demo component to showcase Sprint 4 functionality
 * Shows the integration between TypingArea and prepareGame action
 */
export function Sprint4Demo() {
  const [demoStatus, setDemoStatus] = useState('');
  const testConfig = useGameStore((state) => state.testConfig);
  const isPreparingGame = useGameStore((state) => state.isPreparingGame);
  const gamePreparationError = useGameStore(
    (state) => state.gamePreparationError
  );
  const textToType = useGameStore((state) => state.textToType);
  const prepareGame = useGameStore((state) => state.prepareGame);
  const setTestConfig = useGameStore((state) => state.setTestConfig);

  const demoConfigs = [
    { mode: 'time' as const, duration: 30, punctuation: false },
    { mode: 'words' as const, wordCount: 25 as const, punctuation: false },
    { mode: 'quote' as const, punctuation: true },
    { mode: 'time' as const, duration: 60, punctuation: true },
  ];

  const testTextGeneration = () => {
    const words = [
      'hello',
      'world',
      'test',
      'demo',
      'sprint',
      'four',
      'integration',
    ];

    demoConfigs.forEach((config, index) => {
      const generatedText = generateTextFromWords(words, {
        ...testConfig,
        ...config,
      });
      console.log(
        `Demo ${index + 1} (${config.mode}):`,
        generatedText.substring(0, 100) + '...'
      );
    });

    setDemoStatus('Text generation tests completed - check console');
  };

  const testGamePreparation = async () => {
    setDemoStatus('Testing game preparation...');

    // Test different configurations
    for (const config of demoConfigs) {
      setTestConfig(config);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for preparation
    }

    setDemoStatus('Game preparation tests completed');
  };

  return (
    <div className="bg-card rounded-lg border p-6">
      <h2 className="mb-4 text-xl font-bold">Sprint 4 Demo</h2>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Current Configuration:</h3>
          <p className="text-muted-foreground text-sm">
            Mode: {testConfig.mode},
            {testConfig.mode === 'time' && ` Duration: ${testConfig.duration}s`}
            {testConfig.mode === 'words' &&
              ` Word Count: ${testConfig.wordCount}`}
            {testConfig.mode === 'quote' && ` Quote Mode`}, Punctuation:{' '}
            {testConfig.punctuation ? 'Yes' : 'No'}
          </p>
        </div>

        <div>
          <h3 className="font-semibold">Game Status:</h3>
          <p className="text-muted-foreground text-sm">
            {isPreparingGame
              ? 'Preparing...'
              : gamePreparationError
                ? `Error: ${gamePreparationError}`
                : 'Ready'}
          </p>
        </div>

        <div>
          <h3 className="font-semibold">Generated Text Preview:</h3>
          <p className="text-muted-foreground bg-muted rounded p-2 text-sm">
            {textToType.substring(0, 100)}...
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={testTextGeneration}
            className="bg-primary text-primary-foreground rounded px-4 py-2 text-sm"
          >
            Test Text Generation
          </button>

          <button
            onClick={testGamePreparation}
            className="bg-secondary text-secondary-foreground rounded px-4 py-2 text-sm"
          >
            Test Game Preparation
          </button>

          <button
            onClick={() => prepareGame()}
            className="bg-accent text-accent-foreground rounded px-4 py-2 text-sm"
          >
            Prepare Game
          </button>
        </div>

        {demoStatus && (
          <div className="rounded bg-green-100 p-2 text-sm text-green-800">
            {demoStatus}
          </div>
        )}
      </div>
    </div>
  );
}
