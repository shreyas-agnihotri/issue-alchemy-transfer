
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JiraProject } from '@/types/jira';

interface ProjectSelectorProps {
  projects: JiraProject[];
  selectedSourceProject: string;
  selectedTargetProject: string;
  onSourceProjectChange: (value: string) => void;
  onTargetProjectChange: (value: string) => void;
  isLoading?: boolean;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  selectedSourceProject,
  selectedTargetProject,
  onSourceProjectChange,
  onTargetProjectChange,
  isLoading = false,
}) => {
  const sourceProjects = projects.filter(p => !p.isProductDiscovery);
  const targetProjects = projects.filter(p => p.isProductDiscovery);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Projects</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="source-project" className="block text-sm font-medium text-jira-neutral-dark mb-2">
              Source Project
            </label>
            <Select
              disabled={isLoading}
              value={selectedSourceProject}
              onValueChange={onSourceProjectChange}
            >
              <SelectTrigger id="source-project" className="w-full">
                <SelectValue placeholder="Select source project" />
              </SelectTrigger>
              <SelectContent>
                {sourceProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.key} - {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-2 text-sm text-jira-neutral-medium">
              Select the JIRA project to clone issues from
            </p>
          </div>
          
          <div>
            <label htmlFor="target-project" className="block text-sm font-medium text-jira-neutral-dark mb-2">
              Target Project
            </label>
            <Select
              disabled={isLoading}
              value={selectedTargetProject}
              onValueChange={onTargetProjectChange}
            >
              <SelectTrigger id="target-project" className="w-full">
                <SelectValue placeholder="Select target project" />
              </SelectTrigger>
              <SelectContent>
                {targetProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.key} - {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-2 text-sm text-jira-neutral-medium">
              Select the Product Discovery project to clone issues to
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectSelector;
