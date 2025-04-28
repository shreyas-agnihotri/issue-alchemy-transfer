import React, { useEffect, useState } from 'react';
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
  const [isValidating, setIsValidating] = useState(false);
  const [isAuthVerified, setIsAuthVerified] = useState(false);

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

  const validateCredentials = async (data: JiraApiKeyFormData) => {
    setIsValidating(true);
    try {
      const isValid = await jiraClient.testConnection({
        baseUrl: data.jira_url,
        auth: {
          type: 'api-key',
          apiKey: data.api_key,
          email: data.user_email
        }
      });

      if (isValid) {
        toast({
          title: "Credentials valid",
          description: "Successfully connected to JIRA"
        });
        return true;
      } else {
        toast({
          title: "Invalid credentials",
          description: "Could not connect to JIRA with provided credentials",
          variant: "destructive"
        });
        return false;
      }
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error.message || "Could not validate JIRA credentials",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleTestConnection = async () => {
    setIsValidating(true);
    try {
      const isValid = await jiraClient.validateCredentials();
      
      if (isValid) {
        setIsAuthVerified(true);
        toast({
          title: "Connection successful",
          description: "Successfully connected to JIRA"
        });
      } else {
        setIsAuthVerified(false);
        toast({
          title: "Connection failed",
          description: "Could not connect to JIRA with current credentials",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      setIsAuthVerified(false);
      toast({
        title: "Connection error",
        description: error.message || "Failed to connect to JIRA",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const onSubmit = async (data: JiraApiKeyFormData) => {
    const isValid = await validateCredentials(data);
    if (!isValid) return;

    try {
      await db_ops.saveJiraConfig({
        ...data,
        auth_method: 'api-key'
      });

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
          <div className="flex flex-col space-y-2">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isValidating}
            >
              {isValidating ? "Validating..." : "Save API Key Configuration"}
            </Button>
            
            <Button 
              type="button"
              variant="outline"
              className="w-full"
              disabled={isValidating}
              onClick={handleTestConnection}
            >
              {isValidating ? "Testing..." : "Test Connection"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
