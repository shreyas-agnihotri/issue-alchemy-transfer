
import { JiraIssue, JiraProject, JiraUser } from "@/types/jira";

export const mockUsers: JiraUser[] = [
  {
    id: "user-1",
    name: "John Smith",
    email: "john.smith@company.com",
    avatarUrl: "https://i.pravatar.cc/150?u=john",
  },
  {
    id: "user-2",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    avatarUrl: "https://i.pravatar.cc/150?u=sarah",
  },
  {
    id: "user-3",
    name: "Michael Brown",
    email: "michael.brown@company.com",
    avatarUrl: "https://i.pravatar.cc/150?u=michael",
  },
];

export const mockProjects: JiraProject[] = [
  {
    id: "proj-1",
    key: "CORE",
    name: "Core Application",
    isProductDiscovery: false,
  },
  {
    id: "proj-2",
    key: "MOBILE",
    name: "Mobile App",
    isProductDiscovery: false,
  },
  {
    id: "proj-3",
    key: "PD",
    name: "Product Discovery",
    isProductDiscovery: true,
  },
];

export const mockIssues: JiraIssue[] = [
  {
    id: "issue-1",
    key: "CORE-101",
    summary: "Implement user authentication",
    description: "Add JWT-based authentication for API endpoints",
    type: "Story",
    status: "Done",
    priority: "High",
    assignee: mockUsers[0],
    reporter: mockUsers[1],
    labels: ["authentication", "security"],
    created: "2023-03-15T10:30:00Z",
    updated: "2023-03-18T14:20:00Z",
    project: "proj-1",
  },
  {
    id: "issue-2",
    key: "CORE-102",
    summary: "Fix login page layout on mobile",
    description: "The login form breaks on screens smaller than 320px",
    type: "Bug",
    status: "In Progress",
    priority: "Medium",
    assignee: mockUsers[2],
    reporter: mockUsers[0],
    labels: ["ui", "mobile"],
    created: "2023-03-16T09:45:00Z",
    updated: "2023-03-17T11:30:00Z",
    project: "proj-1",
  },
  {
    id: "issue-3",
    key: "CORE-103",
    summary: "Add password strength indicator",
    description: "Show visual feedback on password strength during registration",
    type: "Task",
    status: "Open",
    priority: "Low",
    reporter: mockUsers[1],
    labels: ["ui", "security"],
    created: "2023-03-18T15:20:00Z",
    updated: "2023-03-18T15:20:00Z",
    project: "proj-1",
  },
  {
    id: "issue-4",
    key: "MOBILE-201",
    summary: "Create onboarding flow designs",
    description: "Design the new user onboarding flow for the mobile app",
    type: "Story",
    status: "In Progress",
    priority: "High",
    assignee: mockUsers[1],
    reporter: mockUsers[0],
    labels: ["design", "onboarding"],
    created: "2023-03-14T11:30:00Z",
    updated: "2023-03-18T13:15:00Z",
    project: "proj-2",
  },
  {
    id: "issue-5",
    key: "MOBILE-202",
    summary: "App crashes when uploading large images",
    description: "The app crashes when trying to upload images larger than 5MB",
    type: "Bug",
    status: "Open",
    priority: "Highest",
    assignee: mockUsers[2],
    reporter: mockUsers[1],
    labels: ["crash", "upload"],
    created: "2023-03-17T16:40:00Z",
    updated: "2023-03-18T09:10:00Z",
    project: "proj-2",
  },
];

export const getProjectById = (projectId: string): JiraProject | undefined => {
  return mockProjects.find((project) => project.id === projectId);
};

export const getIssuesByProjectId = (projectId: string): JiraIssue[] => {
  return mockIssues.filter((issue) => issue.project === projectId);
};
