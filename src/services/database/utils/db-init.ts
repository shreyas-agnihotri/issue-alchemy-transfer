
import { Database } from 'better-sqlite3';

export const initializeDatabase = (db: Database) => {
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
      auth_method TEXT NOT NULL DEFAULT 'api-key',
      user_email TEXT,
      jql_filter TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
};
