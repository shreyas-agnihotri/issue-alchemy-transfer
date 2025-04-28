
import { Database } from 'better-sqlite3';
import { JiraConfigRecord, OAuthTokenRecord } from '../types';

export const createJiraConfigOperations = (db: Database) => ({
  saveJiraConfig: (config: JiraConfigRecord) => {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO jira_configs 
      (id, jira_url, api_key, oauth_client_id, oauth_client_secret, auth_method, user_email, jql_filter)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      crypto.randomUUID(),
      config.jira_url,
      config.api_key || null,
      config.oauth_client_id || null,
      config.oauth_client_secret || null,
      config.auth_method || 'api-key',
      config.user_email || null,
      config.jql_filter
    );
    
    return Promise.resolve(result);
  },

  getJiraConfig: () => {
    const result = db.prepare('SELECT * FROM jira_configs ORDER BY created_at DESC LIMIT 1').get();
    return Promise.resolve(result);
  },

  saveOAuthToken: (token: OAuthTokenRecord) => {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO oauth_tokens
      (id, access_token, refresh_token, token_type, expires_at, scope)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      crypto.randomUUID(),
      token.access_token,
      token.refresh_token || null,
      token.token_type,
      token.expires_at,
      token.scope || null
    );
    
    return Promise.resolve(result);
  },

  getOAuthToken: () => {
    const result = db.prepare('SELECT * FROM oauth_tokens ORDER BY created_at DESC LIMIT 1').get();
    return Promise.resolve(result);
  },

  resetJiraConfig: () => {
    const stmtConfig = db.prepare('DELETE FROM jira_configs');
    stmtConfig.run();
    
    const stmtToken = db.prepare('DELETE FROM oauth_tokens');
    stmtToken.run();
    
    return Promise.resolve();
  }
});
