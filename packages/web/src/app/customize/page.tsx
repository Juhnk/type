'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Download, Upload, RotateCcw, Palette, Settings2 } from 'lucide-react';
import { AppearanceSection } from '@/components/customize/AppearanceSection';
import { BehaviorSection } from '@/components/customize/BehaviorSection';
import { PreviewSection } from '@/components/customize/PreviewSection';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useAuthStore } from '@/store/useAuthStore';

export default function CustomizePage() {
  const [activeTab, setActiveTab] = useState<'appearance' | 'behavior'>(
    'appearance'
  );
  const {
    settings,
    resetToDefaults,
    exportSettings,
    importSettings,
    saveToServer,
    loadFromServer,
  } = useSettingsStore();
  const { token } = useAuthStore();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

  const handleExportSettings = () => {
    const settingsData = exportSettings();
    const blob = new Blob([JSON.stringify(settingsData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `typeamp-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Settings exported successfully');
  };

  const handleImportSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          const settings = JSON.parse(text);
          importSettings(settings);
          toast.success('Settings imported successfully');
        } catch {
          toast.error(
            'Failed to import settings. Please check the file format.'
          );
        }
      }
    };
    input.click();
  };

  const handleResetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      resetToDefaults();
      toast.success('Settings reset to defaults');
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">Customize TypeAmp</h1>
        <p className="text-muted-foreground">
          Personalize your typing experience with custom themes, fonts, and
          behavior settings
        </p>
      </div>

      {/* Preview Section */}
      <div className="mb-6 lg:mb-8">
        <PreviewSection />
      </div>

      {/* Settings Tabs */}
      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="order-2 lg:order-1 lg:col-span-2">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'appearance' | 'behavior')}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="appearance"
                className="flex items-center gap-2"
              >
                <Palette className="h-4 w-4" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="behavior" className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Behavior
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appearance" className="mt-6">
              <AppearanceSection />
            </TabsContent>

            <TabsContent value="behavior" className="mt-6">
              <BehaviorSection />
            </TabsContent>
          </Tabs>
        </div>

        {/* Actions Sidebar */}
        <div className="order-1 lg:order-2 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Settings Management</CardTitle>
              <CardDescription>
                Export, import, or reset your settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleExportSettings}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Settings
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleImportSettings}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import Settings
              </Button>

              <div className="border-t pt-4">
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={handleResetToDefaults}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset to Defaults
                </Button>
              </div>

              {!token && (
                <div className="border-t pt-4">
                  <p className="text-muted-foreground text-sm">
                    Sign in to sync your settings across devices
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
