'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Monitor, Moon, Sun, Type, Palette, Eye, Activity } from 'lucide-react';

const themes = [
  { value: 'slate', label: 'Slate', colors: ['#1e293b', '#334155', '#64748b'] },
  { value: 'dark', label: 'Dark', colors: ['#000000', '#171717', '#404040'] },
  { value: 'nord', label: 'Nord', colors: ['#2e3440', '#3b4252', '#88c0d0'] },
  {
    value: 'dracula',
    label: 'Dracula',
    colors: ['#282a36', '#44475a', '#bd93f9'],
  },
  {
    value: 'monokai',
    label: 'Monokai',
    colors: ['#272822', '#3e3d32', '#a6e22e'],
  },
  { value: 'ocean', label: 'Ocean', colors: ['#0f172a', '#1e3a8a', '#60a5fa'] },
];

const fonts = [
  { value: 'Roboto Mono', label: 'Roboto Mono' },
  { value: 'Fira Code', label: 'Fira Code' },
  { value: 'Source Code Pro', label: 'Source Code Pro' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono' },
  { value: 'IBM Plex Mono', label: 'IBM Plex Mono' },
  { value: 'Cascadia Code', label: 'Cascadia Code' },
];

const caretColors = [
  { value: '#3b82f6', label: 'Blue' },
  { value: '#10b981', label: 'Green' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#ef4444', label: 'Red' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
];

export function AppearanceSection() {
  const settings = useSettingsStore((state) => state.settings.appearance);
  const {
    updateTheme,
    updateFont,
    updateFontSize,
    updateCaretStyle,
    updateCaretColor,
    updateColorScheme,
    toggleAnimations,
    toggleSmoothCaret,
    toggleWpmCounter,
    toggleAccuracyCounter,
  } = useSettingsStore();

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme
          </CardTitle>
          <CardDescription>Choose your preferred color theme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {themes.map((theme) => (
              <button
                key={theme.value}
                onClick={() => updateTheme(theme.value)}
                aria-label={`Select ${theme.label} theme`}
                aria-pressed={settings.theme === theme.value}
                className={`focus:ring-primary rounded-lg border-2 p-3 transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none sm:p-4 ${
                  settings.theme === theme.value
                    ? 'border-primary ring-primary ring-2 ring-offset-2'
                    : 'border-muted hover:border-muted-foreground'
                }`}
              >
                <div className="mb-2 text-xs font-medium sm:text-sm">
                  {theme.label}
                </div>
                <div className="flex gap-1">
                  {theme.colors.map((color, i) => (
                    <div
                      key={i}
                      className="h-4 w-full rounded sm:h-6"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Color Scheme</Label>
            <RadioGroup
              value={settings.colorScheme}
              onValueChange={updateColorScheme}
            >
              <div className="flex flex-col space-y-2 sm:flex-row sm:gap-4 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label
                    htmlFor="light"
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label
                    htmlFor="dark"
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="auto" id="auto" />
                  <Label
                    htmlFor="auto"
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Monitor className="h-4 w-4" />
                    System
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Typography
          </CardTitle>
          <CardDescription>Customize font and text appearance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="font">Font Family</Label>
            <Select value={settings.font} onValueChange={updateFont}>
              <SelectTrigger id="font">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fonts.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fontSize">Font Size: {settings.fontSize}px</Label>
            <Slider
              id="fontSize"
              min={14}
              max={24}
              step={1}
              value={[settings.fontSize]}
              onValueChange={([value]: number[]) => updateFontSize(value)}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Caret Customization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Caret
          </CardTitle>
          <CardDescription>
            Customize the typing cursor appearance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Caret Style</Label>
            <RadioGroup
              value={settings.caretStyle}
              onValueChange={updateCaretStyle}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="line" id="line" />
                <Label htmlFor="line" className="cursor-pointer">
                  Line |
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="block" id="block" />
                <Label htmlFor="block" className="cursor-pointer">
                  Block ▮
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="underline" id="underline" />
                <Label htmlFor="underline" className="cursor-pointer">
                  Underline _
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Caret Color</Label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {caretColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateCaretColor(color.value)}
                  aria-label={`Select ${color.label} caret color`}
                  aria-pressed={settings.caretColor === color.value}
                  className={`h-8 w-full rounded-md transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none sm:h-10 ${
                    settings.caretColor === color.value
                      ? 'ring-primary ring-2 ring-offset-2'
                      : ''
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="smoothCaret" className="flex-1">
              Smooth Caret Animation
            </Label>
            <Switch
              id="smoothCaret"
              checked={settings.smoothCaret}
              onCheckedChange={toggleSmoothCaret}
            />
          </div>
        </CardContent>
      </Card>

      {/* Visual Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visual Preferences
          </CardTitle>
          <CardDescription>
            Toggle visual elements and animations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="animations" className="flex-1">
              Enable Animations
            </Label>
            <Switch
              id="animations"
              checked={settings.animations}
              onCheckedChange={toggleAnimations}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="wpmCounter" className="flex-1">
              Show WPM Counter
            </Label>
            <Switch
              id="wpmCounter"
              checked={settings.showWpmCounter}
              onCheckedChange={toggleWpmCounter}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="accuracyCounter" className="flex-1">
              Show Accuracy Counter
            </Label>
            <Switch
              id="accuracyCounter"
              checked={settings.showAccuracyCounter}
              onCheckedChange={toggleAccuracyCounter}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
