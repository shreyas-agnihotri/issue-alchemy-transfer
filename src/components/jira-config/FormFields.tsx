
import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { JiraApiKeyFormData } from './types';

interface FormFieldsProps {
  register: UseFormRegister<JiraApiKeyFormData>;
}

export function FormFields({ register }: FormFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="jira_url">JIRA URL</Label>
        <Input 
          id="jira_url"
          placeholder="https://your-domain.atlassian.net" 
          {...register('jira_url', { required: true })} 
        />
        <p className="text-sm text-muted-foreground">
          Example: https://your-domain.atlassian.net (no trailing slash)
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="api_key">API Key</Label>
        <Input 
          id="api_key"
          type="password" 
          placeholder="Your JIRA API Key" 
          {...register('api_key', { required: true })} 
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="user_email">User Email</Label>
        <Input 
          id="user_email"
          type="email" 
          placeholder="your-email@example.com" 
          {...register('user_email', { required: true })} 
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="jql_filter">Default JQL Filter</Label>
        <Textarea 
          id="jql_filter"
          placeholder='project = "DEMO" AND status != Closed ORDER BY created DESC' 
          {...register('jql_filter')} 
        />
        <p className="text-sm text-muted-foreground">
          Enter a JQL query to filter which issues appear in the clone interface.
        </p>
      </div>
    </>
  );
}
