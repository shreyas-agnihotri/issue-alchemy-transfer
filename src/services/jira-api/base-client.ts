
import { JiraConfig, JiraError } from './types';

export class BaseJiraClient {
  protected config: JiraConfig | null = null;
  protected isElectron = typeof window !== 'undefined' && 
    'electron' in window && window.electron !== undefined;

  setConfig(config: JiraConfig | null) {
    this.config = config;
  }

  protected getHeaders() {
    if (!this.config) {
      throw new Error('Jira configuration not set');
    }

    if (!this.config.auth.email || !this.config.auth.apiKey) {
      throw new Error('Email and API key are required for authentication');
    }

    // Create the credentials string in the format "email:apiKey"
    const credentials = `${this.config.auth.email}:${this.config.auth.apiKey}`;
    
    // Properly encode to base64 - encode UTF-8 string to base64
    const base64Auth = btoa(unescape(encodeURIComponent(credentials)));
    
    return {
      'Authorization': `Basic ${base64Auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.config) {
      throw new Error('Jira configuration not set');
    }

    const url = `${this.config.baseUrl}/rest/api/3/${endpoint}`;
    
    if (this.isElectron && window.electron) {
      return this.makeElectronRequest<T>(url, options);
    }
    
    return this.makeBrowserRequest<T>(url, options);
  }

  private async makeElectronRequest<T>(url: string, options: RequestInit): Promise<T> {
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
        this.handleErrorResponse(response);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Electron request error:', error);
      throw error;
    }
  }

  private async makeBrowserRequest<T>(url: string, options: RequestInit): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: this.getHeaders(),
      });
  
      if (!response.ok) {
        await this.handleErrorResponse(response);
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

  private async handleErrorResponse(response: Response | { ok: boolean; status: number; statusText: string; data: any }) {
    const error: JiraError = {
      status: response.status,
      message: 'response' in response ? response.statusText : response.statusText,
    };
    
    if (response.status === 401) {
      error.message = 'Authentication failed. Please check your API key and email.';
    }
    
    try {
      error.error = 'data' in response ? response.data : await response.json();
    } catch {
      try {
        error.error = 'data' in response ? response.data : await response.text();
      } catch (e) {
        error.error = 'Failed to parse error response';
      }
    }
    
    throw error;
  }
}
