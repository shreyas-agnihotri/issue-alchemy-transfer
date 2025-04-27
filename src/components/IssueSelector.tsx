
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { JiraIssue } from '@/types/jira';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface IssueSelectorProps {
  issues: JiraIssue[];
  selectedIssues: string[];
  onIssueSelect: (issueId: string, selected: boolean) => void;
  isLoading?: boolean;
}

const IssueSelector: React.FC<IssueSelectorProps> = ({
  issues,
  selectedIssues,
  onIssueSelect,
  isLoading = false,
}) => {
  const allSelected = issues.length > 0 && issues.length === selectedIssues.length;
  
  const handleSelectAll = (checked: boolean) => {
    issues.forEach(issue => {
      onIssueSelect(issue.id, checked);
    });
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Bug': return 'bg-jira-red text-white';
      case 'Epic': return 'bg-jira-purple text-white';
      case 'Story': return 'bg-jira-green text-white';
      case 'Task': return 'bg-jira-blue-light text-white';
      default: return 'bg-jira-teal text-white';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Issues to Clone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center p-3 border rounded-md">
                <Skeleton className="h-5 w-5 mr-4" />
                <div className="space-y-2 flex-grow">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (issues.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Issues to Clone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6">
            <p className="text-jira-neutral-medium">
              No issues found. Try adjusting your search criteria.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Select Issues to Clone</CardTitle>
          {issues.length > 0 && (
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                id="select-all"
              />
              <label
                htmlFor="select-all"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Select All
              </label>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {issues.map((issue) => {
            const isSelected = selectedIssues.includes(issue.id);
            
            return (
              <div
                key={issue.id}
                className={`flex items-start p-3 border rounded-md ${
                  isSelected ? 'border-jira-blue bg-blue-50' : ''
                } hover:bg-gray-50 transition-colors`}
              >
                <Checkbox
                  className="mt-1"
                  checked={isSelected}
                  onCheckedChange={(checked) => onIssueSelect(issue.id, !!checked)}
                  id={`issue-${issue.id}`}
                />
                <div className="ml-4 flex-grow">
                  <div className="flex items-center">
                    <label
                      htmlFor={`issue-${issue.id}`}
                      className="text-sm font-medium cursor-pointer hover:text-jira-blue"
                    >
                      {issue.key}: {issue.summary}
                    </label>
                  </div>
                  <div className="flex items-center mt-2 space-x-2">
                    <Badge variant="outline" className={getTypeBadgeColor(issue.type)}>
                      {issue.type}
                    </Badge>
                    <span className="text-xs text-jira-neutral-medium">
                      {issue.status}
                    </span>
                    {issue.labels.length > 0 && (
                      <div className="flex items-center space-x-1">
                        {issue.labels.slice(0, 2).map((label) => (
                          <span
                            key={label}
                            className="bg-jira-neutral-light text-jira-neutral-dark text-xs px-2 py-0.5 rounded"
                          >
                            {label}
                          </span>
                        ))}
                        {issue.labels.length > 2 && (
                          <span className="text-xs text-jira-neutral-medium">
                            +{issue.labels.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default IssueSelector;

