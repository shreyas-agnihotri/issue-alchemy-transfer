import { z } from "zod";
import { JiraIssue } from "@/types/jira";

// JQL validation schema
export const jqlSchema = z.string().min(1).refine((val) => {
  // Basic JQL syntax validation
  const hasValidSyntax = /^[^=]*=[^=]*$|^[^~]*~[^~]*$/.test(val);
  return hasValidSyntax;
}, "Invalid JQL syntax");

// Validate JQL function
export const validateJql = (jql: string) => {
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
  const isValid = /^https?:\/\/[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\/(?:browse|issues)\/[A-Z]+-\d+$/.test(url);
  
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
