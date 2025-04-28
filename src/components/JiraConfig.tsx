
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Settings, Key, LogIn } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/use-toast';
import { db_ops } from '@/services/database';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface JiraApiKeyFormData {
  jira_url: string;
  api_key: string;
  user_email: string;
  jql_filter: string;
}

interface JiraOAuthFormData {
  jira_url: string;
  oauth_client_id: string;
  oauth_client_secret: string;
  jql_filter: string;
}

const JiraConfig = () => {
  const { toast } = useToast();
  const [activeAuthMethod, setActiveAuthMethod] = useState<'api-key' | 'oauth'>('api-key');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Create separate form instances
  const apiKeyForm = useForm<JiraApiKeyFormData>({
    defaultValues: {
      jira_url: '',
      api_key: '',
      user_email: '',
      jql_filter: ''
    }
  });
  
  const oauthForm = useForm<JiraOAuthFormData>({
    defaultValues: {
      jira_url: '',
      oauth_client_id: '',
      oauth_client_secret: '',
      jql_filter: ''
    }
  });

  const onApiKeySubmit = async (data: JiraApiKeyFormData) => {
    try {
      // Store the API key configuration
      db_ops.saveJiraConfig({
        ...data,
        auth_method: 'api-key'
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

  const onOAuthSubmit = async (data: JiraOAuthFormData) => {
    try {
      // Store the OAuth configuration
      db_ops.saveJiraConfig({
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
    
    // In a real implementation, we would:
    // 1. Generate a random state parameter to prevent CSRF attacks
    // 2. Store this state in localStorage or sessionStorage
    // 3. Redirect to Atlassian authorization URL with required parameters

    const oauthData = oauthForm.getValues();
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

    // In a real electron app, we would handle the redirect differently
    // For the purpose of this demonstration, we'll simulate the authentication process
    
    setTimeout(() => {
      // Simulating successful authentication
      setIsAuthenticated(true);
      setIsAuthenticating(false);
      
      toast({
        title: "Authentication successful",
        description: "You have been successfully authenticated with JIRA."
      });
    }, 2000);

    // In a real application with Electron, we would use this approach:
    // const authUrl = `${jiraBaseUrl}/plugins/servlet/oauth/authorize?client_id=${oauthData.oauth_client_id}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=read:jira-work write:jira-work`;
    // require('electron').shell.openExternal(authUrl);
  };

  // Render each form with explicit Form context provided by Form component
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>JIRA Configuration</SheetTitle>
        </SheetHeader>
        
        <Tabs value={activeAuthMethod} onValueChange={(value) => setActiveAuthMethod(value as 'api-key' | 'oauth')} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="api-key">API Key</TabsTrigger>
            <TabsTrigger value="oauth">OAuth 2.0 (Recommended)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="api-key">
            <Card>
              <CardHeader>
                <CardTitle>API Key Authentication</CardTitle>
                <CardDescription>
                  Configure JIRA access using API key authentication.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Explicit Form context for API key form */}
                <Form {...apiKeyForm}>
                  <form onSubmit={apiKeyForm.handleSubmit(onApiKeySubmit)} className="space-y-4">
                    <FormField
                      control={apiKeyForm.control}
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
                      control={apiKeyForm.control}
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
                      control={apiKeyForm.control}
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
                      control={apiKeyForm.control}
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
                    <Button type="submit" className="w-full">Save API Key Configuration</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="oauth">
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
                
                {/* Explicit Form context for OAuth form */}
                <Form {...oauthForm}>
                  <form onSubmit={oauthForm.handleSubmit(onOAuthSubmit)} className="space-y-4">
                    <FormField
                      control={oauthForm.control}
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
                      control={oauthForm.control}
                      name="oauth_client_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>OAuth Client ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Your OAuth Client ID" {...field} />
                          </FormControl>
                          <FormDescription>
                            Create an OAuth app in your Atlassian developer console.
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={oauthForm.control}
                      name="oauth_client_secret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>OAuth Client Secret</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Your OAuth Client Secret" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={oauthForm.control}
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
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col items-start">
                <FormDescription>
                  Setting up OAuth requires creating an OAuth app in the Atlassian developer console
                  and configuring the redirect URI to point to your application.
                </FormDescription>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default JiraConfig;
