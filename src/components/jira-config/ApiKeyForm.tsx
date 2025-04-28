
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { db_ops } from '@/services/database';
import { jiraClient } from '@/services/jira-api/jira-client';
import { ValidationDisplay } from './ValidationDisplay';
import { FormFields } from './FormFields';
import { FormActions } from './FormActions';
import { JiraApiKeyFormData } from './types';

export function ApiKeyForm() {
  const { toast } = useToast();
  const form = useForm<JiraApiKeyFormData>();
  const [isValidating, setIsValidating] = useState(false);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

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
    setAuthError(null);
    
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
        setIsAuthVerified(true);
        return true;
      }
      
      toast({
        title: "Invalid credentials",
        description: "Could not connect to JIRA with provided credentials",
        variant: "destructive"
      });
      setIsAuthVerified(false);
      return false;
    } catch (error: any) {
      let errorMessage = error.message || "Could not validate JIRA credentials";
      setAuthError(errorMessage);
      toast({
        title: "Connection failed",
        description: errorMessage,
        variant: "destructive"
      });
      setIsAuthVerified(false);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleTestConnection = async () => {
    setIsValidating(true);
    setAuthError(null);
    setIsAuthVerified(false); // Reset verification state when testing
    
    const formData = form.getValues();
    
    if (!formData.jira_url || !formData.api_key || !formData.user_email) {
      setAuthError("Please fill in all required fields (JIRA URL, API Key, and User Email)");
      setIsValidating(false);
      return;
    }
    
    try {
      // Remove trailing slashes from the URL
      formData.jira_url = formData.jira_url.trim().replace(/\/+$/, '');
      
      // Update the client configuration
      jiraClient.setConfig({
        baseUrl: formData.jira_url,
        auth: {
          type: 'api-key',
          apiKey: formData.api_key,
          email: formData.user_email
        }
      });
      
      await jiraClient.validateCredentials();
      setIsAuthVerified(true);
      toast({
        title: "Connection successful",
        description: "Successfully connected to JIRA"
      });
    } catch (error: any) {
      setIsAuthVerified(false);
      let errorMessage = error.message || "Failed to connect to JIRA";
      setAuthError(errorMessage);
      toast({
        title: "Connection error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const onSubmit = async (data: JiraApiKeyFormData) => {
    data.jira_url = data.jira_url.trim().replace(/\/+$/, '');
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
        <ValidationDisplay error={authError} />
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormFields register={form.register} />
          <FormActions 
            isValidating={isValidating}
            onTestConnection={handleTestConnection}
          />
        </form>
      </CardContent>
    </Card>
  );
}
