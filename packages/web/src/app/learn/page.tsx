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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LearnPage() {
  const [topic, setTopic] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic to generate text.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: topic }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate text');
      }

      const data = await response.json();
      setGeneratedText(data.text);
      toast.success('Text generated successfully!');
    } catch (error) {
      console.error('Error generating text:', error);
      toast.error('Failed to generate text. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const examplePrompts = [
    'Space exploration and the future of humanity',
    'The history of artificial intelligence',
    'Climate change and renewable energy solutions',
    'The art of cooking and culinary traditions',
    'Modern architecture and urban planning',
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Amplify Your Practice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic">Enter your topic or interest:</Label>
              <Input
                id="topic"
                placeholder="e.g., machine learning, cooking, travel..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate'
              )}
            </Button>

            {generatedText && (
              <div className="space-y-2">
                <Label htmlFor="generated-text">Generated Practice Text:</Label>
                <Textarea
                  id="generated-text"
                  value={generatedText}
                  readOnly
                  className="min-h-[120px] resize-none"
                  placeholder="Your generated text will appear here..."
                />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="w-full">
              <h3 className="mb-2 font-semibold">Example prompts:</h3>
              <ul className="text-muted-foreground space-y-1 text-sm">
                {examplePrompts.map((prompt, index) => (
                  <li key={index} className="flex items-center">
                    <span className="mr-2">•</span>
                    <button
                      onClick={() => setTopic(prompt)}
                      className="hover:text-foreground text-left transition-colors"
                    >
                      {prompt}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
