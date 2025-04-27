
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { JiraIssue, CloneResult } from '@/types/jira';
import { getProjectById } from '@/lib/mock-data';

interface UseCloneOperationsProps {
  selectedIssues: JiraIssue[];
  targetProjectId: string;
  setShowConfirmation: (show: boolean) => void;
  setIsCloning: (cloning: boolean) => void;
  setCloneResults: (results: CloneResult[] | ((prev: CloneResult[]) => CloneResult[])) => void;
}

export const useCloneOperations = ({
  selectedIssues,
  targetProjectId,
  setShowConfirmation,
  setIsCloning,
  setCloneResults,
}: UseCloneOperationsProps) => {
  const { toast } = useToast();
  const targetProject = targetProjectId ? getProjectById(targetProjectId) : undefined;
  const sourceProject = selectedIssues.length > 0 
    ? getProjectById(selectedIssues[0].project)
    : undefined;

  const handleCloneClick = () => {
    if (selectedIssues.length === 0) {
      toast({
        title: "No issues selected",
        description: "Please select at least one issue to clone",
        variant: "destructive",
      });
      return;
    }
    
    if (!targetProject) {
      toast({
        title: "Target project required",
        description: "Please select a target project for the cloned issues",
        variant: "destructive",
      });
      return;
    }
    
    setShowConfirmation(true);
  };

  const handleConfirmClone = async () => {
    setShowConfirmation(false);
    setIsCloning(true);
    
    const initialResults: CloneResult[] = selectedIssues.map(issue => ({
      sourceIssue: issue,
      status: 'pending'
    }));
    
    setCloneResults(initialResults);

    try {
      const { data: cloneHistory, error: historyError } = await supabase
        .from('clone_history')
        .insert({
          source_project_id: sourceProject?.id,
          target_project_id: targetProject?.id,
          total_issues: selectedIssues.length,
          successful_issues: 0,
          failed_issues: 0,
        })
        .select()
        .single();

      if (historyError) throw historyError;
      
      const idMapping: Record<string, string> = {};
      let successCount = 0;
      let failureCount = 0;
      
      for (let index = 0; index < selectedIssues.length; index++) {
        const issue = selectedIssues[index];
        const delay = 1000 + Math.random() * 2000;
        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        try {
          const success = Math.random() > 0.1;
          
          if (success) {
            const targetIssue: JiraIssue = {
              ...issue,
              id: `new-${issue.id}`,
              key: `${targetProject?.key}-${100 + index}`,
              project: targetProjectId,
              created: new Date().toISOString(),
              updated: new Date().toISOString(),
            };
            
            idMapping[issue.id] = targetIssue.id;
            successCount++;
            
            await supabase
              .from('clone_issue_results')
              .insert({
                clone_history_id: cloneHistory.id,
                source_issue_id: issue.id,
                source_issue_key: issue.key,
                target_issue_id: targetIssue.id,
                target_issue_key: targetIssue.key,
                status: 'success'
              });
            
            setCloneResults((prev: CloneResult[]) => {
              const updated = [...prev];
              updated[index] = {
                sourceIssue: issue,
                targetIssue,
                status: 'success'
              };
              return updated;
            });
          } else {
            throw new Error('API Error: Unable to create issue');
          }
        } catch (error) {
          failureCount++;
          
          await supabase
            .from('clone_issue_results')
            .insert({
              clone_history_id: cloneHistory.id,
              source_issue_id: issue.id,
              source_issue_key: issue.key,
              status: 'failed',
              error_message: error.message
            });
          
          setCloneResults((prev: CloneResult[]) => {
            const updated = [...prev];
            updated[index] = {
              sourceIssue: issue,
              status: 'failed',
              error: error.message
            };
            return updated;
          });
        }
      }
      
      await supabase
        .from('clone_history')
        .update({
          successful_issues: successCount,
          failed_issues: failureCount
        })
        .eq('id', cloneHistory.id);

      try {
        const { data: existingLinks } = await supabase
          .from('issue_links')
          .select('*')
          .in('source_issue_id', selectedIssues.map(issue => issue.id));

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
      } catch (error) {
        console.error('Error cloning issue links:', error);
      }

    } catch (error) {
      console.error('Error creating clone history:', error);
      toast({
        title: "Error storing clone history",
        description: error.message,
        variant: "destructive",
      });
    }

    setIsCloning(false);
    toast({
      title: "Clone operation completed",
      description: `${selectedIssues.length} issues processed`,
    });
  };

  return {
    handleCloneClick,
    handleConfirmClone,
    targetProject,
    sourceProject
  };
};
