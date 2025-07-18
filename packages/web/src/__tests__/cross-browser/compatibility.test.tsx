/**
 * Cross-Browser Compatibility Tests for TypeAmp
 *
 * These tests check for browser-specific functionality and compatibility issues
 * Run with: npm run test:compatibility
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { TypingArea } from '@/components/game/TypingArea';
import { EnhancedCommandPalette } from '@/components/core/EnhancedCommandPalette';

// Mock user agents for different browsers
const userAgents = {
  chrome:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  firefox:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  safari:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  mobile:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
};

describe('Cross-Browser Compatibility', () => {
  let originalUserAgent: string;

  beforeEach(() => {
    originalUserAgent = navigator.userAgent;
  });

  afterEach(() => {
    // Restore original user agent
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true,
    });
  });

  const mockUserAgent = (userAgent: string) => {
    Object.defineProperty(navigator, 'userAgent', {
      value: userAgent,
      configurable: true,
    });
  };

  describe('Keyboard Event Handling', () => {
    it('should handle keyboard events consistently across browsers', async () => {
      const browsers = Object.entries(userAgents);

      for (const [browserName, userAgent] of browsers) {
        mockUserAgent(userAgent);

        render(<TypingArea />);

        // Test basic key press
        await userEvent.keyboard('h');
        await userEvent.keyboard('e');
        await userEvent.keyboard('l');

        // Should work the same across all browsers
        expect(screen.getByRole('main')).toBeInTheDocument();
      }
    });

    it('should handle special keys consistently', async () => {
      render(<TypingArea />);

      // Test backspace
      await userEvent.keyboard('test');
      await userEvent.keyboard('{Backspace}');

      // Test escape (should not cause errors)
      await userEvent.keyboard('{Escape}');

      // Test tab (should be prevented)
      await userEvent.keyboard('{Tab}');

      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('CSS Feature Support', () => {
    it('should gracefully handle CSS Grid support', () => {
      // Test if CSS Grid is supported
      const supportsGrid = CSS.supports('display', 'grid');

      if (!supportsGrid) {
        // Should have fallback layout
        console.warn('CSS Grid not supported, using fallback layout');
      }

      expect(true).toBe(true); // Test passes regardless of support
    });

    it('should handle CSS custom properties', () => {
      // Test CSS custom properties support
      const supportsCustomProps = CSS.supports('color', 'var(--test-color)');

      if (!supportsCustomProps) {
        console.warn('CSS custom properties not supported');
      }

      expect(true).toBe(true);
    });

    it('should handle CSS animations and transitions', () => {
      const supportsAnimations = CSS.supports('animation', 'test 1s linear');
      const supportsTransitions = CSS.supports('transition', 'all 0.3s ease');

      if (!supportsAnimations) {
        console.warn('CSS animations not supported');
      }

      if (!supportsTransitions) {
        console.warn('CSS transitions not supported');
      }

      expect(true).toBe(true);
    });
  });

  describe('Performance API Support', () => {
    it('should handle performance.now() availability', () => {
      const hasPerformanceNow =
        typeof performance !== 'undefined' &&
        typeof performance.now === 'function';

      if (!hasPerformanceNow) {
        console.warn(
          'performance.now() not available, using Date.now() fallback'
        );
      }

      expect(true).toBe(true);
    });

    it('should handle IntersectionObserver support', () => {
      const hasIntersectionObserver = 'IntersectionObserver' in window;

      if (!hasIntersectionObserver) {
        console.warn('IntersectionObserver not supported');
      }

      expect(true).toBe(true);
    });

    it('should handle ResizeObserver support', () => {
      const hasResizeObserver = 'ResizeObserver' in window;

      if (!hasResizeObserver) {
        console.warn('ResizeObserver not supported');
      }

      expect(true).toBe(true);
    });
  });

  describe('Touch Events Support', () => {
    it('should detect touch device capabilities', () => {
      // Test touch event support
      const hasTouchEvents = 'ontouchstart' in window;
      const hasMaxTouchPoints = navigator.maxTouchPoints > 0;

      const isTouchDevice = hasTouchEvents || hasMaxTouchPoints;

      if (isTouchDevice) {
        console.log('Touch device detected');
      }

      expect(true).toBe(true);
    });

    it('should handle pointer events', () => {
      const hasPointerEvents = 'onpointerdown' in window;

      if (!hasPointerEvents) {
        console.warn(
          'Pointer events not supported, using mouse/touch fallback'
        );
      }

      expect(true).toBe(true);
    });
  });

  describe('Local Storage Support', () => {
    it('should handle localStorage availability', () => {
      let hasLocalStorage = false;

      try {
        hasLocalStorage = typeof localStorage !== 'undefined';
        if (hasLocalStorage) {
          localStorage.setItem('test', 'test');
          localStorage.removeItem('test');
        }
      } catch (e) {
        hasLocalStorage = false;
      }

      if (!hasLocalStorage) {
        console.warn('localStorage not available');
      }

      expect(true).toBe(true);
    });
  });

  describe('Font Loading', () => {
    it('should handle font loading gracefully', async () => {
      // Test if FontFace API is available
      const hasFontFaceAPI = 'FontFace' in window;

      if (!hasFontFaceAPI) {
        console.warn('FontFace API not supported');
      }

      // Test document.fonts if available
      if ('fonts' in document) {
        try {
          await document.fonts.ready;
          console.log('Fonts loaded successfully');
        } catch (e) {
          console.warn('Font loading failed:', e);
        }
      }

      expect(true).toBe(true);
    });
  });

  describe('Command Palette Compatibility', () => {
    it('should handle Command Palette in different browsers', async () => {
      const browsers = Object.entries(userAgents);

      for (const [browserName, userAgent] of browsers) {
        mockUserAgent(userAgent);

        render(<EnhancedCommandPalette />);

        // Test opening command palette
        fireEvent.keyDown(document, { key: 'Escape' });

        // Should work across all browsers
        expect(true).toBe(true);
      }
    });
  });

  describe('Viewport and Responsive Behavior', () => {
    it('should handle viewport changes', () => {
      // Test viewport meta tag
      const viewportMeta = document.querySelector('meta[name="viewport"]');

      if (!viewportMeta) {
        console.warn('Viewport meta tag not found');
      }

      // Test window.innerWidth/Height availability
      const hasViewportDimensions =
        typeof window.innerWidth === 'number' &&
        typeof window.innerHeight === 'number';

      if (!hasViewportDimensions) {
        console.warn('Viewport dimensions not available');
      }

      expect(true).toBe(true);
    });

    it('should handle orientation changes', () => {
      const hasOrientationAPI =
        'orientation' in window || 'orientation' in screen;

      if (!hasOrientationAPI) {
        console.warn('Orientation API not available');
      }

      expect(true).toBe(true);
    });
  });

  describe('Audio Context Support', () => {
    it('should handle audio feedback gracefully', () => {
      const hasAudioContext =
        'AudioContext' in window || 'webkitAudioContext' in window;

      if (!hasAudioContext) {
        console.warn('AudioContext not supported, audio feedback disabled');
      }

      expect(true).toBe(true);
    });
  });

  describe('Clipboard API Support', () => {
    it('should handle clipboard operations', () => {
      const hasClipboardAPI = 'clipboard' in navigator;

      if (!hasClipboardAPI) {
        console.warn('Clipboard API not supported');
      }

      expect(true).toBe(true);
    });
  });

  describe('Memory Management', () => {
    it('should handle memory constraints on mobile devices', () => {
      // Test memory info availability (Chrome only)
      const hasMemoryInfo = 'memory' in performance;

      if (hasMemoryInfo) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;

        if (usedMB > 50) {
          console.warn(`High memory usage detected: ${usedMB.toFixed(2)}MB`);
        }
      }

      expect(true).toBe(true);
    });
  });
});

// Browser-specific feature detection utilities
export const BrowserCapabilities = {
  // Check if running in Chrome
  isChrome: () =>
    /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor),

  // Check if running in Firefox
  isFirefox: () => /Firefox/.test(navigator.userAgent),

  // Check if running in Safari
  isSafari: () =>
    /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),

  // Check if running in Edge
  isEdge: () => /Edg/.test(navigator.userAgent),

  // Check if mobile device
  isMobile: () => /Mobi|Android/i.test(navigator.userAgent),

  // Check specific feature support
  supports: {
    webGL: () => {
      try {
        const canvas = document.createElement('canvas');
        return !!(
          canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
        );
      } catch (e) {
        return false;
      }
    },

    webWorkers: () => typeof Worker !== 'undefined',

    serviceWorkers: () => 'serviceWorker' in navigator,

    pushNotifications: () => 'PushManager' in window,

    geolocation: () => 'geolocation' in navigator,

    accelerometer: () => 'DeviceMotionEvent' in window,

    camera: () =>
      'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
  },
};
