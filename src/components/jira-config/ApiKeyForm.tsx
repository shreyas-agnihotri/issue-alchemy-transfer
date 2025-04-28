import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { db_ops } from '@/services/database';
import { jiraClient } from '@/services/jira-api/jira-client';

export interface JiraApiKeyFormData {
  jira_url: string;
  api_key: string;
  user_email: string;
  jql_filter: string;
}

export function ApiKeyForm() {
  const { toast } = useToast();
  const form = useForm<JiraApiKeyFormData>();

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await db_ops.getJiraConfig();
        if (config && config.auth_method === 'api-key') {
          form.reset({
            jira_url: config.jira_url,
            api_key: config.api_key || '',
            user_email: config.user_email || '',
            jql_filter: config.jql_filter || ''
          });
        }
      } catch (error) {
        console.error('Error loading API key config:', error);
      }
    };

    loadConfig();
  }, [form]);

  const onSubmit = async (data: JiraApiKeyFormData) => {
    try {
      await db_ops.saveJiraConfig({
        ...data,
        auth_method: 'api-key'
      });

      // Configure the Jira client with the new credentials
      jiraClient.setConfig({
        baseUrl: data.jira_url,
        auth: {
          type: 'api-key',
          apiKey: data.api_key,
          email: data.user_email
        }
      });

      toast({
        title: "Configuration saved",
        description: "Your JIRA API key configuration has been updated successfully."
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
    <Card>
      <CardHeader>
        <CardTitle>API Key Authentication</CardTitle>
        <CardDescription>
          Configure JIRA access using API key authentication.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jira_url">JIRA URL</Label>
            <Input 
              id="jira_url"
              placeholder="https://your-domain.atlassian.net" 
              {...form.register('jira_url')} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="api_key">API Key</Label>
            <Input 
              id="api_key"
              type="password" 
              placeholder="Your JIRA API Key" 
              {...form.register('api_key')} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user_email">User Email</Label>
            <Input 
              id="user_email"
              type="email" 
              placeholder="your-email@example.com" 
              {...form.register('user_email')} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jql_filter">Default JQL Filter</Label>
            <Textarea 
              id="jql_filter"
              placeholder='project = "DEMO" AND status != Closed ORDER BY created DESC' 
              {...form.register('jql_filter')} 
            />
            <p className="text-sm text-muted-foreground">
              Enter a JQL query to filter which issues appear in the clone interface.
            </p>
          </div>
          <Button type="submit" className="w-full">Save API Key Configuration</Button>
        </form>
      </CardContent>
    </Card>
  );
}
