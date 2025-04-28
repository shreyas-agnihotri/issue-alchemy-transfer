
export interface CloneHistoryRecord {
  id: string;
  source_project_id: string;
  target_project_id: string;
  total_issues: number;
  successful_issues: number;
  failed_issues: number;
  query?: string;
  created_at?: string;
}

export interface IssueResultRecord {
  clone_history_id: string;
  source_issue_id: string;
  source_issue_key: string;
  target_issue_id?: string;
  target_issue_key?: string;
  status: string;
  error_message?: string;
}

export interface JiraConfigRecord {
  jira_url: string;
  api_key?: string;
  oauth_client_id?: string;
  oauth_client_secret?: string;
  auth_method?: string;
  user_email?: string;
  jql_filter?: string;
}

export interface OAuthTokenRecord {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_at: number;
  scope?: string;
}

export interface DatabaseOperations {
  createCloneHistory: (data: Omit<CloneHistoryRecord, 'id'>) => Promise<CloneHistoryRecord>;
  updateCloneHistory: (id: string, updates: Partial<CloneHistoryRecord>) => Promise<any>;
  getCloneHistory: () => Promise<CloneHistoryRecord[]>;
  logIssueResult: (data: IssueResultRecord) => Promise<any>;
  saveJiraConfig: (config: JiraConfigRecord) => Promise<any>;
  getJiraConfig: (email?: string) => Promise<JiraConfigRecord | null>;
  saveOAuthToken: (token: OAuthTokenRecord) => Promise<any>;
  getOAuthToken: () => Promise<OAuthTokenRecord | null>;
}
