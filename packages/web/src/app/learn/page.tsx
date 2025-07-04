'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Play } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { useGameStore } from '@/store/useGameStore';
import { generateChallenge } from '@/lib/api-client';

export default function LearnPage() {
  const [topic, setTopic] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuthStore();
  const { setTextToType, setTestConfig } = useGameStore();
  const router = useRouter();

  const handleGenerate = async () => {
    // Validate input
    if (!topic.trim()) {
      toast.error('Please enter a topic to generate text');
      return;
    }

    // Check authentication
    if (!token) {
      toast.error('Please log in to use AI text generation');
      return;
    }

    setIsLoading(true);
    try {
      const response = await generateChallenge(topic, token);
      setGeneratedText(response.text);
      toast.success('Text generated successfully!');
    } catch (error) {
      console.error('Failed to generate text:', error);
      toast.error('Failed to generate text. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePractice = () => {
    // Set the game mode to 'quote' for custom text
    setTestConfig({ mode: 'quote' });

    // Load the AI-generated text into the game store
    setTextToType(generatedText);

    // Navigate to the main typing interface
    router.push('/');

    // Show success toast
    toast.success('Starting practice session with AI-generated text!');
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
            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate'
              )}
            </Button>
            {generatedText && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Generated Text:</p>
                  <Textarea
                    value={generatedText}
                    readOnly
                    className="min-h-[200px] resize-none"
                    placeholder="Your generated text will appear here..."
                  />
                </div>
                <Button
                  onClick={handlePractice}
                  className="w-full"
                  variant="default"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Practice this text
                </Button>
              </div>
            )}
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
