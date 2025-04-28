
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { validateJiraUrl, validateJql } from '@/utils/validation';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface JqlInputProps {
  jql: string;
  onJqlChange: (jql: string) => void;
  onSearch: () => void;
  isLoading: boolean;
}

const JqlInput: React.FC<JqlInputProps> = ({ jql, onJqlChange, onSearch, isLoading }) => {
  const [issueUrl, setIssueUrl] = useState('');
  const [urlError, setUrlError] = useState<string | undefined>();
  const [jqlError, setJqlError] = useState<string | undefined>();

  const handleUrlPaste = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setIssueUrl(url);
    
    const urlValidation = validateJiraUrl(url);
    setUrlError(urlValidation.message);
    
    if (urlValidation.isValid && url) {
      // Extract issue key from URL if it matches Jira URL pattern
      const issueKeyMatch = url.match(/\/browse\/([A-Z]+-\d+)/);
      if (issueKeyMatch) {
        const issueKey = issueKeyMatch[1];
        onJqlChange(`key = ${issueKey}`);
        setJqlError(undefined);
      }
    }
  };

  const handleJqlChange = (value: string) => {
    onJqlChange(value);
    const jqlValidation = validateJql(value);
    setJqlError(jqlValidation.message);
  };

  const handleSearch = () => {
    const urlValidation = validateJiraUrl(issueUrl);
    const jqlValidation = validateJql(jql);

    if (!urlValidation.isValid) {
      setUrlError(urlValidation.message);
      return;
    }

    if (!jqlValidation.isValid) {
      setJqlError(jqlValidation.message);
      return;
    }

    if (jql.trim() || issueUrl.trim()) {
      onSearch();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Issues</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="issue-url" className="block text-sm font-medium text-gray-700 mb-2">
              Issue URL
            </label>
            <Input
              id="issue-url"
              placeholder="Paste Jira issue URL here..."
              value={issueUrl}
              onChange={handleUrlPaste}
              className={cn("font-mono text-sm", urlError && "border-red-500")}
            />
            {urlError && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{urlError}</AlertDescription>
              </Alert>
            )}
          </div>
          <div>
            <label htmlFor="jql" className="block text-sm font-medium text-gray-700 mb-2">
              Or use JQL
            </label>
            <Textarea
              id="jql"
              placeholder='project = "DEMO" AND status != Closed ORDER BY created DESC'
              value={jql}
              onChange={(e) => handleJqlChange(e.target.value)}
              className={cn("font-mono text-sm", jqlError && "border-red-500")}
              rows={3}
            />
            {jqlError && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{jqlError}</AlertDescription>
              </Alert>
            )}
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleSearch}
              disabled={isLoading || (!jql.trim() && !issueUrl.trim()) || !!urlError || !!jqlError}
              className="bg-jira-blue hover:bg-jira-blue-dark"
            >
              <Search className="w-4 h-4 mr-2" />
              Search Issues
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JqlInput;
