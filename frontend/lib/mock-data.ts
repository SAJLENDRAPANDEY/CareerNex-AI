import type { MockUser, Project } from './types';

export const mockUsers: MockUser[] = [
  {
    id: 'user-ava',
    name: 'Ava Morgan',
    email: 'ava@prettiflow.dev',
    role: 'founder',
  },
  {
    id: 'user-rio',
    name: 'Rio Chen',
    email: 'rio@prettiflow.dev',
    role: 'developer',
  },
];

export const mockProjects: Project[] = [
  {
    id: 'proj-briefcraft',
    ownerId: 'user-ava',
    title: 'BriefCraft AI',
    summary: 'Transforms rough startup notes into implementation-ready feature briefs.',
    status: 'Prototype',
    progress: 58,
    updatedAt: 'Today',
    stack: ['Next.js', 'Supabase-ready', 'AI helper'],
    nextMilestone: 'Validate onboarding flow with 5 test users',
  },
  {
    id: 'proj-launchboard',
    ownerId: 'user-ava',
    title: 'LaunchBoard',
    summary: 'A lightweight launch checklist and investor update dashboard.',
    status: 'Discovery',
    progress: 24,
    updatedAt: 'Yesterday',
    stack: ['Next.js', 'PostgreSQL-ready', 'Mock auth'],
    nextMilestone: 'Finalize database entities before Supabase connection',
  },
  {
    id: 'proj-designops',
    ownerId: 'user-rio',
    title: 'DesignOps Portal',
    summary: 'Internal tooling for component QA, approvals, and release notes.',
    status: 'Build',
    progress: 72,
    updatedAt: '2 days ago',
    stack: ['Next.js', 'Route handlers', 'Cookie auth'],
    nextMilestone: 'Ship mock-to-provider AI abstraction',
  },
];

export function getDefaultUser(): MockUser {
  return mockUsers[0];
}
