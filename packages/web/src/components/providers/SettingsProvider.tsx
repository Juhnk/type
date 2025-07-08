'use client';

import { useAppliedSettings } from '@/hooks/useAppliedSettings';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  useAppliedSettings();

  return <>{children}</>;
}
