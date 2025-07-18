'use client';

import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  fps: number;
  inputLatency: number;
  renderTime: number;
  memoryUsage: number;
  longTasks: number;
}

interface PerformanceOptions {
  trackFPS?: boolean;
  trackMemory?: boolean;
  trackLongTasks?: boolean;
  onPerformanceIssue?: (metrics: PerformanceMetrics) => void;
}

export function usePerformanceMonitor(options: PerformanceOptions = {}) {
  const {
    trackFPS = true,
    trackMemory = true,
    trackLongTasks = true,
    onPerformanceIssue,
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    inputLatency: 0,
    renderTime: 0,
    memoryUsage: 0,
    longTasks: 0,
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsRef = useRef(60);
  const longTaskCountRef = useRef(0);
  const rafIdRef = useRef<number | undefined>(undefined);

  // FPS Tracking
  useEffect(() => {
    if (!trackFPS) return;

    const measureFPS = () => {
      frameCountRef.current++;
      const now = performance.now();
      const delta = now - lastTimeRef.current;

      if (delta >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / delta);
        fpsRef.current = fps;
        frameCountRef.current = 0;
        lastTimeRef.current = now;

        setMetrics((prev) => ({ ...prev, fps }));

        // Alert on poor performance
        if (fps < 30 && onPerformanceIssue) {
          onPerformanceIssue({ ...metrics, fps });
        }
      }

      rafIdRef.current = requestAnimationFrame(measureFPS);
    };

    rafIdRef.current = requestAnimationFrame(measureFPS);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [trackFPS, metrics, onPerformanceIssue]);

  // Memory Usage Tracking
  useEffect(() => {
    if (!trackMemory || !('memory' in performance)) return;

    const measureMemory = () => {
      const memory = (
        performance as unknown as { memory?: { usedJSHeapSize: number } }
      ).memory;
      if (memory) {
        const memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
        setMetrics((prev) => ({ ...prev, memoryUsage }));

        // Alert on high memory usage (>100MB)
        if (memoryUsage > 100 && onPerformanceIssue) {
          onPerformanceIssue({ ...metrics, memoryUsage });
        }
      }
    };

    const interval = setInterval(measureMemory, 5000);
    return () => clearInterval(interval);
  }, [trackMemory, metrics, onPerformanceIssue]);

  // Long Task Tracking
  useEffect(() => {
    if (!trackLongTasks || !('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          // Tasks longer than 50ms
          longTaskCountRef.current++;
          setMetrics((prev) => ({
            ...prev,
            longTasks: longTaskCountRef.current,
          }));
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['longtask'] });
    } catch {
      // Longtask observer not supported
    }

    return () => observer.disconnect();
  }, [trackLongTasks]);

  // Input Latency Tracking
  const measureInputLatency = (startTime: number) => {
    const latency = performance.now() - startTime;
    setMetrics((prev) => ({ ...prev, inputLatency: latency }));

    // Alert on high input latency (>16ms for 60fps)
    if (latency > 16 && onPerformanceIssue) {
      onPerformanceIssue({ ...metrics, inputLatency: latency });
    }
  };

  // Render Time Tracking
  const measureRenderStart = () => performance.now();

  const measureRenderEnd = (startTime: number) => {
    const renderTime = performance.now() - startTime;
    setMetrics((prev) => ({ ...prev, renderTime }));
  };

  // Performance Scoring
  const getPerformanceScore = (): 'excellent' | 'good' | 'fair' | 'poor' => {
    const { fps, inputLatency, memoryUsage } = metrics;

    if (fps >= 55 && inputLatency < 8 && memoryUsage < 50) return 'excellent';
    if (fps >= 45 && inputLatency < 16 && memoryUsage < 75) return 'good';
    if (fps >= 30 && inputLatency < 32 && memoryUsage < 100) return 'fair';
    return 'poor';
  };

  // Performance Suggestions
  const getPerformanceSuggestions = (): string[] => {
    const suggestions: string[] = [];
    const { fps, inputLatency, memoryUsage, longTasks } = metrics;

    if (fps < 30) {
      suggestions.push(
        'Low frame rate detected. Try closing other browser tabs or applications.'
      );
    }

    if (inputLatency > 50) {
      suggestions.push(
        'High input latency detected. Check for browser extensions or system load.'
      );
    }

    if (memoryUsage > 100) {
      suggestions.push(
        'High memory usage detected. Consider refreshing the page.'
      );
    }

    if (longTasks > 10) {
      suggestions.push(
        'Multiple long tasks detected. Performance may be impacted.'
      );
    }

    return suggestions;
  };

  return {
    metrics,
    measureInputLatency,
    measureRenderStart,
    measureRenderEnd,
    getPerformanceScore,
    getPerformanceSuggestions,
  };
}

// Simplified hook for typing-specific performance
export function useTypingPerformance() {
  const [keyPressLatency, setKeyPressLatency] = useState(0);
  const [averageLatency, setAverageLatency] = useState(0);
  const latencyHistory = useRef<number[]>([]);

  const measureKeyPress = (startTime: number) => {
    const latency = performance.now() - startTime;
    setKeyPressLatency(latency);

    // Keep rolling average of last 20 key presses
    latencyHistory.current.push(latency);
    if (latencyHistory.current.length > 20) {
      latencyHistory.current.shift();
    }

    const avg =
      latencyHistory.current.reduce((a, b) => a + b, 0) /
      latencyHistory.current.length;
    setAverageLatency(avg);
  };

  const getTypingPerformanceStatus = ():
    | 'excellent'
    | 'good'
    | 'fair'
    | 'poor' => {
    if (averageLatency < 5) return 'excellent';
    if (averageLatency < 10) return 'good';
    if (averageLatency < 20) return 'fair';
    return 'poor';
  };

  return {
    keyPressLatency,
    averageLatency,
    measureKeyPress,
    getTypingPerformanceStatus,
  };
}
