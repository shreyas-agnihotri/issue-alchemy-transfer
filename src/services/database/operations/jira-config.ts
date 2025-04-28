
import { Database } from 'better-sqlite3';
import { JiraConfigRecord } from '../types';

export const createJiraConfigOperations = (db: Database) => ({
  saveJiraConfig: (config: JiraConfigRecord) => {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO jira_configs 
      (id, jira_url, api_key, auth_method, user_email, jql_filter)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      crypto.randomUUID(),
      config.jira_url,
      config.api_key || null,
      'api-key',
      config.user_email || null,
      config.jql_filter
    );
    
    return Promise.resolve(result);
  },

  getJiraConfig: () => {
    const result = db.prepare('SELECT * FROM jira_configs ORDER BY created_at DESC LIMIT 1').get();
    return Promise.resolve(result);
  },

  resetJiraConfig: () => {
    const stmtConfig = db.prepare('DELETE FROM jira_configs');
    stmtConfig.run();
    return Promise.resolve();
  }
});
