
import { JiraConfig, JiraSearchResponse, JiraError } from './types';

class JiraClient {
  private config: JiraConfig | null = null;
  private isElectron = typeof window !== 'undefined' && 
    'electron' in window && window.electron !== undefined;

  setConfig(config: JiraConfig | null) {
    this.config = config;
  }

  private getHeaders() {
    if (!this.config) {
      throw new Error('Jira configuration not set');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (this.config.auth.type === 'api-key') {
      const base64Auth = btoa(`${this.config.auth.email}:${this.config.auth.apiKey}`);
      headers['Authorization'] = `Basic ${base64Auth}`;
    } else {
      headers['Authorization'] = `Bearer ${this.config.auth.token}`;
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.config) {
      throw new Error('Jira configuration not set');
    }

    const url = `${this.config.baseUrl}/rest/api/3/${endpoint}`;
    
    // Use Electron's IPC for requests when in Electron environment to bypass CORS
    if (this.isElectron && window.electron) {
      try {
        console.log('Using Electron IPC for request:', url);
        const headers = this.getHeaders();
        
        const response = await window.electron.makeRequest({
          url,
          options: {
            ...options,
            headers
          }
        });
        
        if (!response.ok) {
          console.error('Electron request failed:', response.status, response.statusText);
          const error: JiraError = {
            status: response.status,
            message: response.statusText || 'Request failed',
            error: response.data
          };
          throw error;
        }
        
        return response.data;
      } catch (error: any) {
        console.error('Electron request error:', error);
        throw error;
      }
    }
    
    // Browser fetch implementation
    const response = await fetch(url, {
      ...options,
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error: JiraError = {
        status: response.status,
        message: response.statusText,
      };
      
      try {
        error.error = await response.json();
      } catch {
        // If parsing json fails, use text
        error.error = await response.text();
      }
      
      throw error;
    }

    return response.json();
  }

  async searchIssues(jql: string): Promise<JiraSearchResponse> {
    const sanitizedJql = this.sanitizeJql(jql);
    console.log('Searching with sanitized JQL:', sanitizedJql);
    
    return this.request<JiraSearchResponse>('search', {
      method: 'POST',
      body: JSON.stringify({
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
      })
    });
  }

  // Helper method to sanitize and normalize JQL
  private sanitizeJql(jql: string): string {
    // Remove any leading/trailing whitespace
    let sanitized = jql.trim();
    
    // If the JQL is just a simple issue key query (like "AV-98472"), format it properly
    if (/^[A-Z]+-\d+$/.test(sanitized)) {
      return `key = ${sanitized}`;
    }
    
    // If it's just a key = something without quotes, add quotes
    if (/^key\s*=\s*[A-Z]+-\d+$/.test(sanitized)) {
      const match = sanitized.match(/^key\s*=\s*([A-Z]+-\d+)$/);
      if (match && match[1]) {
        return `key = "${match[1]}"`;
      }
    }
    
    return sanitized;
  }

  async cloneIssue(issueKey: string, targetProjectKey: string): Promise<any> {
    // First get the issue details
    const issue = await this.request<{fields: any}>(`issue/${issueKey}`);
    
    // Prepare the new issue data
    const newIssue = {
      fields: {
        ...issue.fields,
        project: { key: targetProjectKey },
        // Reset some fields that shouldn't be copied
        assignee: null,
        reporter: null,
        created: undefined,
        updated: undefined,
      }
    };

    // Create the new issue
    return this.request('issue', {
      method: 'POST',
      body: JSON.stringify(newIssue)
    });
  }
}

export const jiraClient = new JiraClient();
