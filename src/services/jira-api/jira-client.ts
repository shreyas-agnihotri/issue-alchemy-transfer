
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
        
        // Clone options to avoid mutating the original object
        const requestOptions = { ...options };
        
        // Ensure the body is stringified if it's an object
        if (requestOptions.body && typeof requestOptions.body === 'object') {
          requestOptions.body = JSON.stringify(requestOptions.body);
        }
        
        // Debug the exact request being sent
        console.debug('Request headers:', headers);
        console.debug('Request body:', requestOptions.body);
        
        const response = await window.electron.makeRequest({
          url,
          options: {
            ...requestOptions,
            headers
          }
        });
        
        console.debug('Response received:', response);
        
        if (!response.ok) {
          console.error('Electron request failed:', response.status, response.statusText);
          console.error('Response data:', response.data);
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
    // Improved validation before making the request
    if (!jql || jql.trim() === '') {
      throw new Error('JQL query cannot be empty');
    }

    const sanitizedJql = this.sanitizeJql(jql);
    console.log('Searching with sanitized JQL:', sanitizedJql);
    
    // Fix: Create a request body object and stringify it properly
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
      // Enhanced error handling for common Jira API issues
      if (error.status === 400 && error.error && error.error.errorMessages) {
        const errorMsg = error.error.errorMessages[0];
        if (errorMsg.includes('does not exist or you do not have permission')) {
          // Re-throw with a more user-friendly message
          const issueKey = this.extractIssueKeyFromJql(sanitizedJql);
          error.message = `Issue ${issueKey ? `'${issueKey}'` : ''} does not exist or you do not have permission to access it.`;
        }
      }
      throw error;
    }
  }

  // Extract issue key from a JQL query if it's a simple key search
  private extractIssueKeyFromJql(jql: string): string | null {
    // Match patterns like 'key = "ABC-123"' or 'key="ABC-123"'
    const keyMatch = jql.match(/key\s*=\s*["']?([A-Z]+-\d+)["']?/i);
    if (keyMatch && keyMatch[1]) {
      return keyMatch[1];
    }
    
    // Match simple issue key pattern
    const simpleKeyMatch = jql.match(/^["']?([A-Z]+-\d+)["']?$/);
    if (simpleKeyMatch && simpleKeyMatch[1]) {
      return simpleKeyMatch[1];
    }
    
    return null;
  }

  // Helper method to sanitize and normalize JQL
  private sanitizeJql(jql: string): string {
    // Remove any leading/trailing whitespace
    let sanitized = jql.trim();
    
    // If the JQL is just a simple issue key query (like "AV-98472"), format it properly
    if (/^[A-Z]+-\d+$/.test(sanitized)) {
      return `key = "${sanitized}"`;
    }
    
    // If it's just a key = something without quotes, add quotes
    const keyMatch = sanitized.match(/^key\s*=\s*([A-Z]+-\d+)$/i);
    if (keyMatch && keyMatch[1]) {
      return `key = "${keyMatch[1]}"`;
    }
    
    // Check if the JQL already contains quotes around the issue key
    const keyWithQuotesMatch = sanitized.match(/key\s*=\s*["']([A-Z]+-\d+)["']/i);
    if (!keyWithQuotesMatch && sanitized.includes('key =')) {
      // Add quotes around the issue key if it doesn't have them
      const keyValueMatch = sanitized.match(/key\s*=\s*([A-Z]+-\d+)/i);
      if (keyValueMatch && keyValueMatch[1]) {
        sanitized = sanitized.replace(keyValueMatch[0], `key = "${keyValueMatch[1]}"`);
      }
    }
    
    return sanitized;
  }

  async cloneIssue(issueKey: string, targetProjectKey: string): Promise<any> {
    // First get the issue details
    const issue = await this.request<{fields: any}>(`issue/${issueKey}`);
    
    // Prepare the new issue data
    const newIssueData = {
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
      body: JSON.stringify(newIssueData)
    });
  }
}

export const jiraClient = new JiraClient();
