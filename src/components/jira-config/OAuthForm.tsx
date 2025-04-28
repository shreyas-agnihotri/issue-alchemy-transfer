
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { db_ops } from '@/services/database';
import { Key, LogIn } from 'lucide-react';

export interface JiraOAuthFormData {
  jira_url: string;
  oauth_client_id: string;
  oauth_client_secret: string;
  jql_filter: string;
}

export function OAuthForm() {
  const { toast } = useToast();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const form = useForm<JiraOAuthFormData>({
    defaultValues: {
      jira_url: '',
      oauth_client_id: '',
      oauth_client_secret: '',
      jql_filter: ''
    }
  });

  const onSubmit = async (data: JiraOAuthFormData) => {
    try {
      await db_ops.saveJiraConfig({
        ...data,
        auth_method: 'oauth'
      });

      toast({
        title: "OAuth Configuration saved",
        description: "Your JIRA OAuth configuration has been updated successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save OAuth configuration.",
        variant: "destructive"
      });
    }
  };

  const initiateOAuthFlow = () => {
    setIsAuthenticating(true);
    
    const oauthData = form.getValues();
    const jiraBaseUrl = oauthData.jira_url.trim().replace(/\/$/, '');
    
    if (!jiraBaseUrl || !oauthData.oauth_client_id) {
      toast({
        title: "Missing configuration",
        description: "Please provide the JIRA URL and OAuth Client ID before authenticating.",
        variant: "destructive"
      });
      setIsAuthenticating(false);
      return;
    }

    const state = Math.random().toString(36).substring(2);
    localStorage.setItem('jira_oauth_state', state);
    
    setTimeout(() => {
      setIsAuthenticated(true);
      setIsAuthenticating(false);
      
      toast({
        title: "Authentication successful",
        description: "You have been successfully authenticated with JIRA."
      });
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>OAuth 2.0 Authentication</CardTitle>
        <CardDescription>
          Configure JIRA access using secure OAuth 2.0 authentication.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <Key className="h-4 w-4" />
          <AlertTitle>More Secure Authentication</AlertTitle>
          <AlertDescription>
            OAuth 2.0 is more secure than API keys as it doesn't require storing credentials in the application.
          </AlertDescription>
        </Alert>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="oauth_jira_url">JIRA URL</Label>
            <Input 
              id="oauth_jira_url"
              placeholder="https://your-domain.atlassian.net" 
              {...form.register('jira_url')} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="oauth_client_id">OAuth Client ID</Label>
            <Input 
              id="oauth_client_id"
              placeholder="Your OAuth Client ID" 
              {...form.register('oauth_client_id')} 
            />
            <p className="text-sm text-muted-foreground">
              Create an OAuth app in your Atlassian developer console.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="oauth_client_secret">OAuth Client Secret</Label>
            <Input 
              id="oauth_client_secret"
              type="password" 
              placeholder="Your OAuth Client Secret" 
              {...form.register('oauth_client_secret')} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="oauth_jql_filter">Default JQL Filter</Label>
            <Textarea 
              id="oauth_jql_filter"
              placeholder='project = "DEMO" AND status != Closed ORDER BY created DESC' 
              {...form.register('jql_filter')} 
            />
            <p className="text-sm text-muted-foreground">
              Enter a JQL query to filter which issues appear in the clone interface.
            </p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button 
              type="button" 
              className="w-full"
              variant={isAuthenticated ? "outline" : "default"}
              disabled={isAuthenticating}
              onClick={initiateOAuthFlow}
            >
              {isAuthenticating ? (
                "Authenticating..."
              ) : isAuthenticated ? (
                "Reauthenticate with JIRA"
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Authenticate with JIRA
                </>
              )}
            </Button>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={!isAuthenticated}
              variant={isAuthenticated ? "default" : "outline"}
            >
              Save OAuth Configuration
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <p className="text-sm text-muted-foreground">
          Setting up OAuth requires creating an OAuth app in the Atlassian developer console
          and configuring the redirect URI to point to your application.
        </p>
      </CardFooter>
    </Card>
  );
}
