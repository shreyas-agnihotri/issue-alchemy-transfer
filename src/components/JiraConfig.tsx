
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Settings, Key, LogIn } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/use-toast';
import { db_ops } from '@/services/database';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';

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
                {/* Use regular form instead of Form component to avoid context issues */}
                <form onSubmit={apiKeyForm.handleSubmit(onApiKeySubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="jira_url">JIRA URL</Label>
                    <Input 
                      id="jira_url"
                      placeholder="https://your-domain.atlassian.net" 
                      {...apiKeyForm.register('jira_url')} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="api_key">API Key</Label>
                    <Input 
                      id="api_key"
                      type="password" 
                      placeholder="Your JIRA API Key" 
                      {...apiKeyForm.register('api_key')} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user_email">User Email</Label>
                    <Input 
                      id="user_email"
                      type="email" 
                      placeholder="your-email@example.com" 
                      {...apiKeyForm.register('user_email')} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jql_filter">Default JQL Filter</Label>
                    <Textarea 
                      id="jql_filter"
                      placeholder='project = "DEMO" AND status != Closed ORDER BY created DESC' 
                      {...apiKeyForm.register('jql_filter')} 
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter a JQL query to filter which issues appear in the clone interface.
                    </p>
                  </div>
                  <Button type="submit" className="w-full">Save API Key Configuration</Button>
                </form>
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
                
                {/* Use regular form instead of Form component to avoid context issues */}
                <form onSubmit={oauthForm.handleSubmit(onOAuthSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="oauth_jira_url">JIRA URL</Label>
                    <Input 
                      id="oauth_jira_url"
                      placeholder="https://your-domain.atlassian.net" 
                      {...oauthForm.register('jira_url')} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="oauth_client_id">OAuth Client ID</Label>
                    <Input 
                      id="oauth_client_id"
                      placeholder="Your OAuth Client ID" 
                      {...oauthForm.register('oauth_client_id')} 
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
                      {...oauthForm.register('oauth_client_secret')} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="oauth_jql_filter">Default JQL Filter</Label>
                    <Textarea 
                      id="oauth_jql_filter"
                      placeholder='project = "DEMO" AND status != Closed ORDER BY created DESC' 
                      {...oauthForm.register('jql_filter')} 
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
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default JiraConfig;
