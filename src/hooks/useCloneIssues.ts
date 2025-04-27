
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
      
      // If searching by issue key (from URL)
      if (jql.startsWith('key =')) {
        const key = jql.split('=')[1].trim();
        searchResults = mockProjects.flatMap(project => 
          getIssuesByProjectId(project.id)
        ).filter(issue => issue.key === key);
      } else {
        // Regular JQL search - for demo, return all issues
        searchResults = mockProjects.flatMap(project => 
          getIssuesByProjectId(project.id)
        );
      }
      
      setIssues(searchResults);
      
      // Auto-select the issue if it's a single issue search
      if (searchResults.length === 1 && jql.startsWith('key =')) {
        setSelectedIssueIds([searchResults[0].id]);
      }
      
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
      // Create clone history record
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
            successCount++;
            
            // Store successful clone result
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
          failureCount++;
          
          // Store failed clone result
          await supabase
            .from('clone_issue_results')
            .insert({
              clone_history_id: cloneHistory.id,
              source_issue_id: issue.id,
              source_issue_key: issue.key,
              status: 'failed',
              error_message: error.message
            });
          
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
      
      // Update clone history with final counts
      await supabase
        .from('clone_history')
        .update({
          successful_issues: successCount,
          failed_issues: failureCount
        })
        .eq('id', cloneHistory.id);

      // Clone issue links
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
