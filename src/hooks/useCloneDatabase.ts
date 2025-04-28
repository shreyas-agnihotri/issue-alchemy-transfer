
import { db_ops } from '@/services/database';

interface CloneHistoryRecord {
  source_project_id: string;
  target_project_id: string;
  total_issues: number;
  successful_issues: number;
  failed_issues: number;
  query?: string;
}

export const useCloneDatabase = () => {
  const createCloneHistory = async (record: CloneHistoryRecord) => {
    return db_ops.createCloneHistory(record);
  };

  const updateCloneHistory = async (id: string, updates: Partial<CloneHistoryRecord>) => {
    return db_ops.updateCloneHistory(id, updates);
  };

  const logIssueResult = async (
    cloneHistoryId: string,
    sourceIssue: any,
    result: any
  ) => {
    return db_ops.logIssueResult({
      clone_history_id: cloneHistoryId,
      source_issue_id: sourceIssue.id,
      source_issue_key: sourceIssue.key,
      target_issue_id: result.targetIssue?.id,
      target_issue_key: result.targetIssue?.key,
      status: result.status,
      error_message: result.error
    });
  };
  
  // Add the missing cloneIssueLinks function
  const cloneIssueLinks = async (idMapping: Record<string, string>) => {
    console.log('Cloning issue links with mapping:', idMapping);
    // This would normally save the issue links to the database
    // For now, we'll just log the mapping
    return Promise.resolve(idMapping);
  };

  return {
    createCloneHistory,
    updateCloneHistory,
    logIssueResult,
    cloneIssueLinks
  };
};
