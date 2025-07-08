import { useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';

export function useAppliedSettings() {
  const settings = useSettingsStore((state) => state.settings);

  useEffect(() => {
    // Apply theme
    document.documentElement.setAttribute(
      'data-theme',
      settings.appearance.theme
    );

    // Apply color scheme
    if (settings.appearance.colorScheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (settings.appearance.colorScheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // Auto - use system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    // Apply font
    document.documentElement.style.setProperty(
      '--typing-font',
      settings.appearance.font
    );

    // Apply animations
    if (!settings.appearance.animations) {
      document.documentElement.classList.add('no-animations');
    } else {
      document.documentElement.classList.remove('no-animations');
    }

    // Apply caret color
    document.documentElement.style.setProperty(
      '--caret-color',
      settings.appearance.caretColor
    );

    // Apply font size
    document.documentElement.style.setProperty(
      '--typing-font-size',
      `${settings.appearance.fontSize}px`
    );

    // Handle responsive font sizing
    const handleResize = () => {
      const isMobile = window.innerWidth < 640;
      const adjustedFontSize = isMobile
        ? Math.max(14, settings.appearance.fontSize - 2)
        : settings.appearance.fontSize;
      document.documentElement.style.setProperty(
        '--typing-font-size-responsive',
        `${adjustedFontSize}px`
      );
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [settings.appearance]);

  return settings;
}
