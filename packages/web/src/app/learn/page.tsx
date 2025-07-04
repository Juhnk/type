'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function LearnPage() {
  const [topic, setTopic] = useState('');

  const handleGenerate = () => {
    // This will be wired up to the API in the next step
    console.log('Generate clicked with topic:', topic);
  };

  const examplePrompts = [
    'the history of space exploration',
    'common JavaScript array methods',
    'climate change and renewable energy',
    'famous quotes from literature',
    'basic cooking techniques',
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Amplify Your Practice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Enter a topic for AI-generated practice text..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <Button onClick={handleGenerate} className="w-full">
              Generate
            </Button>
          </CardContent>
          <CardFooter>
            <div className="w-full">
              <p className="text-muted-foreground mb-2 text-sm">
                Example prompts:
              </p>
              <ul className="text-muted-foreground space-y-1 text-sm">
                {examplePrompts.map((prompt, index) => (
                  <li key={index}>• {prompt}</li>
                ))}
              </ul>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
