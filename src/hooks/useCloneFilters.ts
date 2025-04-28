
import { useState } from 'react';
import { JiraIssue } from '@/types/jira';

export const useCloneFilters = () => {
  const [sortField, setSortField] = useState<keyof JiraIssue>('key');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterType, setFilterType] = useState<string[]>([]);
  const [retryQueue, setRetryQueue] = useState<string[]>([]);

  const sortIssues = (issues: JiraIssue[]) => {
    return [...issues].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return 0;
    });
  };

  const filterIssues = (issues: JiraIssue[]) => {
    if (filterType.length === 0) return issues;
    return issues.filter(issue => filterType.includes(issue.type));
  };

  const queueForRetry = (issueId: string) => {
    setRetryQueue(prev => [...prev, issueId]);
  };

  const clearRetryQueue = () => {
    setRetryQueue([]);
  };

  return {
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    filterType,
    setFilterType,
    retryQueue,
    sortIssues,
    filterIssues,
    queueForRetry,
    clearRetryQueue
  };
};
