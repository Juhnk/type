'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Eye } from 'lucide-react';

const sampleText =
  'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.';

export function PreviewSection() {
  const settings = useSettingsStore((state) => state.settings.appearance);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  // Simulate typing animation
  useEffect(() => {
    if (!settings.animations) return;

    const interval = setInterval(() => {
      setCurrentCharIndex((prev) => (prev + 1) % sampleText.length);
    }, 2000 / sampleText.length); // Complete cycle every 2 seconds

    return () => clearInterval(interval);
  }, [settings.animations]);

  // Get caret style classes
  const getCaretClasses = () => {
    const baseClasses = 'absolute transition-all';

    switch (settings.caretStyle) {
      case 'line':
        return `${baseClasses} w-0.5 h-full ${settings.smoothCaret ? 'transition-left duration-100' : ''}`;
      case 'block':
        return `${baseClasses} w-[1ch] h-full opacity-50 ${settings.smoothCaret ? 'transition-left duration-100' : ''}`;
      case 'underline':
        return `${baseClasses} w-[1ch] h-0.5 bottom-0 ${settings.smoothCaret ? 'transition-left duration-100' : ''}`;
      default:
        return baseClasses;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Live Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="bg-muted/50 relative rounded-lg p-4 sm:p-6"
          style={{
            fontFamily: settings.font,
            fontSize: `var(--typing-font-size-responsive, ${settings.fontSize}px)`,
          }}
        >
          {/* Stats Display */}
          {(settings.showWpmCounter || settings.showAccuracyCounter) && (
            <div className="text-muted-foreground mb-4 flex gap-4 text-xs sm:text-sm">
              {settings.showWpmCounter && (
                <div>
                  <span className="font-semibold">WPM:</span> 75
                </div>
              )}
              {settings.showAccuracyCounter && (
                <div>
                  <span className="font-semibold">Accuracy:</span> 98%
                </div>
              )}
            </div>
          )}

          {/* Typing Area */}
          <div className="relative font-mono leading-relaxed">
            {sampleText.split('').map((char, index) => (
              <span
                key={index}
                className={`relative ${
                  index < currentCharIndex
                    ? 'text-muted-foreground'
                    : index === currentCharIndex
                      ? 'text-foreground'
                      : 'text-muted-foreground/50'
                }`}
              >
                {char}
                {index === currentCharIndex && (
                  <span
                    className={getCaretClasses()}
                    style={{
                      backgroundColor: settings.caretColor,
                      left: settings.caretStyle === 'line' ? '-2px' : '0',
                    }}
                  />
                )}
              </span>
            ))}
          </div>

          {/* Theme Preview */}
          <div className="text-muted-foreground mt-4 hidden border-t pt-4 text-xs sm:block">
            Theme: {settings.theme} • Font: {settings.font} • Size:{' '}
            {settings.fontSize}px
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
