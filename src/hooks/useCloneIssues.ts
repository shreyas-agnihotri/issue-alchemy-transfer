
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { mockProjects, getIssuesByProjectId, getProjectById } from '@/lib/mock-data';
import { CloneResult, JiraIssue, JiraProject } from '@/types/jira';
import { supabase } from '@/integrations/supabase/client';

export const useCloneIssues = () => {
  const { toast } = useToast();
  
  const [targetProjectId, setTargetProjectId] = useState<string>('');
  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [selectedIssueIds, setSelectedIssueIds] = useState<string[]>([]);
  const [jqlFilter, setJqlFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [cloneResults, setCloneResults] = useState<CloneResult[]>([]);

  const targetProject = targetProjectId ? getProjectById(targetProjectId) : undefined;
  const selectedIssues = issues.filter(issue => selectedIssueIds.includes(issue.id));

  useEffect(() => {
    const loadJqlFilter = async () => {
      const { data, error } = await supabase
        .from('jira_configs')
        .select('jql_filter')
        .maybeSingle();

      if (!error && data?.jql_filter) {
        setJqlFilter(data.jql_filter);
      }
    };

    loadJqlFilter();
  }, []);

  useEffect(() => {
    if (jqlFilter) {
      setIsLoading(true);
      setSelectedIssueIds([]);
      
      // Simulate API call with timeout - in real app this would use the JQL filter
      const timeoutId = setTimeout(() => {
        // For demo purposes, we'll just load all issues since this is mock data
        // In a real app, this would use the JQL filter to fetch matching issues
        const allIssues = mockProjects.flatMap(project => 
          getIssuesByProjectId(project.id)
        );
        setIssues(allIssues);
        setIsLoading(false);
      }, 700);
      
      return () => clearTimeout(timeoutId);
    } else {
      setIssues([]);
    }
  }, [jqlFilter]);

  const handleIssueSelect = (issueId: string, selected: boolean) => {
    if (selected) {
      setSelectedIssueIds(prev => [...prev, issueId]);
    } else {
      setSelectedIssueIds(prev => prev.filter(id => id !== issueId));
    }
  };

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
        title: "Target project not selected",
        description: "Please select a target project",
        variant: "destructive",
      });
      return;
    }
    
    setShowConfirmation(true);
  };

  const handleConfirmClone = () => {
    setShowConfirmation(false);
    setIsCloning(true);
    
    // Initialize results
    const initialResults: CloneResult[] = selectedIssues.map(issue => ({
      sourceIssue: issue,
      status: 'pending'
    }));
    
    setCloneResults(initialResults);
    
    // Simulate API calls with timeouts
    selectedIssues.forEach((issue, index) => {
      const delay = 1000 + Math.random() * 2000; // Random delay between 1-3 seconds
      
      setTimeout(() => {
        setCloneResults(prev => {
          const updated = [...prev];
          
          // 10% chance of failure for demo purposes
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
            
            updated[index] = {
              sourceIssue: issue,
              targetIssue,
              status: 'success'
            };
          } else {
            updated[index] = {
              sourceIssue: issue,
              status: 'failed',
              error: 'API Error: Unable to create issue'
            };
          }
          
          return updated;
        });
        
        // Check if all done
        if (index === selectedIssues.length - 1) {
          setTimeout(() => {
            setIsCloning(false);
            toast({
              title: "Clone operation completed",
              description: `${selectedIssues.length} issues processed`,
            });
          }, 500);
        }
      }, delay);
    });
  };

  return {
    targetProjectId,
    setTargetProjectId,
    issues,
    selectedIssueIds,
    jqlFilter,
    isLoading,
    isCloning,
    showConfirmation,
    setShowConfirmation,
    cloneResults,
    targetProject,
    selectedIssues,
    handleIssueSelect,
    handleCloneClick,
    handleConfirmClone
  };
};
