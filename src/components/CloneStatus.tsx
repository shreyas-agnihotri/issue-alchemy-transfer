
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CloneResult } from '@/types/jira';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

interface CloneStatusProps {
  results: CloneResult[];
  isCloning: boolean;
}

const CloneStatus: React.FC<CloneStatusProps> = ({ results, isCloning }) => {
  const successCount = results.filter((r) => r.status === 'success').length;
  const failedCount = results.filter((r) => r.status === 'failed').length;
  const pendingCount = results.filter((r) => r.status === 'pending').length;

  if (results.length === 0 && !isCloning) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cloning Status</CardTitle>
      </CardHeader>
      <CardContent>
        {isCloning && (
          <div className="flex items-center justify-center p-6">
            <div className="flex flex-col items-center">
              <Loader className="h-8 w-8 text-jira-blue animate-spin" />
              <p className="mt-2 text-jira-neutral-dark">
                Cloning issues... Please wait
              </p>
            </div>
          </div>
        )}

        {!isCloning && results.length > 0 && (
          <div>
            <div className="flex items-center justify-center space-x-6 mb-6">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-jira-green mr-2" />
                <span>{successCount} successful</span>
              </div>
              <div className="flex items-center">
                <XCircle className="h-5 w-5 text-jira-red mr-2" />
                <span>{failedCount} failed</span>
              </div>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {results.map((result) => (
                <div
                  key={result.sourceIssue.id}
                  className="p-3 border rounded-md flex items-start"
                >
                  {result.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-jira-green mt-0.5" />
                  ) : result.status === 'failed' ? (
                    <XCircle className="h-5 w-5 text-jira-red mt-0.5" />
                  ) : (
                    <Loader className="h-5 w-5 text-jira-blue animate-spin mt-0.5" />
                  )}
                  <div className="ml-3">
                    <div className="font-medium">
                      {result.sourceIssue.key}: {result.sourceIssue.summary}
                    </div>
                    {result.status === 'success' && result.targetIssue && (
                      <div className="text-sm text-jira-neutral-medium">
                        Cloned to {result.targetIssue.key}
                      </div>
                    )}
                    {result.status === 'failed' && (
                      <div className="text-sm text-jira-red">
                        {result.error || 'Failed to clone issue'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CloneStatus;
