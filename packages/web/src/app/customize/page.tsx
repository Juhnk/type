'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Palette, Activity, Sun, Moon, Monitor } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Caret } from '@/components/game/CaretComponents';

const PREVIEW_TEXT = 'TypeAmp';

export default function CustomizePage() {
  const {
    settings,
    updateColorScheme,
    updateCaretStyle,
    saveToServer,
    loadFromServer,
  } = useSettingsStore();
  const { token } = useAuthStore();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [caretVisible, setCaretVisible] = useState(true);

  // Load settings from server on mount if authenticated
  useEffect(() => {
    if (token) {
      loadFromServer().catch(() => {
        toast.error('Failed to load settings from server');
      });
    }
  }, [token, loadFromServer]);

  // Auto-save settings when they change (debounced)
  useEffect(() => {
    if (!token || !hasUnsavedChanges) return;

    const timeoutId = setTimeout(() => {
      saveToServer()
        .then(() => {
          setHasUnsavedChanges(false);
          toast.success('Settings saved');
        })
        .catch(() => {
          toast.error('Failed to save settings');
        });
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [settings, token, hasUnsavedChanges, saveToServer]);

  // Mark as having unsaved changes when settings change
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [settings]);

  // Caret blinking animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCaretVisible((prev) => !prev);
    }, 530);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">Customize TypeAmp</h1>
        <p className="text-muted-foreground">
          Choose your theme and caret style for a personalized typing experience
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Theme Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Theme
            </CardTitle>
            <CardDescription>
              Select your preferred color scheme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={settings.appearance.colorScheme}
              onValueChange={updateColorScheme}
              className="space-y-3"
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem value="light" id="light" />
                <Label
                  htmlFor="light"
                  className="flex cursor-pointer items-center gap-2 font-medium"
                >
                  <Sun className="h-4 w-4" />
                  Light
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="dark" id="dark" />
                <Label
                  htmlFor="dark"
                  className="flex cursor-pointer items-center gap-2 font-medium"
                >
                  <Moon className="h-4 w-4" />
                  Dark
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="auto" id="auto" />
                <Label
                  htmlFor="auto"
                  className="flex cursor-pointer items-center gap-2 font-medium"
                >
                  <Monitor className="h-4 w-4" />
                  System
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Caret Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Caret Style
            </CardTitle>
            <CardDescription>
              Choose how your typing cursor appears
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Live Preview */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Live Preview</Label>
              <div
                className="bg-muted/50 relative rounded-lg border p-4 font-mono"
                style={{
                  fontFamily: settings.appearance.font,
                  fontSize: `${settings.appearance.fontSize}px`,
                }}
              >
                <div className="relative leading-relaxed">
                  <span className="text-foreground">
                    {PREVIEW_TEXT}
                    <Caret
                      position={0}
                      visible={caretVisible}
                      className="!left-0"
                    />
                  </span>
                </div>
              </div>
            </div>

            {/* Caret Style Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Style</Label>
              <RadioGroup
                value={settings.appearance.caretStyle}
                onValueChange={updateCaretStyle}
                className="space-y-3"
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="line" id="line" />
                  <Label
                    htmlFor="line"
                    className="flex cursor-pointer items-center gap-2 font-medium"
                  >
                    <span className="font-mono">|</span>
                    Line
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="block" id="block" />
                  <Label
                    htmlFor="block"
                    className="flex cursor-pointer items-center gap-2 font-medium"
                  >
                    <span className="font-mono">▮</span>
                    Block
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="underline" id="underline" />
                  <Label
                    htmlFor="underline"
                    className="flex cursor-pointer items-center gap-2 font-medium"
                  >
                    <span className="font-mono">_</span>
                    Underline
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status indicator for authenticated users */}
      {!token && (
        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm">
            Sign in to sync your settings across devices
          </p>
        </div>
      )}

      {token && hasUnsavedChanges && (
        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm">
            Settings will save automatically...
          </p>
        </div>
      )}
    </div>
  );
}
