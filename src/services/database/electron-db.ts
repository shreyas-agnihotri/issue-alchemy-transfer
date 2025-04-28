
import { DatabaseOperations } from './types';

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
      db.exec(`
        CREATE TABLE IF NOT EXISTS clone_history (
          id TEXT PRIMARY KEY,
          source_project_id TEXT NOT NULL,
          target_project_id TEXT NOT NULL,
          total_issues INTEGER NOT NULL,
          successful_issues INTEGER NOT NULL,
          failed_issues INTEGER NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          query TEXT
        );

        CREATE TABLE IF NOT EXISTS clone_issue_results (
          id TEXT PRIMARY KEY,
          clone_history_id TEXT NOT NULL,
          source_issue_id TEXT NOT NULL,
          source_issue_key TEXT NOT NULL,
          target_issue_id TEXT,
          target_issue_key TEXT,
          status TEXT NOT NULL,
          error_message TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (clone_history_id) REFERENCES clone_history(id)
        );

        CREATE TABLE IF NOT EXISTS issue_links (
          id TEXT PRIMARY KEY,
          source_issue_id TEXT NOT NULL,
          target_issue_id TEXT NOT NULL,
          metadata TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS jira_configs (
          id TEXT PRIMARY KEY,
          jira_url TEXT NOT NULL,
          api_key TEXT,
          oauth_client_id TEXT,
          oauth_client_secret TEXT,
          auth_method TEXT NOT NULL DEFAULT 'api-key',
          user_email TEXT,
          jql_filter TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS oauth_tokens (
          id TEXT PRIMARY KEY,
          access_token TEXT NOT NULL,
          refresh_token TEXT,
          token_type TEXT NOT NULL,
          expires_at INTEGER NOT NULL,
          scope TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      return {
        createCloneHistory: (data) => {
          const stmt = db.prepare(`
            INSERT INTO clone_history 
            (id, source_project_id, target_project_id, total_issues, successful_issues, failed_issues, query)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `);
          
          const id = crypto.randomUUID();
          stmt.run(
            id,
            data.source_project_id,
            data.target_project_id,
            data.total_issues,
            data.successful_issues,
            data.failed_issues,
            data.query
          );
          
          return { id, ...data };
        },

        updateCloneHistory: (id, updates) => {
          const stmt = db.prepare(`
            UPDATE clone_history
            SET successful_issues = COALESCE(?, successful_issues),
                failed_issues = COALESCE(?, failed_issues)
            WHERE id = ?
          `);
          
          return stmt.run(updates.successful_issues, updates.failed_issues, id);
        },

        getCloneHistory: () => {
          return db.prepare('SELECT * FROM clone_history ORDER BY created_at DESC').all();
        },

        logIssueResult: (data) => {
          const stmt = db.prepare(`
            INSERT INTO clone_issue_results 
            (id, clone_history_id, source_issue_id, source_issue_key, target_issue_id, target_issue_key, status, error_message)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          return stmt.run(
            crypto.randomUUID(),
            data.clone_history_id,
            data.source_issue_id,
            data.source_issue_key,
            data.target_issue_id,
            data.target_issue_key,
            data.status,
            data.error_message
          );
        },

        saveJiraConfig: (config) => {
          const stmt = db.prepare(`
            INSERT OR REPLACE INTO jira_configs 
            (id, jira_url, api_key, oauth_client_id, oauth_client_secret, auth_method, user_email, jql_filter)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          return stmt.run(
            crypto.randomUUID(),
            config.jira_url,
            config.api_key || null,
            config.oauth_client_id || null,
            config.oauth_client_secret || null,
            config.auth_method || 'api-key',
            config.user_email || null,
            config.jql_filter
          );
        },

        getJiraConfig: () => {
          return db.prepare('SELECT * FROM jira_configs ORDER BY created_at DESC LIMIT 1').get();
        },
        
        saveOAuthToken: (token) => {
          const stmt = db.prepare(`
            INSERT OR REPLACE INTO oauth_tokens
            (id, access_token, refresh_token, token_type, expires_at, scope)
            VALUES (?, ?, ?, ?, ?, ?)
          `);
          
          return stmt.run(
            crypto.randomUUID(),
            token.access_token,
            token.refresh_token || null,
            token.token_type,
            token.expires_at,
            token.scope || null
          );
        },
        
        getOAuthToken: () => {
          return db.prepare('SELECT * FROM oauth_tokens ORDER BY created_at DESC LIMIT 1').get();
        }
      };
    }
    throw new Error('Not in Electron environment');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return mockDbOps;
  }
};
