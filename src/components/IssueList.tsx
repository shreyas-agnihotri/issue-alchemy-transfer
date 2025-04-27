
import React from 'react';
import { JiraIssue } from '@/types/jira';

interface IssueListProps {
  issues: JiraIssue[];
}

const IssueList: React.FC<IssueListProps> = ({ issues }) => {
  return (
    <div className="mt-4 p-3 bg-jira-neutral-light rounded-md max-h-40 overflow-y-auto text-sm">
      <ul className="list-disc pl-5 space-y-1">
        {issues.map((issue) => (
          <li key={issue.id}>
            <span className="font-mono">{issue.key}</span>: {issue.summary}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IssueList;
