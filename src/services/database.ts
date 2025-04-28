
import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

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
export const db_ops = {
  createCloneHistory: (data: {
    source_project_id: string;
    target_project_id: string;
    total_issues: number;
    successful_issues: number;
    failed_issues: number;
    query?: string;
  }) => {
    const stmt = db.prepare(`
      INSERT INTO clone_history 
      (id, source_project_id, target_project_id, total_issues, successful_issues, failed_issues, query)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const id = crypto.randomUUID();
    const result = stmt.run(
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

  updateCloneHistory: (id: string, updates: {
    successful_issues?: number;
    failed_issues?: number;
  }) => {
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

  logIssueResult: (data: {
    clone_history_id: string;
    source_issue_id: string;
    source_issue_key: string;
    target_issue_id?: string;
    target_issue_key?: string;
    status: string;
    error_message?: string;
  }) => {
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

  saveJiraConfig: (config: {
    jira_url: string;
    api_key: string;
    user_email: string;
    jql_filter?: string;
  }) => {
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

  getJiraConfig: (email: string) => {
    return db.prepare('SELECT * FROM jira_configs WHERE user_email = ?').get(email);
  }
};
