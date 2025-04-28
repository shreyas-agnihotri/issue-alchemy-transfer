
import { useEffect, useState } from 'react';
import { db_ops } from '@/services/database';
import { jiraClient } from '@/services/jira-api/jira-client';
import { useToast } from '@/hooks/use-toast';

export const useJiraConfig = () => {
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [hasConfigError, setHasConfigError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadJiraConfig = async () => {
      try {
        const config = await db_ops.getJiraConfig();
        
        if (config) {
          try {
            jiraClient.setConfig({
              baseUrl: config.jira_url,
              auth: {
                type: 'api-key',
                apiKey: config.api_key!,
                email: config.user_email!
              }
            });
            
            console.log('Loaded Jira configuration from database');
            setHasConfigError(false);
          } catch (error) {
            console.error('Error setting Jira configuration:', error);
            setHasConfigError(true);
            toast({
              title: "Configuration Error",
              description: "There was a problem with your Jira configuration. Please check your settings.",
              variant: "destructive"
            });
          }
        }
        
        setIsConfigLoaded(true);
      } catch (error) {
        console.error('Error loading Jira configuration:', error);
        setIsConfigLoaded(true);
        setHasConfigError(true);
      }
    };

    loadJiraConfig();
  }, [toast]);
  
  return { isConfigLoaded, hasConfigError };
};
