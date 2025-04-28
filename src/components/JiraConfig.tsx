
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiKeyForm } from './jira-config/ApiKeyForm';
import { OAuthForm } from './jira-config/OAuthForm';

const JiraConfig = () => {
  const [activeAuthMethod, setActiveAuthMethod] = useState<'api-key' | 'oauth'>('api-key');

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
            <ApiKeyForm />
          </TabsContent>
          
          <TabsContent value="oauth">
            <OAuthForm />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default JiraConfig;
