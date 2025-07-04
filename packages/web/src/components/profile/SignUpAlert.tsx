'use client';

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useModalStore } from '@/store/useModalStore';
import { UserPlus } from 'lucide-react';

export function SignUpAlert() {
  const { openAuthModal } = useModalStore();

  const handleSignUp = () => {
    openAuthModal();
  };

  return (
    <Alert className="mb-6">
      <UserPlus className="h-4 w-4" />
      <AlertTitle>Sync Your Progress</AlertTitle>
      <AlertDescription>
        <Button
          variant="link"
          className="h-auto p-0 text-sm font-normal"
          onClick={handleSignUp}
        >
          Create a free account
        </Button>{' '}
        to sync your history across devices.
      </AlertDescription>
    </Alert>
  );
}
