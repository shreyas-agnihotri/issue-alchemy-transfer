
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { History as HistoryIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProjectSelector from '@/components/ProjectSelector';
import IssueSelector from '@/components/IssueSelector';
import CloneStatus from '@/components/CloneStatus';
import CloneConfirmation from '@/components/CloneConfirmation';
import ClonePageLayout from '@/components/ClonePageLayout';
import JqlInput from '@/components/JqlInput';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useCloneIssues } from '@/hooks/useCloneIssues';
import { mockProjects } from '@/lib/mock-data';
import { useJiraConfig } from '@/hooks/useJiraConfig';
import { db_ops } from '@/services/database';

const Index = () => {
  const { isConfigLoaded } = useJiraConfig();

  const {
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
  } = useCloneIssues();

  // Load default JQL filter from configuration if available
  useEffect(() => {
    const loadDefaultJql = async () => {
      try {
        const config = await db_ops.getJiraConfig();
        if (config && config.jql_filter && !jql) {
          setJql(config.jql_filter);
        }
      } catch (error) {
        console.error('Error loading default JQL filter:', error);
      }
    };

    if (isConfigLoaded) {
      loadDefaultJql();
    }
  }, [isConfigLoaded, jql, setJql]);

  return (
    <ErrorBoundary>
      <ClonePageLayout>
        <div className="flex justify-end mb-4">
          <Button variant="outline" asChild>
            <Link to="/history" className="flex items-center gap-2">
              <HistoryIcon className="h-4 w-4" />
              View History
            </Link>
          </Button>
        </div>

        <JqlInput 
          jql={jql}
          onJqlChange={setJql}
          onSearch={handleSearch}
          isLoading={isLoading}
        />
        
        <ProjectSelector
          projects={mockProjects}
          selectedTargetProject={targetProjectId}
          onTargetProjectChange={setTargetProjectId}
          isLoading={isLoading}
        />
        
        <IssueSelector
          issues={issues}
          selectedIssues={selectedIssueIds}
          onIssueSelect={handleIssueSelect}
          isLoading={isLoading}
        />
        
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

        <CloneConfirmation
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleConfirmClone}
          selectedIssues={selectedIssues}
          sourceProject={sourceProject}
          targetProject={targetProject}
        />
      </ClonePageLayout>
    </ErrorBoundary>
  );
};

export default Index;
