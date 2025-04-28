
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
      console.log('Searching with JQL:', jql);
      const response = await jiraClient.searchIssues(jql);
      console.log('Search response:', response);
      
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
      
      let errorMessage = error.message || "An unknown error occurred";
      
      // Parse error message from different error formats
      if (error.error && typeof error.error === 'object') {
        errorMessage = error.error.message || errorMessage;
      } else if (typeof error.error === 'string') {
        try {
          const parsedError = JSON.parse(error.error);
          errorMessage = parsedError.message || errorMessage;
        } catch {
          // If parsing fails, use the error as is
          errorMessage = error.error || errorMessage;
        }
      }
      
      // Handle specific error cases
      if (error.status === 400) {
        toast({
          title: "Bad Request",
          description: "Invalid search query. Please check your JQL syntax.",
          variant: "destructive",
        });
      } else if (error.message?.includes('CORS') || error.status === 0) {
        toast({
          title: "CORS Error",
          description: "Access blocked by CORS policy. Try using the desktop app instead of the browser, or configure your JIRA to allow cross-origin requests.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Search failed",
          description: errorMessage,
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
