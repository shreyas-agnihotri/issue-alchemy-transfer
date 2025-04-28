
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History as HistoryIcon } from 'lucide-react';
import { format } from 'date-fns';
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
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HistoryIcon className="h-6 w-6 text-muted-foreground" />
            <CardTitle>Clone History</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Source Project</TableHead>
                <TableHead>Target Project</TableHead>
                <TableHead>Total Issues</TableHead>
                <TableHead>Success</TableHead>
                <TableHead>Failed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history?.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {format(new Date(record.created_at), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>{record.source_project_id}</TableCell>
                  <TableCell>{record.target_project_id}</TableCell>
                  <TableCell>{record.total_issues}</TableCell>
                  <TableCell className="text-jira-green">
                    {record.successful_issues}
                  </TableCell>
                  <TableCell className="text-jira-red">
                    {record.failed_issues}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
