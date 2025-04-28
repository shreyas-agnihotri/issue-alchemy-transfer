
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ValidationDisplayProps {
  error: string | null;
}

export function ValidationDisplay({ error }: ValidationDisplayProps) {
  if (!error) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Authentication Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}
