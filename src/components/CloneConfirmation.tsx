
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { JiraIssue, JiraProject } from '@/types/jira';

interface CloneConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedIssues: JiraIssue[];
  sourceProject?: JiraProject;
  targetProject?: JiraProject;
}

const CloneConfirmation: React.FC<CloneConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedIssues,
  sourceProject,
  targetProject,
}) => {
  if (!sourceProject || !targetProject) return null;
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Clone Operation</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to clone {selectedIssues.length} issue(s) from{' '}
            <span className="font-semibold">{sourceProject.name}</span> to{' '}
            <span className="font-semibold">{targetProject.name}</span>.
            <div className="mt-4 p-3 bg-jira-neutral-light rounded-md max-h-40 overflow-y-auto text-sm">
              <ul className="list-disc pl-5 space-y-1">
                {selectedIssues.map((issue) => (
                  <li key={issue.id}>
                    <span className="font-mono">{issue.key}</span>: {issue.summary}
                  </li>
                ))}
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-jira-blue hover:bg-jira-blue-dark" onClick={onConfirm}>
            Clone Issues
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CloneConfirmation;
