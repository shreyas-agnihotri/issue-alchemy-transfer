
import { useEffect, useState } from 'react';
import { db_ops } from '@/services/database';
import { jiraClient } from '@/services/jira-api/jira-client';

export const useJiraConfig = () => {
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  useEffect(() => {
    const loadJiraConfig = async () => {
      try {
        const config = await db_ops.getJiraConfig();
        
        if (config) {
          jiraClient.setConfig({
            baseUrl: config.jira_url,
            auth: {
              type: 'api-key',
              apiKey: config.api_key!,
              email: config.user_email!
            }
          });
          
          console.log('Loaded Jira configuration from database');
        }
        
        setIsConfigLoaded(true);
      } catch (error) {
        console.error('Error loading Jira configuration:', error);
        setIsConfigLoaded(true);
      }
    };

    loadJiraConfig();
  }, []);
  
  return { isConfigLoaded };
};
