
import { JiraIssue, JiraProject, JiraUser } from '@/types/jira';

export interface JiraConfig {
  baseUrl: string;
  auth: {
    type: 'api-key' | 'oauth';
    token?: string;
    email?: string;
    apiKey?: string;
  };
}

export interface JiraSearchResponse {
  issues: JiraIssue[];
  total: number;
  maxResults: number;
  startAt: number;
}

export interface JiraError {
  status: number;
  message: string;
  error?: any;
}
