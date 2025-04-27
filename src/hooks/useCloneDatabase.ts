
import { supabase } from '@/integrations/supabase/client';
import { CloneResult, JiraIssue } from '@/types/jira';

interface CloneHistoryRecord {
  source_project_id: string;
  target_project_id: string;
  total_issues: number;
  successful_issues: number;
  failed_issues: number;
}

export const useCloneDatabase = () => {
  const createCloneHistory = async (record: CloneHistoryRecord) => {
    const { data, error } = await supabase
      .from('clone_history')
      .insert(record)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  };

  const updateCloneHistory = async (id: string, updates: Partial<CloneHistoryRecord>) => {
    const { error } = await supabase
      .from('clone_history')
      .update(updates)
      .eq('id', id);
      
    if (error) throw error;
  };

  const logIssueResult = async (
    cloneHistoryId: string,
    sourceIssue: JiraIssue,
    result: CloneResult
  ) => {
    const { error } = await supabase
      .from('clone_issue_results')
      .insert({
        clone_history_id: cloneHistoryId,
        source_issue_id: sourceIssue.id,
        source_issue_key: sourceIssue.key,
        target_issue_id: result.targetIssue?.id,
        target_issue_key: result.targetIssue?.key,
        status: result.status,
        error_message: result.error
      });
      
    if (error) throw error;
  };

  const cloneIssueLinks = async (idMapping: Record<string, string>) => {
    const { data: existingLinks } = await supabase
      .from('issue_links')
      .select('*')
      .in('source_issue_id', Object.keys(idMapping));

    if (existingLinks) {
      for (const link of existingLinks) {
        if (idMapping[link.source_issue_id] && idMapping[link.target_issue_id]) {
          await supabase
            .from('issue_links')
            .insert({
              source_issue_id: idMapping[link.source_issue_id],
              target_issue_id: idMapping[link.target_issue_id],
              metadata: link.metadata
            });
        }
      }
    }
  };

  return {
    createCloneHistory,
    updateCloneHistory,
    logIssueResult,
    cloneIssueLinks
  };
};
