
import { useToast } from '@/hooks/use-toast';
import { mockProjects, getIssuesByProjectId } from '@/lib/mock-data';
import { JiraIssue } from '@/types/jira';
import { validateJql } from '@/utils/validation';

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

  const handleSearch = () => {
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
    
    // Simulate API call with timeout
    setTimeout(() => {
      let searchResults: JiraIssue[] = [];
      
      try {
        if (jql.startsWith('key =')) {
          const key = jql.split('=')[1].trim();
          searchResults = mockProjects.flatMap(project => 
            getIssuesByProjectId(project.id)
          ).filter(issue => issue.key === key);
        } else {
          searchResults = mockProjects.flatMap(project => 
            getIssuesByProjectId(project.id)
          );
        }
        
        setIssues(searchResults);
        
        if (searchResults.length === 0) {
          toast({
            title: "No results found",
            description: "Try modifying your search criteria",
            variant: "destructive",
          });
        } else if (searchResults.length === 1 && jql.startsWith('key =')) {
          setSelectedIssueIds([searchResults[0].id]);
        }
      } catch (error) {
        toast({
          title: "Search failed",
          description: "An error occurred while searching for issues",
          variant: "destructive",
        });
        setIssues([]);
      }
      
      setIsLoading(false);
    }, 700);
  };

  return { handleSearch };
};
