
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JiraProject } from '@/types/jira';
import { useProjects } from '@/hooks/useProjects';

interface ProjectSelectorProps {
  selectedTargetProject: string;
  onTargetProjectChange: (value: string) => void;
  isLoading?: boolean;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  selectedTargetProject,
  onTargetProjectChange,
  isLoading: externalLoading = false,
}) => {
  const { projects, isLoading: projectsLoading } = useProjects();
  
  const isLoading = externalLoading || projectsLoading;
  const targetProjects = projects.filter(p => p.isProductDiscovery);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Target Project</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

export default ProjectSelector;
