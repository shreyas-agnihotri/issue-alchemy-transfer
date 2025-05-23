
import { z } from "zod";
import { JiraIssue } from "@/types/jira";

// JQL validation schema
export const jqlSchema = z.string().min(1).refine((val) => {
  // Handle simple issue key format (PROJECT-123) - case insensitive
  if (/^[A-Z]+-\d+$/i.test(val.trim())) {
    return true;
  }
  
  // Handle key = PROJECT-123 format - case insensitive
  if (/^key\s*=\s*[A-Z]+-\d+$/i.test(val.trim())) {
    return true;
  }
  
  // Handle quoted key format
  if (/^key\s*=\s*["'][A-Z]+-\d+["']$/i.test(val.trim())) {
    return true;
  }
  
  // Basic JQL syntax validation for more complex queries
  // This is a simplified check - Jira's JQL syntax is much more complex
  const hasOperators = /=|!=|~|!~|>|<|>=|<=|in|not in|is|is not/i.test(val);
  const hasWellFormedClauses = !(
    val.includes("=") && !(/\w+\s*=/.test(val)) ||
    val.includes("~") && !(/\w+\s*~/.test(val))
  );
  
  return hasOperators && hasWellFormedClauses;
}, "Invalid JQL syntax");

// Validate JQL function
export const validateJql = (jql: string) => {
  // Special case for empty strings - don't validate
  if (!jql.trim()) {
    return { isValid: true, message: "" };
  }
  
  // Special case for simple issue key - case insensitive
  if (/^[A-Z]+-\d+$/i.test(jql.trim())) {
    return { isValid: true, message: "" };
  }
  
  const result = jqlSchema.safeParse(jql);
  return {
    isValid: result.success,
    message: result.success ? "" : "Invalid JQL syntax. Please check your query."
  };
};

// Jira URL validation
export const validateJiraUrl = (url: string) => {
  if (url === "") return { isValid: true, message: "" };
  
  // Generic URL validation for Jira instances - matches company hosted and cloud instances
  // Updated pattern to match a wider variety of Jira URL formats - case insensitive
  const isValid = /^https?:\/\/[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*(?:\/[a-zA-Z0-9-_]*)?\/(?:browse|issues)\/[A-Z]+-\d+(?:[?#].*)?$/i.test(url);
  
  return {
    isValid,
    message: isValid ? "" : "Invalid Jira URL. Please enter a valid Jira issue URL"
  };
};

// Clone operation validation
export const cloneOperationSchema = z.object({
  sourceProjectId: z.string().min(1),
  targetProjectId: z.string().min(1),
  issues: z.array(z.string()).min(1).max(100),
  options: z.object({
    includeSubtasks: z.boolean(),
    maintainLinks: z.boolean(),
    keepRelationships: z.boolean(),
    retryFailed: z.boolean(),
  }),
});

export type CloneOperationValidated = z.infer<typeof cloneOperationSchema>;

// Results validation
export const cloneResultSchema = z.object({
  success: z.boolean(),
  sourceIssueId: z.string(),
  targetIssueId: z.string().optional(),
  error: z.string().optional(),
  retryCount: z.number().default(0),
});

export type CloneResultValidated = z.infer<typeof cloneResultSchema>;

// OAuth token validation
export const oauthTokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresAt: z.number(),
  tokenType: z.string(),
});

// Error types
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class CloneOperationError extends Error {
  constructor(
    message: string,
    public readonly sourceIssueId: string,
    public readonly retryable: boolean = true
  ) {
    super(message);
    this.name = "CloneOperationError";
  }
}

// Validators
export const validateJiraIssue = (issue: JiraIssue): boolean => {
  return Boolean(
    issue &&
    issue.id &&
    issue.key &&
    issue.project &&
    typeof issue.summary === 'string'
  );
};

export const validateCloneOperation = (data: unknown): CloneOperationValidated => {
  const result = cloneOperationSchema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  return result.data;
};

export const validateOAuthToken = (token: unknown) => {
  const result = oauthTokenSchema.safeParse(token);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  return result.data;
};
