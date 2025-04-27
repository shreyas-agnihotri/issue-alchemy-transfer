
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface JiraConfigFormData {
  jira_url: string;
  api_key: string;
  user_email: string;
  jql_filter: string;
}

const JiraConfig = () => {
  const { toast } = useToast();
  const form = useForm<JiraConfigFormData>();

  const onSubmit = async (data: JiraConfigFormData) => {
    try {
      const { error } = await supabase
        .from('jira_configs')
        .upsert([data], { onConflict: 'user_email' });

      if (error) throw error;

      toast({
        title: "Configuration saved",
        description: "Your JIRA configuration has been updated successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save JIRA configuration.",
        variant: "destructive"
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>JIRA Configuration</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="jira_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>JIRA URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://your-domain.atlassian.net" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Your JIRA API Key" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="user_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="your-email@example.com" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jql_filter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default JQL Filter</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder='project = "DEMO" AND status != Closed ORDER BY created DESC' 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Enter a JQL query to filter which issues appear in the clone interface.
                  </FormDescription>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">Save Configuration</Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default JiraConfig;
