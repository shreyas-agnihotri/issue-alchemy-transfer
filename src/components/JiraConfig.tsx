
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Settings, RotateCcw } from 'lucide-react';
import { ApiKeyForm } from './jira-config/ApiKeyForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { db_ops } from '@/services/database';
import { jiraClient } from '@/services/jira-api/jira-client';

const JiraConfig = () => {
  const { toast } = useToast();

  const handleReset = async () => {
    try {
      await db_ops.resetJiraConfig();
      await db_ops.resetCloneHistory();
      jiraClient.setConfig(null);

      toast({
        title: "Reset successful",
        description: "All Jira credentials and history have been cleared."
      });
    } catch (error) {
      toast({
        title: "Reset failed",
        description: "An error occurred while resetting the configuration.",
        variant: "destructive"
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>JIRA Configuration</SheetTitle>
        </SheetHeader>
        
        <div className="mt-4">
          <ApiKeyForm />
        </div>

        <SheetFooter className="mt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Configuration & History
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all Jira credentials and clear the clone history. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset}>Reset Everything</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default JiraConfig;
