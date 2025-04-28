
import { useState } from 'react';
import { JiraIssue, CloneResult } from '@/types/jira';

export interface CloneOptions {
  includeSubtasks: boolean;
  includeLinks: boolean;
  keepRelationships: boolean;
  retryFailed: boolean;
}

export const useCloneState = () => {
  const [targetProjectId, setTargetProjectId] = useState<string>('');
  const [jql, setJql] = useState<string>('');
  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [selectedIssueIds, setSelectedIssueIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [cloneResults, setCloneResults] = useState<CloneResult[]>([]);
  const [cloneOptions, setCloneOptions] = useState<CloneOptions>({
    includeSubtasks: true,
    includeLinks: true,
    keepRelationships: true,
    retryFailed: false
  });

  return {
    targetProjectId,
    setTargetProjectId,
    jql,
    setJql,
    issues,
    setIssues,
    selectedIssueIds,
    setSelectedIssueIds,
    isLoading,
    setIsLoading,
    isCloning,
    setIsCloning,
    showConfirmation,
    setShowConfirmation,
    cloneResults,
    setCloneResults,
    cloneOptions,
    setCloneOptions,
  };
};
