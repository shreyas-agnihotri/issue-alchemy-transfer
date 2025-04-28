
# JIRA Deep Clone Application - Requirements Document

## Overview
Create a desktop application using Electron, React, and TypeScript that enables users to clone JIRA issues between projects. The app should run both as a desktop application (with Electron) and as a web app, with appropriate fallbacks for browser environments.

## Core Technologies
- Electron for desktop functionality
- Vite & React for UI
- TypeScript for type safety
- Tailwind CSS for styling
- shadcn-ui component library
- SQLite (via better-sqlite3) for local data persistence in desktop mode
- localStorage fallback for web browser mode

## Key Features

### 1. Issue Cloning Functionality
- Allow users to search for issues using JQL (JIRA Query Language)
- Display search results in a selectable list
- Allow selection of target project for cloning
- Enable bulk cloning of multiple issues at once
- Support cloning options:
  - Include subtasks
  - Maintain issue links
  - Keep parent-child relationships
  - Retry failed clones

### 2. Data Persistence
- Store clone history records containing:
  - Source and target project IDs
  - Total, successful, and failed issue counts
  - Original JQL query
  - Timestamp
- Track individual issue results with:
  - Source issue ID and key
  - Target issue ID and key (if successful)
  - Status (success/failure)
  - Error messages (if applicable)
- Maintain JIRA configuration:
  - JIRA URL
  - Authentication method (API key or OAuth)
  - Default JQL filters

### 3. Authentication
- Support both API Key and OAuth 2.0 authentication methods
- Store authentication tokens securely
- Handle token refresh for OAuth

### 4. User Interface
- Clean, responsive design with Tailwind CSS
- Configuration panel for JIRA settings
- Issue selection interface with filtering
- Clone status display showing progress and results
- History page showing past clone operations

### 5. Application Architecture
- Modular database service with:
  - Type definitions
  - Mock implementation for browser environments
  - Electron/SQLite implementation for desktop
- Clean separation of concerns:
  - Database operations
  - Cloning logic
  - UI components
- Support for both desktop and web environments

## Technical Requirements

### Database Schema
Implement the following tables:
- `clone_history`: Records of clone operations
- `clone_issue_results`: Individual issue clone results
- `issue_links`: Relationships between cloned issues
- `jira_configs`: JIRA connection settings
- `oauth_tokens`: Authentication token storage

### File Organization
- Follow a modular approach with small, focused files
- Separate services, hooks, and UI components
- Use TypeScript interfaces for data consistency

### Error Handling
- Provide meaningful error messages
- Gracefully handle API failures
- Log errors to help with debugging

### Cross-Platform Support
- Ensure the app works in both Electron and browser environments
- Use appropriate API fallbacks based on environment detection

## Implementation Notes
- Use React Query for data fetching
- Implement custom hooks for specific functionality
- Follow shadcn/ui patterns for consistent UI
- Incorporate Lucide React for icons
- Ensure responsive design for all screen sizes

This application serves as a specialized tool for JIRA administrators and power users who need to efficiently transfer issues between projects while maintaining relationships and metadata.

