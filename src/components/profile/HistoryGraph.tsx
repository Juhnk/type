'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  TooltipProps,
} from 'recharts';
import { type TestResult } from '@/lib/history';

interface HistoryGraphProps {
  testHistory: TestResult[];
}

interface ChartDataPoint {
  date: string;
  wpm: number;
  accuracy: number;
  timestamp: number;
}

export function HistoryGraph({ testHistory }: HistoryGraphProps) {
  // Transform test history data for the chart
  const chartData: ChartDataPoint[] = testHistory
    .slice() // Create a copy to avoid mutating the original
    .reverse() // Show oldest first to newest last
    .map((result) => ({
      date: new Date(result.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      wpm: result.wpm,
      accuracy: result.accuracy,
      timestamp: result.timestamp,
    }));

  // Custom tooltip component
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;
      return (
        <div className="bg-background rounded-lg border p-3 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-muted-foreground text-sm">
            {new Date(data.timestamp).toLocaleString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
          <div className="mt-2 space-y-1">
            <p className="text-sm">
              <span className="text-primary font-medium">WPM:</span> {data.wpm}
            </p>
            <p className="text-sm">
              <span className="font-medium text-green-600">Accuracy:</span>{' '}
              {data.accuracy}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (testHistory.length === 0) {
    return (
      <div className="text-muted-foreground flex h-[300px] items-center justify-center">
        <p>No test history to display</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            className="text-xs"
            tick={{ fill: 'currentColor' }}
            tickLine={{ stroke: 'currentColor' }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: 'currentColor' }}
            tickLine={{ stroke: 'currentColor' }}
            label={{
              value: 'Words per Minute',
              angle: -90,
              position: 'insideLeft',
              className: 'fill-muted-foreground',
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="wpm"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 4, fill: 'hsl(var(--primary))' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
