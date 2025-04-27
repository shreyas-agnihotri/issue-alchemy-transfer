
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import ProjectSelector from '@/components/ProjectSelector';
import IssueSelector from '@/components/IssueSelector';
import CloneStatus from '@/components/CloneStatus';
import CloneConfirmation from '@/components/CloneConfirmation';
import { mockProjects, getIssuesByProjectId, getProjectById } from '@/lib/mock-data';
import { CloneResult, JiraIssue, JiraProject } from '@/types/jira';

const Index = () => {
  const { toast } = useToast();
  
  // State for projects and issues
  const [sourceProjectId, setSourceProjectId] = useState<string>('');
  const [targetProjectId, setTargetProjectId] = useState<string>('');
  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [selectedIssueIds, setSelectedIssueIds] = useState<string[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  
  // Clone confirmation dialog
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Clone results
  const [cloneResults, setCloneResults] = useState<CloneResult[]>([]);
  
  // Selected projects
  const sourceProject = sourceProjectId ? getProjectById(sourceProjectId) : undefined;
  const targetProject = targetProjectId ? getProjectById(targetProjectId) : undefined;
  
  // Selected issues
  const selectedIssues = issues.filter(issue => selectedIssueIds.includes(issue.id));
  
  // Load issues when source project changes
  useEffect(() => {
    if (sourceProjectId) {
      setIsLoading(true);
      setSelectedIssueIds([]);
      
      // Simulate API call with timeout
      const timeoutId = setTimeout(() => {
        const projectIssues = getIssuesByProjectId(sourceProjectId);
        setIssues(projectIssues);
        setIsLoading(false);
      }, 700);
      
      return () => clearTimeout(timeoutId);
    } else {
      setIssues([]);
    }
  }, [sourceProjectId]);
  
  // Handle issue selection
  const handleIssueSelect = (issueId: string, selected: boolean) => {
    if (selected) {
      setSelectedIssueIds(prev => [...prev, issueId]);
    } else {
      setSelectedIssueIds(prev => prev.filter(id => id !== issueId));
    }
  };
  
  // Handle clone button click
  const handleCloneClick = () => {
    if (selectedIssues.length === 0) {
      toast({
        title: "No issues selected",
        description: "Please select at least one issue to clone",
        variant: "destructive",
      });
      return;
    }
    
    if (!sourceProject || !targetProject) {
      toast({
        title: "Projects not selected",
        description: "Please select both source and target projects",
        variant: "destructive",
      });
      return;
    }
    
    setShowConfirmation(true);
  };
  
  // Handle clone confirmation
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

  return (
    <div className="min-h-screen flex flex-col bg-jira-neutral-light">
      <Header />
      
      <main className="flex-1 container max-w-5xl py-8 px-4">
        <div className="space-y-8">
          <ProjectSelector
            projects={mockProjects}
            selectedSourceProject={sourceProjectId}
            selectedTargetProject={targetProjectId}
            onSourceProjectChange={setSourceProjectId}
            onTargetProjectChange={setTargetProjectId}
            isLoading={isLoading}
          />
          
          {sourceProjectId && (
            <IssueSelector
              issues={issues}
              selectedIssues={selectedIssueIds}
              onIssueSelect={handleIssueSelect}
              isLoading={isLoading}
            />
          )}
          
          <CloneStatus results={cloneResults} isCloning={isCloning} />
          
          <div className="flex justify-end">
            <Button
              className="bg-jira-blue hover:bg-jira-blue-dark"
              size="lg"
              disabled={isLoading || isCloning || selectedIssueIds.length === 0 || !targetProjectId}
              onClick={handleCloneClick}
            >
              Clone Selected Issues
            </Button>
          </div>
        </div>
      </main>
      
      <CloneConfirmation
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmClone}
        selectedIssues={selectedIssues}
        sourceProject={sourceProject}
        targetProject={targetProject}
      />
    </div>
  );
};

export default Index;
