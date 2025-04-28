
import React from 'react';
import { db_ops } from '@/services/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History as HistoryIcon, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

interface HistoryRecord {
  id: string;
  source_project_id: string;
  target_project_id: string;
  total_issues: number;
  successful_issues: number;
  failed_issues: number;
  created_at: string;
  query?: string;
}

const History = () => {
  const { toast } = useToast();
  const [history, setHistory] = React.useState<HistoryRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchHistory = async () => {
      try {
        const records = db_ops.getCloneHistory();
        setHistory(Array.isArray(records) ? records : []);
      } catch (error) {
        console.error('Failed to fetch history:', error);
        toast({
          title: "Error loading history",
          description: "Could not retrieve clone history records",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistory();
  }, [toast]);

  if (isLoading) {
    return <div className="p-8">Loading history...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-4">
        <Button variant="ghost" asChild>
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HistoryIcon className="h-6 w-6 text-muted-foreground" />
            <CardTitle>Clone History</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Date</TableHead>
                  <TableHead className="min-w-[300px] max-w-[400px]">Query</TableHead>
                  <TableHead>Target Project</TableHead>
                  <TableHead className="text-center">Total Issues</TableHead>
                  <TableHead className="text-center">Success</TableHead>
                  <TableHead className="text-center">Failed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history?.length > 0 ? (
                  history.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {format(new Date(record.created_at), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="break-words">
                        <div className="max-h-[100px] overflow-y-auto">
                          {record.query || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>{record.target_project_id}</TableCell>
                      <TableCell className="text-center">{record.total_issues}</TableCell>
                      <TableCell className="text-center text-green-600">
                        {record.successful_issues}
                      </TableCell>
                      <TableCell className="text-center text-red-600">
                        {record.failed_issues}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No history records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
