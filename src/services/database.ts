
// Mock database service for browser preview
// Real implementation will be used in Electron runtime

// Create a mock database implementation for browser preview
const isBrowser = typeof window !== 'undefined' && !window.navigator.userAgent.includes('Electron');

// Mock database operations for browser environment
const mockDbOps = {
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

  getJiraConfig: (email) => {
    console.log('Mock getJiraConfig:', email);
    const config = localStorage.getItem('jiraConfig');
    return config ? JSON.parse(config) : null;
  }
};

// Create a conditional export based on the environment
export const db_ops = isBrowser 
  ? mockDbOps 
  : (() => {
      try {
        // Only import and initialize SQLite in Electron environment
        if (typeof window !== 'undefined' && window.navigator.userAgent.includes('Electron')) {
          const { app } = window.require('electron');
          const Database = window.require('better-sqlite3');
          const path = window.require('path');
          const fs = window.require('fs');
          
          // Ensure data directory exists
          const userDataPath = app.getPath('userData');
          const dbPath = path.join(userDataPath, 'jira-clone.db');
          
          // Create database connection
          const db = new Database(dbPath);
          
          // Initialize database schema
          const initializeDatabase = () => {
            // Create tables if they don't exist
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
                api_key TEXT NOT NULL,
                user_email TEXT NOT NULL UNIQUE,
                jql_filter TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
              );
            `);
          };
          
          // Initialize database on startup
          initializeDatabase();
          
          // Database operations
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
                (id, jira_url, api_key, user_email, jql_filter)
                VALUES (?, ?, ?, ?, ?)
              `);
              
              return stmt.run(
                crypto.randomUUID(),
                config.jira_url,
                config.api_key,
                config.user_email,
                config.jql_filter
              );
            },

            getJiraConfig: (email) => {
              return db.prepare('SELECT * FROM jira_configs WHERE user_email = ?').get(email);
            }
          };
        }
        return mockDbOps;
      } catch (error) {
        console.error('Failed to initialize database:', error);
        return mockDbOps;
      }
    })();
