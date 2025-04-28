
import { useEffect, useState } from 'react';
import { db_ops } from '@/services/database';
import { jiraClient } from '@/services/jira-api/jira-client';

export const useJiraConfig = () => {
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  useEffect(() => {
    const loadJiraConfig = async () => {
      try {
        // Get saved Jira config
        const config = await db_ops.getJiraConfig();
        
        if (config) {
          // Configure the Jira client with saved settings
          jiraClient.setConfig({
            baseUrl: config.jira_url,
            auth: config.auth_method === 'api-key' 
              ? {
                  type: 'api-key',
                  apiKey: config.api_key!,
                  email: config.user_email!
                }
              : {
                  type: 'oauth',
                  token: (await db_ops.getOAuthToken())?.access_token || ''
                }
          });
          
          console.log('Loaded Jira configuration from database');
        }
        
        setIsConfigLoaded(true);
      } catch (error) {
        console.error('Error loading Jira configuration:', error);
        setIsConfigLoaded(true); // Still mark as loaded even if there was an error
      }
    };

    loadJiraConfig();
  }, []);
  
  return { isConfigLoaded };
};
