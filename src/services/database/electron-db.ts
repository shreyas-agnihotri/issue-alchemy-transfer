
import { DatabaseOperations } from './types';
import { mockDbOps } from './mock-db';
import { initializeDatabase } from './utils/db-init';
import { createCloneHistoryOperations } from './operations/clone-history';
import { createIssueResultsOperations } from './operations/issue-results';
import { createJiraConfigOperations } from './operations/jira-config';

export const createElectronDb = (): DatabaseOperations => {
  try {
    if (typeof window !== 'undefined' && window.navigator.userAgent.includes('Electron')) {
      // Instead of using window.require, we need to use a different approach
      // since we're in a renderer process with contextIsolation enabled
      
      // For this example with better-sqlite3, we'll need to create an IPC handler
      // to interact with the database from the main process
      
      console.log('Electron environment detected, but direct database access is not available.');
      console.log('Using mock database until proper IPC handlers are implemented.');
      
      // Return mock database operations for now
      // In a full implementation, we would create IPC channels for database operations
      return mockDbOps;
    }
    throw new Error('Not in Electron environment');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return mockDbOps;
  }
};
