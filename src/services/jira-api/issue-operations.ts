
import { BaseJiraClient } from './base-client';
import { JiraSearchResponse } from './types';

export class JiraIssueOperations extends BaseJiraClient {
  async searchIssues(jql: string): Promise<JiraSearchResponse> {
    if (!jql || jql.trim() === '') {
      throw new Error('JQL query cannot be empty');
    }

    const sanitizedJql = this.sanitizeJql(jql);
    console.log('Searching with sanitized JQL:', sanitizedJql);
    
    const requestBody = {
      jql: sanitizedJql,
      maxResults: 50,
      fields: [
        'summary',
        'description',
        'issuetype',
        'status',
        'priority',
        'assignee',
        'reporter',
        'labels',
        'parent',
        'created',
        'updated',
        'project'
      ]
    };
    
    try {
      return await this.request<JiraSearchResponse>('search', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });
    } catch (error: any) {
      if (error.status === 400 && error.error && error.error.errorMessages) {
        const errorMsg = error.error.errorMessages[0];
        if (errorMsg.includes('does not exist or you do not have permission')) {
          const issueKey = this.extractIssueKeyFromJql(sanitizedJql);
          error.message = `Issue ${issueKey ? `'${issueKey}'` : ''} does not exist or you do not have permission to access it.`;
        }
      }
      throw error;
    }
  }

  async cloneIssue(issueKey: string, targetProjectKey: string): Promise<any> {
    const issue = await this.request<{fields: any}>(`issue/${issueKey}`);
    
    const newIssueData = {
      fields: {
        ...issue.fields,
        project: { key: targetProjectKey },
        assignee: null,
        reporter: null,
        created: undefined,
        updated: undefined,
      }
    };

    return this.request('issue', {
      method: 'POST',
      body: JSON.stringify(newIssueData)
    });
  }

  private extractIssueKeyFromJql(jql: string): string | null {
    const keyMatch = jql.match(/key\s*=\s*["']?([A-Z]+-\d+)["']?/i);
    if (keyMatch && keyMatch[1]) {
      return keyMatch[1];
    }
    
    const simpleKeyMatch = jql.match(/^["']?([A-Z]+-\d+)["']?$/);
    if (simpleKeyMatch && simpleKeyMatch[1]) {
      return simpleKeyMatch[1];
    }
    
    return null;
  }

  private sanitizeJql(jql: string): string {
    let sanitized = jql.trim();
    
    if (/^[A-Z]+-\d+$/.test(sanitized)) {
      return `key = "${sanitized}"`;
    }
    
    const keyMatch = sanitized.match(/^key\s*=\s*([A-Z]+-\d+)$/i);
    if (keyMatch && keyMatch[1]) {
      return `key = "${keyMatch[1]}"`;
    }
    
    const keyWithQuotesMatch = sanitized.match(/key\s*=\s*["']([A-Z]+-\d+)["']/i);
    if (!keyWithQuotesMatch && sanitized.includes('key =')) {
      const keyValueMatch = sanitized.match(/key\s*=\s*([A-Z]+-\d+)/i);
      if (keyValueMatch && keyValueMatch[1]) {
        sanitized = sanitized.replace(keyValueMatch[0], `key = "${keyValueMatch[1]}"`);
      }
    }
    
    return sanitized;
  }
}
