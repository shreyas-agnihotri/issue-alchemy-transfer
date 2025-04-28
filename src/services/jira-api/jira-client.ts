
import { JiraConfig } from './types';
import { JiraIssueOperations } from './issue-operations';
import { JiraAuthOperations } from './auth-operations';

class JiraClient extends JiraIssueOperations {
  private authOperations: JiraAuthOperations;

  constructor() {
    super();
    this.authOperations = new JiraAuthOperations();
  }

  setConfig(config: JiraConfig | null) {
    super.setConfig(config);
    this.authOperations.setConfig(config);
  }

  async validateCredentials(): Promise<boolean> {
    return this.authOperations.validateCredentials();
  }

  async testConnection(config: JiraConfig): Promise<boolean> {
    return this.authOperations.testConnection(config);
  }
}

export const jiraClient = new JiraClient();
