export interface CloneHistoryRecord {
  id: string;
  source_project_id: string;
  target_project_id: string;
  total_issues: number;
  successful_issues: number;
  failed_issues: number;
  created_at?: string;
  query?: string;
}

export interface JiraConfigRecord {
  id?: string;
  jira_url: string;
  api_key?: string;
  auth_method: 'api-key';
  user_email?: string;
  jql_filter?: string;
}

export interface DatabaseOperations {
  createCloneHistory: (data: Omit<CloneHistoryRecord, 'id'>) => Promise<CloneHistoryRecord>;
  updateCloneHistory: (id: string, updates: Partial<CloneHistoryRecord>) => Promise<Partial<CloneHistoryRecord>>;
  getCloneHistory: () => Promise<CloneHistoryRecord[]>;
  resetCloneHistory: () => Promise<void>;
  logIssueResult: (data: any) => Promise<any>;
  saveJiraConfig: (config: JiraConfigRecord) => Promise<JiraConfigRecord>;
  getJiraConfig: () => Promise<JiraConfigRecord | null>;
  resetJiraConfig: () => Promise<void>;
}
