
import { Database } from 'better-sqlite3';
import { CloneHistoryRecord } from '../types';

export const createCloneHistoryOperations = (db: Database) => ({
  createCloneHistory: (data: Omit<CloneHistoryRecord, 'id'>) => {
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
    
    return Promise.resolve({ id, ...data });
  },

  updateCloneHistory: (id: string, updates: Partial<CloneHistoryRecord>) => {
    const stmt = db.prepare(`
      UPDATE clone_history
      SET successful_issues = COALESCE(?, successful_issues),
          failed_issues = COALESCE(?, failed_issues)
      WHERE id = ?
    `);
    
    stmt.run(updates.successful_issues, updates.failed_issues, id);
    return Promise.resolve({ id, ...updates });
  },

  getCloneHistory: () => {
    const results = db.prepare('SELECT * FROM clone_history ORDER BY created_at DESC').all();
    return Promise.resolve(results);
  },

  resetCloneHistory: () => {
    const stmt = db.prepare('DELETE FROM clone_history');
    stmt.run();
    
    const stmtIssueResults = db.prepare('DELETE FROM clone_issue_results');
    stmtIssueResults.run();
    
    return Promise.resolve();
  }
});
