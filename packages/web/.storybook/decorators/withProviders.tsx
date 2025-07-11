import React from 'react';
import type { Decorator } from '@storybook/nextjs';
import { AuthProvider } from '../../src/components/providers/AuthProvider';
import { SettingsProvider } from '../../src/components/providers/SettingsProvider';

export const withProviders: Decorator = (Story) => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Story />
      </SettingsProvider>
    </AuthProvider>
  );
};
