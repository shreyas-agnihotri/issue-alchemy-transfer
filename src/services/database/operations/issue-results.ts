
import { Database } from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

export const createIssueResultsOperations = (db: Database) => ({
  logIssueResult: (data: any) => {
    const stmt = db.prepare(`
      INSERT INTO clone_issue_results 
      (id, clone_history_id, source_issue_id, source_issue_key, target_issue_id, target_issue_key, status, error_message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    // Use uuid instead of crypto.randomUUID() for compatibility
    const result = stmt.run(
      uuidv4(),
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
