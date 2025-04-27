
import React from 'react';
import { JiraProject } from '@/types/jira';

interface CloneDescriptionProps {
  sourceProject?: JiraProject;
  targetProject?: JiraProject;
  issueCount: number;
}

const CloneDescription: React.FC<CloneDescriptionProps> = ({
  sourceProject,
  targetProject,
  issueCount,
}) => {
  if (!sourceProject || !targetProject) return null;

  return (
    <>
      You are about to clone {issueCount} issue(s) from{' '}
      <span className="font-semibold">{sourceProject.name}</span> to{' '}
      <span className="font-semibold">{targetProject.name}</span>.
    </>
  );
};

export default CloneDescription;
