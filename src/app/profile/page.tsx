'use client';

import React, { useEffect, useState } from 'react';
import { getTestHistory, type TestResult } from '@/lib/history';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const [history, setHistory] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load test history from localStorage
    const loadHistory = () => {
      try {
        const testHistory = getTestHistory();
        setHistory(testHistory);
      } catch (error) {
        console.error('Error loading test history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  // Format date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Get mode display text
  const getModeDisplay = (mode: string) => {
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  };

  // Get duration or word count display
  const getTestDetails = (result: TestResult) => {
    if (result.mode === 'time' && result.duration) {
      return `${result.duration}s`;
    } else if (result.mode === 'words' && result.wordCount) {
      return `${result.wordCount} words`;
    }
    return '-';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="animate-pulse">
          <div className="mb-8 h-8 w-1/4 rounded bg-gray-200"></div>
          <div className="space-y-3">
            <div className="h-12 rounded bg-gray-200"></div>
            <div className="h-12 rounded bg-gray-200"></div>
            <div className="h-12 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          View your typing test history and track your progress over time.
        </p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableCaption>
            {history.length === 0
              ? 'No test history yet. Complete a typing test to see your results here.'
              : `Showing ${history.length} test${history.length === 1 ? '' : 's'}`}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>WPM</TableHead>
              <TableHead>Accuracy</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Word List</TableHead>
              <TableHead>Modifiers</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-muted-foreground text-center"
                >
                  No tests completed yet
                </TableCell>
              </TableRow>
            ) : (
              history.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">
                    {formatDate(result.timestamp)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getModeDisplay(result.mode)}
                    </Badge>
                  </TableCell>
                  <TableCell>{getTestDetails(result)}</TableCell>
                  <TableCell className="font-semibold">{result.wpm}</TableCell>
                  <TableCell>
                    <span
                      className={result.accuracy >= 95 ? 'text-green-600' : ''}
                    >
                      {result.accuracy}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        result.difficulty === 'Master'
                          ? 'destructive'
                          : result.difficulty === 'Expert'
                            ? 'default'
                            : 'secondary'
                      }
                    >
                      {result.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {result.textSource.replace('-', ' ').replace('1k', '1K')}
                  </TableCell>
                  <TableCell>
                    {result.punctuation && (
                      <Badge variant="outline" className="text-xs">
                        Punctuation
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
