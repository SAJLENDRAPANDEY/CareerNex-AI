import type { AiPlan, Project } from './types';

type AiPrompt = {
  idea: string;
  projects: Project[];
};

export type AiProvider = {
  generatePlan(prompt: AiPrompt): Promise<AiPlan>;
};

const mockProvider: AiProvider = {
  async generatePlan({ idea, projects }) {
    const normalizedIdea = idea.trim() || 'a polished product experience';
    const relatedProject = projects[0]?.title ?? 'your current roadmap';

    return {
      headline: `Mock AI plan for ${normalizedIdea}`,
      summary: `Start by turning “${normalizedIdea}” into a focused Next.js product slice, then connect persistence and real model providers when requirements are validated. This recommendation references ${relatedProject} as the nearest existing workstream.`,
      steps: [
        'Define the primary user, success metric, and first workflow.',
        'Model the core entities behind a repository interface so Supabase/PostgreSQL can be added without rewrites.',
        'Ship a mock-auth prototype using route handlers and cookies for fast validation.',
        'Add provider credentials later and swap the mock AI provider for a production implementation.',
      ],
      risks: [
        'Overbuilding persistence before the data model stabilizes.',
        'Adding AI provider coupling directly inside UI components.',
        'Skipping route-level auth checks when replacing mock users.',
      ],
      suggestedStack: ['Next.js 15', 'TypeScript', 'Route Handlers', 'Supabase/PostgreSQL-ready repository', 'Provider-ready AI helper'],
    };
  },
};

export function getAiProvider(): AiProvider {
  // Provider-ready seam: return an OpenAI/Anthropic/Supabase Edge provider here
  // once real credentials are supplied through secure environment variables.
  return mockProvider;
}
