
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
  const { data: history, isLoading } = useQuery({
    queryKey: ['clone-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clone_history')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as HistoryRecord[];
    }
  });

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
                {history?.map((record) => (
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
                    <TableCell className="text-center text-jira-green">
                      {record.successful_issues}
                    </TableCell>
                    <TableCell className="text-center text-jira-red">
                      {record.failed_issues}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default History;

