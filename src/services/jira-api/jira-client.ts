
import { JiraConfig, JiraSearchResponse, JiraError } from './types';

class JiraClient {
  private config: JiraConfig | null = null;

  setConfig(config: JiraConfig) {
    this.config = config;
  }

  private getHeaders() {
    if (!this.config) {
      throw new Error('Jira configuration not set');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
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
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
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
    return this.request<JiraSearchResponse>('search', {
      method: 'POST',
      body: JSON.stringify({
        jql,
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
