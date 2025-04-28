
import { JiraIssue, CloneResult } from '@/types/jira';
import { retry } from '@/utils/retry';
import { validateJiraIssue, CloneOperationError } from '@/utils/validation';

interface UseIssueCloningProps {
  targetProjectId: string;
  setCloneResults: (results: CloneResult[] | ((prev: CloneResult[]) => CloneResult[])) => void;
}

export const useIssueCloning = ({
  targetProjectId,
  setCloneResults
}: UseIssueCloningProps) => {
  const cloneSingleIssue = async (issue: JiraIssue, index: number): Promise<CloneResult> => {
    if (!validateJiraIssue(issue)) {
      throw new CloneOperationError(
        "Invalid issue data",
        issue.id,
        false
      );
    }

    return retry(
      async () => {
        const delay = 1000 + Math.random() * 2000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        const success = Math.random() > 0.1;
        
        if (success) {
          const targetIssue: JiraIssue = {
            ...issue,
            id: `new-${issue.id}`,
            key: `${targetProjectId.toUpperCase()}-${100 + index}`,
            project: targetProjectId,
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
          };
          
          setCloneResults((prev: CloneResult[]) => {
            const updated = [...prev];
            updated[index] = {
              sourceIssue: issue,
              targetIssue,
              status: 'success'
            };
            return updated;
          });
          
          return {
            sourceIssue: issue,
            targetIssue,
            status: 'success'
          };
        }
        
        throw new CloneOperationError(
          'API Error: Unable to create issue',
          issue.id,
          true
        );
      },
      {
        maxAttempts: 3,
        delayMs: 2000,
        backoffFactor: 1.5
      }
    );
  };

  return { cloneSingleIssue };
};

