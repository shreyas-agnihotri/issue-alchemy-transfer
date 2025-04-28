import { useState, useEffect } from 'react';
import { jiraClient } from '@/services/jira-api/jira-client';
import { JiraProject } from '@/types/jira';
import { useToast } from './use-toast';
import { mockProjects } from '@/lib/mock-data';

export const useProjects = () => {
  const [projects, setProjects] = useState<JiraProject[]>(mockProjects);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      // This would be replaced with actual API call when implemented in jiraClient
      // For now we'll use a timeout to simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real implementation, we would make an API call like:
      // const response = await jiraClient.getProjects();
      // setProjects(response);
      
      // For now we're keeping the mock data as real API is not implemented
      // but setting it through the hook for easier future implementation
      setProjects(mockProjects);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Failed to load projects",
        description: error.message || "Could not retrieve projects from Jira",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return { projects, isLoading, fetchProjects };
};
