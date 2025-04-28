
import { DatabaseOperations } from './types';
import { mockDbOps } from './mock-db';
import { initializeDatabase } from './utils/db-init';
import { createCloneHistoryOperations } from './operations/clone-history';
import { createIssueResultsOperations } from './operations/issue-results';
import { createJiraConfigOperations } from './operations/jira-config';

export const createElectronDb = (): DatabaseOperations => {
  try {
    if (typeof window !== 'undefined' && window.navigator.userAgent.includes('Electron')) {
      const { app } = window.require('electron');
      const Database = window.require('better-sqlite3');
      const path = window.require('path');
      
      // Initialize database
      const userDataPath = app.getPath('userData');
      const dbPath = path.join(userDataPath, 'jira-clone.db');
      const db = new Database(dbPath);
      
      // Initialize schema
      initializeDatabase(db);

      // Create operations
      const cloneHistoryOps = createCloneHistoryOperations(db);
      const issueResultsOps = createIssueResultsOperations(db);
      const jiraConfigOps = createJiraConfigOperations(db);

      return {
        ...cloneHistoryOps,
        ...issueResultsOps,
        ...jiraConfigOps
      };
    }
    throw new Error('Not in Electron environment');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return mockDbOps;
  }
};
