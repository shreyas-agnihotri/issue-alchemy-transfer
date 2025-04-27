
import React from 'react';
import { Button } from '@/components/ui/button';
import ProjectSelector from '@/components/ProjectSelector';
import IssueSelector from '@/components/IssueSelector';
import CloneStatus from '@/components/CloneStatus';
import CloneConfirmation from '@/components/CloneConfirmation';
import ClonePageLayout from '@/components/ClonePageLayout';
import JqlInput from '@/components/JqlInput';
import { useCloneIssues } from '@/hooks/useCloneIssues';
import { mockProjects } from '@/lib/mock-data';

const Index = () => {
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
    handleIssueSelect,
    handleCloneClick,
    handleConfirmClone,
    handleSearch
  } = useCloneIssues();

  return (
    <ClonePageLayout>
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
        targetProject={targetProject}
      />
    </ClonePageLayout>
  );
};

export default Index;
