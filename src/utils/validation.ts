
export const validateJiraUrl = (url: string): { isValid: boolean; message?: string } => {
  if (!url) return { isValid: true }; // Empty is OK as it's optional
  
  try {
    const urlObj = new URL(url);
    const isJiraUrl = urlObj.pathname.includes('/browse/');
    const hasIssueKey = /\/browse\/[A-Z]+-\d+/.test(urlObj.pathname);
    
    if (!isJiraUrl || !hasIssueKey) {
      return {
        isValid: false,
        message: "Invalid Jira issue URL format. Expected format: https://your-domain.atlassian.net/browse/PROJECT-123"
      };
    }
    
    return { isValid: true };
  } catch (e) {
    return {
      isValid: false,
      message: "Invalid URL format"
    };
  }
};

export const validateJql = (jql: string): { isValid: boolean; message?: string } => {
  if (!jql) return { isValid: true }; // Empty is OK as it's optional
  
  // Basic JQL syntax validation
  const containsValidOperators = /=|!=|>|<|IN|NOT IN|~|!~/i.test(jql);
  const hasValidStructure = /^[\w\s]+\s*[=!<>~]+/.test(jql.trim());
  
  if (!containsValidOperators || !hasValidStructure) {
    return {
      isValid: false,
      message: "Invalid JQL syntax. Example: project = 'DEMO' AND status != Closed"
    };
  }
  
  return { isValid: true };
};
