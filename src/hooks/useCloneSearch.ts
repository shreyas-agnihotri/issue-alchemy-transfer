
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
    // Skip validation for empty JQL to handle URL pasting
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
      
      setIssues(response.issues || []);
      
      if (!response.issues || response.issues.length === 0) {
        toast({
          title: "No results found",
          description: "Try modifying your search criteria",
          variant: "destructive",
        });
      } else if (response.issues.length === 1 && (jql.includes('key =') || /^[A-Z]+-\d+$/.test(jql.trim()))) {
        // Auto-select the issue if it's a single issue search by key
        setSelectedIssueIds([response.issues[0].id]);
      }
    } catch (error: any) {
      console.error("Search error:", error);
      
      let errorMessage = error.message || "An unknown error occurred";
      let errorDetails = "";
      
      // Extract error message from different error formats
      if (error.error) {
        if (typeof error.error === 'object') {
          errorMessage = error.error.errorMessages?.[0] || 
                        error.error.message || 
                        error.error.error || errorMessage;
          errorDetails = error.error.errorMessages?.join(", ") || "";
        } else if (typeof error.error === 'string') {
          try {
            const parsedError = JSON.parse(error.error);
            errorMessage = parsedError.errorMessages?.[0] || 
                          parsedError.message || 
                          parsedError.error || errorMessage;
            errorDetails = parsedError.errorMessages?.join(", ") || "";
          } catch {
            // If parsing fails, use the error as is
            errorMessage = error.error;
          }
        }
      }
      
      // Handle specific error cases
      if (error.status === 400) {
        toast({
          title: "Invalid Search Query",
          description: errorMessage || "The JQL syntax appears to be invalid. Please check your query.",
          variant: "destructive",
        });
      } else if (error.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Your Jira credentials are invalid or expired. Please check your configuration.",
          variant: "destructive",
        });
      } else if (error.message?.includes('CORS') || error.status === 0) {
        toast({
          title: "Connection Error",
          description: "Unable to connect to the Jira API. Please check your Jira configuration.",
          variant: "destructive",
        });
      } else {
        toast({
          title: `Search failed (${error.status || 'Error'})`,
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
