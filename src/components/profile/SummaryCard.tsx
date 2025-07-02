'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { type TestResult } from '@/lib/history';
import {
  calculateAverageWpm,
  calculateHighestWpm,
  calculateAverageAccuracy,
  getTotalTestsTaken,
} from '@/lib/history';

interface SummaryCardProps {
  testHistory: TestResult[];
}

interface StatItemProps {
  label: string;
  value: string | number;
  unit?: string;
}

function StatItem({ label, value, unit }: StatItemProps) {
  return (
    <div className="text-center">
      <p className="text-muted-foreground mb-1 text-sm">{label}</p>
      <p className="text-3xl font-bold">
        {value}
        {unit && (
          <span className="text-muted-foreground ml-1 text-xl">{unit}</span>
        )}
      </p>
    </div>
  );
}

export function SummaryCard({ testHistory }: SummaryCardProps) {
  // Calculate aggregate statistics
  const averageWpm = calculateAverageWpm(testHistory);
  const highestWpm = calculateHighestWpm(testHistory);
  const averageAccuracy = calculateAverageAccuracy(testHistory);
  const totalTests = getTotalTestsTaken(testHistory);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <StatItem label="Average WPM" value={averageWpm} unit="wpm" />
          <StatItem label="Highest WPM" value={highestWpm} unit="wpm" />
          <StatItem label="Average Accuracy" value={averageAccuracy} unit="%" />
          <StatItem label="Total Tests" value={totalTests} />
        </div>
      </CardContent>
    </Card>
  );
}
