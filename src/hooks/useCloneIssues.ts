
import { JiraIssue } from '@/types/jira';
import { useCloneState } from './useCloneState';
import { useCloneSearch } from './useCloneSearch';
import { useCloneOperations } from './useCloneOperations';

export const useCloneIssues = () => {
  const {
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
  } = useCloneState();

  const { handleSearch } = useCloneSearch({
    jql,
    setIssues,
    setIsLoading,
    setSelectedIssueIds,
  });

  const selectedIssues = issues.filter(issue => selectedIssueIds.includes(issue.id));

  const { 
    handleCloneClick, 
    handleConfirmClone,
    targetProject,
    sourceProject
  } = useCloneOperations({
    selectedIssues,
    targetProjectId,
    setShowConfirmation,
    setIsCloning,
    setCloneResults,
  });

  const handleIssueSelect = (issueId: string, selected: boolean) => {
    if (selected) {
      setSelectedIssueIds(prev => [...prev, issueId]);
    } else {
      setSelectedIssueIds(prev => prev.filter(id => id !== issueId));
    }
  };

  return {
    targetProjectId,
    setTargetProjectId,
    jql,
    setJql,
    issues,
    selectedIssueIds,
    isLoading,
    isCloning,
    showConfirmation,
    setShowConfirmation,
    cloneResults,
    targetProject,
    selectedIssues,
    sourceProject,
    handleIssueSelect,
    handleCloneClick,
    handleConfirmClone,
    handleSearch
  };
};
