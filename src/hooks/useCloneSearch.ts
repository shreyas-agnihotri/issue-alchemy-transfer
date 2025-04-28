
import { useToast } from '@/hooks/use-toast';
import { JiraIssue } from '@/types/jira';
import { validateJql } from '@/utils/validation';
import { jiraClient } from '@/services/jira-api/jira-client';

interface UseCloneSearchProps {
  jql: string;
  setIssues: (issues: JiraIssue[]) => void;
  setIsLoading: (loading: boolean) => void;
  setSelectedIssueIds: (ids: string[]) => void;
}

export const useCloneSearch = ({
  jql,
  setIssues,
  setIsLoading,
  setSelectedIssueIds,
}: UseCloneSearchProps) => {
  const { toast } = useToast();

  const handleSearch = async () => {
    const jqlValidation = validateJql(jql);
    
    if (!jqlValidation.isValid) {
      toast({
        title: "Invalid JQL",
        description: jqlValidation.message,
        variant: "destructive",
      });
      return;
    }

    if (!jql.trim()) {
      toast({
        title: "Search criteria required",
        description: "Please enter a JQL query or paste an issue URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setSelectedIssueIds([]);
    
    try {
      const response = await jiraClient.searchIssues(jql);
      setIssues(response.issues);
      
      if (response.issues.length === 0) {
        toast({
          title: "No results found",
          description: "Try modifying your search criteria",
          variant: "destructive",
        });
      } else if (response.issues.length === 1 && jql.startsWith('key =')) {
        setSelectedIssueIds([response.issues[0].id]);
      }
    } catch (error: any) {
      console.error("Search error:", error);
      
      // Handle CORS errors specifically
      if (error.message?.includes('CORS') || error.status === 0) {
        toast({
          title: "CORS Error",
          description: "Access blocked by CORS policy. Try using the desktop app instead of the browser, or configure your JIRA to allow cross-origin requests.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Search failed",
          description: error.message || "An error occurred while searching for issues",
          variant: "destructive",
        });
      }
      setIssues([]);
    } finally {
      setIsLoading(false);
    }
  };

  return { handleSearch };
};
