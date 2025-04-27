
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface JqlInputProps {
  jql: string;
  onJqlChange: (jql: string) => void;
  onSearch: () => void;
  isLoading: boolean;
}

const JqlInput: React.FC<JqlInputProps> = ({ jql, onJqlChange, onSearch, isLoading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>JIRA Query</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Textarea
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
              disabled={isLoading || !jql.trim()}
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
