
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
import IssueList from './IssueList';
import CloneDescription from './CloneDescription';

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
            <CloneDescription
              sourceProject={sourceProject}
              targetProject={targetProject}
              issueCount={selectedIssues.length}
            />
            <IssueList issues={selectedIssues} />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            className="bg-jira-blue hover:bg-jira-blue-dark" 
            onClick={onConfirm}
          >
            Clone Issues
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CloneConfirmation;
