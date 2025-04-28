
import { Database } from 'better-sqlite3';

export const createIssueResultsOperations = (db: Database) => ({
  logIssueResult: (data: any) => {
    const stmt = db.prepare(`
      INSERT INTO clone_issue_results 
      (id, clone_history_id, source_issue_id, source_issue_key, target_issue_id, target_issue_key, status, error_message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      crypto.randomUUID(),
      data.clone_history_id,
      data.source_issue_id,
      data.source_issue_key,
      data.target_issue_id,
      data.target_issue_key,
      data.status,
      data.error_message
    );
    
    return Promise.resolve(result);
  }
});
