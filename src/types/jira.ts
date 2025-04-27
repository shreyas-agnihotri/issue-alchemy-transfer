
export type JiraIssueType = 'Story' | 'Bug' | 'Task' | 'Epic' | 'Subtask';

export type JiraIssueStatus = 'Open' | 'In Progress' | 'Done' | 'Closed' | 'Resolved';

export type JiraIssuePriority = 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest';

export interface JiraUser {
  id: string;
  name: string;
  avatarUrl?: string;
  email?: string;
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  isProductDiscovery: boolean;
  avatarUrl?: string;
}

export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  description?: string;
  type: JiraIssueType;
  status: JiraIssueStatus;
  priority: JiraIssuePriority;
  assignee?: JiraUser;
  reporter?: JiraUser;
  labels: string[];
  epic?: string;
  parent?: string;
  created: string;
  updated: string;
  project: string;
  selected?: boolean;
}

export interface CloneResult {
  sourceIssue: JiraIssue;
  targetIssue?: JiraIssue;
  status: 'pending' | 'success' | 'failed';
  error?: string;
}
