
import React from 'react';
import { ArrowRightLeft } from 'lucide-react';
import JiraConfig from './JiraConfig';

const Header = () => {
  return (
    <header className="bg-jira-blue text-white py-4 px-6 flex items-center shadow-md">
      <div className="flex items-center gap-2">
        <ArrowRightLeft className="h-6 w-6" />
        <h1 className="text-xl font-medium">JIRA Deep Clone</h1>
      </div>
      <div className="ml-auto">
        <JiraConfig />
      </div>
    </header>
  );
};

export default Header;
