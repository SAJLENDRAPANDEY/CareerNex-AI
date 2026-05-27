import { mockProjects } from './mock-data';
import type { Project } from './types';

let projects: Project[] = [...mockProjects];

export type ProjectRepository = {
  listByOwner(ownerId: string): Promise<Project[]>;
  create(input: Omit<Project, 'id' | 'updatedAt'>): Promise<Project>;
};

export const mockProjectRepository: ProjectRepository = {
  async listByOwner(ownerId: string) {
    return projects.filter((project) => project.ownerId === ownerId);
  },
  async create(input) {
    const project: Project = {
      ...input,
      id: `proj-${Date.now()}`,
      updatedAt: 'Just now',
    };
    projects = [project, ...projects];
    return project;
  },
};

export const projectRepository: ProjectRepository = mockProjectRepository;

// Supabase/PostgreSQL migration point:
// Replace projectRepository with an implementation backed by Supabase or Drizzle
// while keeping the rest of the app dependent on the same ProjectRepository contract.
