import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { mockProjects, getIssuesByProjectId, getProjectById } from '@/lib/mock-data';
import { CloneResult, JiraIssue, JiraProject } from '@/types/jira';
import { supabase } from '@/integrations/supabase/client';

export const useCloneIssues = () => {
  const { toast } = useToast();
  
  const [targetProjectId, setTargetProjectId] = useState<string>('');
  const [jql, setJql] = useState<string>('');
  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [selectedIssueIds, setSelectedIssueIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [cloneResults, setCloneResults] = useState<CloneResult[]>([]);

  const targetProject = targetProjectId ? getProjectById(targetProjectId) : undefined;
  const selectedIssues = issues.filter(issue => selectedIssueIds.includes(issue.id));
  
  const sourceProject = selectedIssues.length > 0 
    ? getProjectById(selectedIssues[0].project)
    : undefined;

  const handleSearch = () => {
    if (!jql.trim()) {
      toast({
        title: "JQL required",
        description: "Please enter a JQL query to search for issues",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setSelectedIssueIds([]);
    
    setTimeout(() => {
      const allIssues = mockProjects.flatMap(project => 
        getIssuesByProjectId(project.id)
      );
      setIssues(allIssues);
      setIsLoading(false);
    }, 700);
  };

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

  const handleConfirmClone = async () => {
    setShowConfirmation(false);
    setIsCloning(true);
    
    const initialResults: CloneResult[] = selectedIssues.map(issue => ({
      sourceIssue: issue,
      status: 'pending'
    }));
    
    setCloneResults(initialResults);
    
    const idMapping: Record<string, string> = {};
    
    for (let index = 0; index < selectedIssues.length; index++) {
      const issue = selectedIssues[index];
      const delay = 1000 + Math.random() * 2000; // Random delay between 1-3 seconds
      
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
          
          setCloneResults(prev => {
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
        setCloneResults(prev => {
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

    setIsCloning(false);
    toast({
      title: "Clone operation completed",
      description: `${selectedIssues.length} issues processed`,
    });
  };

  return {
    targetProjectId,
    setTargetProjectId,
    jql,
    setJql,
    issues,
    selectedIssueIds,
    isLoading,
    isCloning,
    showConfirmation,
    setShowConfirmation,
    cloneResults,
    targetProject,
    selectedIssues,
    sourceProject,
    handleIssueSelect,
    handleCloneClick,
    handleConfirmClone,
    handleSearch
  };
};
