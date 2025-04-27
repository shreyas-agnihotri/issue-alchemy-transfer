
import React from 'react';
import Header from '@/components/Header';

interface ClonePageLayoutProps {
  children: React.ReactNode;
}

const ClonePageLayout: React.FC<ClonePageLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-jira-neutral-light">
      <Header />
      <main className="flex-1 container max-w-5xl py-8 px-4">
        <div className="space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default ClonePageLayout;
