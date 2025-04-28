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

    if (!this.config.auth.email || !this.config.auth.apiKey) {
      throw new Error('Email and API key are required for authentication');
    }

    const credentials = `${this.config.auth.email}:${this.config.auth.apiKey}`;
    const base64Auth = btoa(credentials);
    
    return {
      'Authorization': `Basic ${base64Auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.config) {
      throw new Error('Jira configuration not set');
    }

    const url = `${this.config.baseUrl}/rest/api/3/${endpoint}`;
    
    if (this.isElectron && window.electron) {
      try {
        console.log('Using Electron IPC for request:', url);
        const headers = this.getHeaders();
        
        const requestOptions = { ...options };
        
        if (requestOptions.body && typeof requestOptions.body === 'object') {
          requestOptions.body = JSON.stringify(requestOptions.body);
        }
        
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
          
          // Handle specific error cases
          if (response.status === 401) {
            throw {
              status: 401,
              message: 'Authentication failed. Please check your API key and email.',
              error: response.data
            };
          }
          
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
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: this.getHeaders(),
      });
  
      if (!response.ok) {
        const error: JiraError = {
          status: response.status,
          message: response.statusText,
        };
        
        // Handle 401 errors specifically
        if (response.status === 401) {
          error.message = 'Authentication failed. Please check your API key and email.';
        }
        
        try {
          error.error = await response.json();
        } catch {
          try {
            error.error = await response.text();
          } catch (e) {
            error.error = 'Failed to parse error response';
          }
        }
        
        throw error;
      }
  
      return response.json();
    } catch (error: any) {
      if (!error.status) {
        // Network or CORS errors
        error = {
          status: 0,
          message: error.message || 'Network error',
          error: error
        };
      }
      throw error;
    }
  }

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

  async validateCredentials(): Promise<boolean> {
    try {
      await this.request('myself');
      return true;
    } catch (error: any) {
      console.error('Validation error:', error);
      
      // Rethrow the error to be handled by the caller
      throw error;
    }
  }

  async testConnection(config: JiraConfig): Promise<boolean> {
    const previousConfig = this.config;
    this.config = config;

    try {
      // Use a more specific endpoint that's less likely to have permission issues
      await this.request('myself');
      this.config = previousConfig;
      return true;
    } catch (error) {
      this.config = previousConfig;
      throw error;
    }
  }
}

export const jiraClient = new JiraClient();
