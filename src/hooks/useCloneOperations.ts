
import { useToast } from '@/hooks/use-toast';
import { JiraIssue, CloneResult } from '@/types/jira';
import { getProjectById } from '@/lib/mock-data';
import { useCloneDatabase } from './useCloneDatabase';
import { useIssueCloning } from './useIssueCloning';

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
  const { createCloneHistory, updateCloneHistory, logIssueResult, cloneIssueLinks } = useCloneDatabase();
  const { cloneSingleIssue } = useIssueCloning({ targetProjectId, setCloneResults });

  const targetProject = targetProjectId ? getProjectById(targetProjectId) : undefined;
  const sourceProject = selectedIssues.length > 0 
    ? getProjectById(selectedIssues[0].project)
    : undefined;

  const validateCloneOperation = () => {
    const errors: string[] = [];

    if (selectedIssues.length === 0) {
      errors.push("No issues selected");
    }

    if (!targetProject) {
      errors.push("Target project is required");
    }

    // Check if all selected issues are from the same project
    const projectIds = new Set(selectedIssues.map(issue => issue.project));
    if (projectIds.size > 1) {
      errors.push("All selected issues must be from the same project");
    }

    // Check if target project is different from source project
    if (sourceProject && targetProject && sourceProject.id === targetProject.id) {
      errors.push("Source and target projects must be different");
    }

    // Check for potential epic/subtask relationships
    const epicIssues = selectedIssues.filter(issue => issue.type === 'Epic');
    const subtaskIssues = selectedIssues.filter(issue => issue.type === 'Subtask');
    
    if (epicIssues.length > 0 && subtaskIssues.length > 0) {
      errors.push("Cannot clone epics and subtasks in the same operation");
    }

    return errors;
  };

  const handleCloneClick = () => {
    const validationErrors = validateCloneOperation();
    
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join("\n"),
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
      const cloneHistory = await createCloneHistory({
        source_project_id: sourceProject?.id || '',
        target_project_id: targetProject?.id || '',
        total_issues: selectedIssues.length,
        successful_issues: 0,
        failed_issues: 0,
      });

      const idMapping: Record<string, string> = {};
      let successCount = 0;
      let failureCount = 0;
      
      for (let index = 0; index < selectedIssues.length; index++) {
        const issue = selectedIssues[index];
        
        try {
          const result = await cloneSingleIssue(issue, index);
          if (result.targetIssue) {
            idMapping[issue.id] = result.targetIssue.id;
          }
          await logIssueResult(cloneHistory.id, issue, result);
          successCount++;
        } catch (error: any) {
          failureCount++;
          
          const failedResult: CloneResult = {
            sourceIssue: issue,
            status: 'failed',
            error: error.message
          };
          
          await logIssueResult(cloneHistory.id, issue, failedResult);
          
          setCloneResults((prev: CloneResult[]) => {
            const updated = [...prev];
            updated[index] = failedResult;
            return updated;
          });
        }
      }
      
      await updateCloneHistory(cloneHistory.id, {
        successful_issues: successCount,
        failed_issues: failureCount
      });

      await cloneIssueLinks(idMapping);

    } catch (error: any) {
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
