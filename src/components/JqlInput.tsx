
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Search, Filter, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { validateJiraUrl, validateJql } from '@/utils/validation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const [filterOptions, setFilterOptions] = useState({
    includeSubtasks: true,
    includeLinks: true,
    keepRelationships: true
  });

  const handleUrlPaste = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setIssueUrl(url);
    
    // Clear previous errors
    setUrlError(undefined);
    
    if (!url.trim()) {
      return;
    }
    
    const urlValidation = validateJiraUrl(url);
    setUrlError(urlValidation.isValid ? undefined : urlValidation.message);
    
    if (urlValidation.isValid && url) {
      // Extract issue key from URL - support multiple URL formats
      const issueKeyMatch = url.match(/\/(?:browse|issues)\/([A-Z]+-\d+)/);
      if (issueKeyMatch) {
        const issueKey = issueKeyMatch[1];
        onJqlChange(`key = ${issueKey}`);
        setJqlError(undefined);
      }
    }
  };

  const handleJqlChange = (value: string) => {
    onJqlChange(value);
    
    // Don't show errors for empty JQL
    if (!value.trim()) {
      setJqlError(undefined);
      return;
    }
    
    // Basic validation for simple issue key format
    if (/^[A-Z]+-\d+$/.test(value.trim())) {
      setJqlError(undefined);
      return;
    }
    
    const jqlValidation = validateJql(value);
    setJqlError(jqlValidation.isValid ? undefined : jqlValidation.message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && (jql.trim() || issueUrl.trim()) && !urlError && !jqlError) {
        onSearch();
      }
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Search Issues</CardTitle>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  You can search by pasting a Jira URL, entering an issue key directly, 
                  or using JQL (Jira Query Language).
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium leading-none mb-3">Search Options</h4>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="subtasks"
                    checked={filterOptions.includeSubtasks}
                    onCheckedChange={(checked) =>
                      setFilterOptions(prev => ({ ...prev, includeSubtasks: !!checked }))
                    }
                  />
                  <Label htmlFor="subtasks">Include subtasks</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="links"
                    checked={filterOptions.includeLinks}
                    onCheckedChange={(checked) =>
                      setFilterOptions(prev => ({ ...prev, includeLinks: !!checked }))
                    }
                  />
                  <Label htmlFor="links">Include linked issues</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="relationships"
                    checked={filterOptions.keepRelationships}
                    onCheckedChange={(checked) =>
                      setFilterOptions(prev => ({ ...prev, keepRelationships: !!checked }))
                    }
                  />
                  <Label htmlFor="relationships">Maintain issue relationships</Label>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
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
              onKeyDown={handleKeyDown}
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
              onKeyDown={handleKeyDown}
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
              onClick={onSearch}
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
