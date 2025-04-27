
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface JqlInputProps {
  jql: string;
  onJqlChange: (jql: string) => void;
  onSearch: () => void;
  isLoading: boolean;
}

const JqlInput: React.FC<JqlInputProps> = ({ jql, onJqlChange, onSearch, isLoading }) => {
  const [issueUrl, setIssueUrl] = useState('');

  const handleUrlPaste = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setIssueUrl(url);
    
    // Extract issue key from URL if it matches Jira URL pattern
    const issueKeyMatch = url.match(/\/browse\/([A-Z]+-\d+)/);
    if (issueKeyMatch) {
      const issueKey = issueKeyMatch[1];
      onJqlChange(`key = ${issueKey}`);
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
              className="font-mono text-sm"
            />
          </div>
          <div>
            <label htmlFor="jql" className="block text-sm font-medium text-gray-700 mb-2">
              Or use JQL
            </label>
            <Textarea
              id="jql"
              placeholder='project = "DEMO" AND status != Closed ORDER BY created DESC'
              value={jql}
              onChange={(e) => onJqlChange(e.target.value)}
              className="font-mono text-sm"
              rows={3}
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={onSearch}
              disabled={isLoading || (!jql.trim() && !issueUrl.trim())}
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
