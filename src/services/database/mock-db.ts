
import { DatabaseOperations, CloneHistoryRecord, JiraConfigRecord, OAuthTokenRecord } from './types';

// Mock database operations for browser environment
export const mockDbOps: DatabaseOperations = {
  createCloneHistory: (data) => {
    console.log('Mock createCloneHistory:', data);
    const id = crypto.randomUUID();
    return Promise.resolve({ id, ...data });
  },

  updateCloneHistory: (id, updates) => {
    console.log('Mock updateCloneHistory:', id, updates);
    return Promise.resolve({ id, ...updates });
  },

  getCloneHistory: () => {
    console.log('Mock getCloneHistory');
    return [
      {
        id: '1',
        source_project_id: 'DEMO',
        target_project_id: 'TARGET',
        total_issues: 10,
        successful_issues: 8,
        failed_issues: 2,
        created_at: new Date().toISOString(),
        query: 'project = DEMO'
      }
    ];
  },

  logIssueResult: (data) => {
    console.log('Mock logIssueResult:', data);
    return Promise.resolve(data);
  },

  saveJiraConfig: (config) => {
    console.log('Mock saveJiraConfig:', config);
    localStorage.setItem('jiraConfig', JSON.stringify(config));
    return Promise.resolve(config);
  },

  getJiraConfig: () => {
    console.log('Mock getJiraConfig');
    const config = localStorage.getItem('jiraConfig');
    return config ? JSON.parse(config) : null;
  },
  
  saveOAuthToken: (token) => {
    console.log('Mock saveOAuthToken:', token);
    localStorage.setItem('jiraOAuthToken', JSON.stringify(token));
    return Promise.resolve(token);
  },
  
  getOAuthToken: () => {
    console.log('Mock getOAuthToken');
    const token = localStorage.getItem('jiraOAuthToken');
    return token ? JSON.parse(token) : null;
  }
};
