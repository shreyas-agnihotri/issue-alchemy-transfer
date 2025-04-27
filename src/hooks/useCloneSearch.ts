
import { useToast } from '@/hooks/use-toast';
import { mockProjects, getIssuesByProjectId } from '@/lib/mock-data';
import { JiraIssue } from '@/types/jira';

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
    
    setTimeout(() => {
      let searchResults: JiraIssue[] = [];
      
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
      
      if (searchResults.length === 1 && jql.startsWith('key =')) {
        setSelectedIssueIds([searchResults[0].id]);
      }
      
      setIsLoading(false);
    }, 700);
  };

  return { handleSearch };
};
