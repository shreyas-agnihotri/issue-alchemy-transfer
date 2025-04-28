
import { DatabaseOperations, CloneHistoryRecord, JiraConfigRecord } from './types';

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
    const history = localStorage.getItem('cloneHistory');
    return Promise.resolve(history ? JSON.parse(history) : []);
  },

  resetCloneHistory: () => {
    console.log('Mock resetCloneHistory');
    localStorage.removeItem('cloneHistory');
    return Promise.resolve();
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
    return Promise.resolve(config ? JSON.parse(config) : null);
  },

  resetJiraConfig: () => {
    console.log('Mock resetJiraConfig');
    localStorage.removeItem('jiraConfig');
    return Promise.resolve();
  }
};
