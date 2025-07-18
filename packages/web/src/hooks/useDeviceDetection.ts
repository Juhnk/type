'use client';

import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  screenWidth: number;
  userAgent: string;
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouchDevice: false,
    screenWidth: 1024,
    userAgent: '',
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent;
      const isTouchDevice =
        'ontouchstart' in window || navigator.maxTouchPoints > 0;

      // Breakpoints based on common standards
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice,
        screenWidth: width,
        userAgent,
      });
    };

    // Initial detection
    updateDeviceInfo();

    // Listen for resize events
    window.addEventListener('resize', updateDeviceInfo);

    // Listen for orientation changes on mobile
    window.addEventListener('orientationchange', () => {
      // Small delay to ensure the viewport has updated
      setTimeout(updateDeviceInfo, 100);
    });

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}

// Additional utility hook for responsive behavior
export function useResponsiveValue<T>(mobile: T, tablet: T, desktop: T): T {
  const { isMobile, isTablet } = useDeviceDetection();

  if (isMobile) return mobile;
  if (isTablet) return tablet;
  return desktop;
}

// Hook for checking if device has virtual keyboard
export function useVirtualKeyboard() {
  const [hasVirtualKeyboard, setHasVirtualKeyboard] = useState(false);
  const { isMobile, isTablet } = useDeviceDetection();

  useEffect(() => {
    if (!isMobile && !isTablet) {
      setHasVirtualKeyboard(false);
      return;
    }

    const handleResize = () => {
      // On mobile devices, viewport height reduction often indicates virtual keyboard
      const viewportHeight = window.innerHeight;
      const screenHeight = window.screen.height;
      const heightRatio = viewportHeight / screenHeight;

      // If viewport is significantly smaller than screen, likely virtual keyboard is open
      setHasVirtualKeyboard(heightRatio < 0.75);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile, isTablet]);

  return hasVirtualKeyboard;
}
