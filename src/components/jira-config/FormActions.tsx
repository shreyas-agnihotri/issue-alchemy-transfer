
import React from 'react';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  isValidating: boolean;
  onTestConnection: () => void;
}

export function FormActions({ isValidating, onTestConnection }: FormActionsProps) {
  return (
    <div className="flex flex-col space-y-2">
      <Button 
        type="submit" 
        className="w-full"
        disabled={isValidating}
      >
        {isValidating ? "Validating..." : "Save API Key Configuration"}
      </Button>
      
      <Button 
        type="button"
        variant="outline"
        className="w-full"
        disabled={isValidating}
        onClick={onTestConnection}
      >
        {isValidating ? "Testing..." : "Test Connection"}
      </Button>
    </div>
  );
}
