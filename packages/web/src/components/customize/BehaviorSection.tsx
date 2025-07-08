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
import { Input } from '@/components/ui/input';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Volume2, Keyboard, Timer, Target } from 'lucide-react';

export function BehaviorSection() {
  const settings = useSettingsStore((state) => state.settings.behavior);
  const {
    toggleSoundEffects,
    toggleKeyFeedback,
    updateDefaultMode,
    updateDefaultDifficulty,
    updateDefaultDuration,
    updateDefaultWordCount,
    updatePaceCaretWpm,
    togglePaceCaret,
    toggleAutoSave,
    toggleFocusMode,
    toggleQuickRestart,
    toggleBlindMode,
  } = useSettingsStore();

  return (
    <div className="space-y-6">
      {/* Sound Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Sound & Feedback
          </CardTitle>
          <CardDescription>Configure audio and haptic feedback</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <Label htmlFor="soundEffects">Sound Effects</Label>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Play sounds for correct/incorrect keys
              </p>
            </div>
            <Switch
              id="soundEffects"
              checked={settings.soundEffects}
              onCheckedChange={toggleSoundEffects}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <Label htmlFor="keyFeedback">Key Press Feedback</Label>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Visual feedback on key press
              </p>
            </div>
            <Switch
              id="keyFeedback"
              checked={settings.keyFeedback}
              onCheckedChange={toggleKeyFeedback}
            />
          </div>
        </CardContent>
      </Card>

      {/* Game Defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Game Defaults
          </CardTitle>
          <CardDescription>Set your preferred game settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultMode">Default Mode</Label>
            <Select
              value={settings.defaultMode}
              onValueChange={updateDefaultMode}
            >
              <SelectTrigger id="defaultMode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time">Time</SelectItem>
                <SelectItem value="words">Words</SelectItem>
                <SelectItem value="quote">Quote</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultDifficulty">Default Difficulty</Label>
            <Select
              value={settings.defaultDifficulty}
              onValueChange={updateDefaultDifficulty}
            >
              <SelectTrigger id="defaultDifficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Expert">Expert</SelectItem>
                <SelectItem value="Master">Master</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {settings.defaultMode === 'time' && (
            <div className="space-y-2">
              <Label htmlFor="defaultDuration">
                Default Duration: {settings.defaultDuration}s
              </Label>
              <Slider
                id="defaultDuration"
                min={15}
                max={300}
                step={15}
                value={[settings.defaultDuration]}
                onValueChange={([value]: number[]) =>
                  updateDefaultDuration(value)
                }
                className="w-full"
              />
            </div>
          )}

          {settings.defaultMode === 'words' && (
            <div className="space-y-2">
              <Label htmlFor="defaultWordCount">
                Default Word Count: {settings.defaultWordCount}
              </Label>
              <Slider
                id="defaultWordCount"
                min={10}
                max={200}
                step={10}
                value={[settings.defaultWordCount]}
                onValueChange={([value]: number[]) =>
                  updateDefaultWordCount(value)
                }
                className="w-full"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pace Caret */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Pace Caret
          </CardTitle>
          <CardDescription>Set a target WPM pace indicator</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="paceCaretEnabled" className="flex-1">
              Enable Pace Caret
            </Label>
            <Switch
              id="paceCaretEnabled"
              checked={settings.paceCaretEnabled}
              onCheckedChange={togglePaceCaret}
            />
          </div>

          {settings.paceCaretEnabled && (
            <div className="space-y-2">
              <Label htmlFor="paceCaretWpm">Target WPM</Label>
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
                <Slider
                  id="paceCaretWpm"
                  min={20}
                  max={200}
                  step={5}
                  value={[settings.paceCaretWpm]}
                  onValueChange={([value]: number[]) =>
                    updatePaceCaretWpm(value)
                  }
                  className="w-full flex-1"
                />
                <Input
                  type="number"
                  value={settings.paceCaretWpm}
                  onChange={(e) => updatePaceCaretWpm(Number(e.target.value))}
                  className="w-full sm:w-20"
                  min={20}
                  max={200}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Behavior Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Behavior Options
          </CardTitle>
          <CardDescription>Configure typing test behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <Label htmlFor="autoSave">Auto-save Results</Label>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Automatically save test results
              </p>
            </div>
            <Switch
              id="autoSave"
              checked={settings.autoSave}
              onCheckedChange={toggleAutoSave}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <Label htmlFor="focusMode">Focus Mode</Label>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Hide all UI except typing area
              </p>
            </div>
            <Switch
              id="focusMode"
              checked={settings.focusMode}
              onCheckedChange={toggleFocusMode}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <Label htmlFor="quickRestart">Quick Restart</Label>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Tab + Enter to restart quickly
              </p>
            </div>
            <Switch
              id="quickRestart"
              checked={settings.quickRestart}
              onCheckedChange={toggleQuickRestart}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <Label htmlFor="blindMode">Blind Mode</Label>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Hide typed text for practice
              </p>
            </div>
            <Switch
              id="blindMode"
              checked={settings.blindMode}
              onCheckedChange={toggleBlindMode}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
