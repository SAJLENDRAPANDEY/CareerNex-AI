export type UserRole = 'founder' | 'designer' | 'developer';

export type MockUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type ProjectStatus = 'Discovery' | 'Prototype' | 'Build' | 'Launch';

export type Project = {
  id: string;
  ownerId: string;
  title: string;
  summary: string;
  status: ProjectStatus;
  progress: number;
  updatedAt: string;
  stack: string[];
  nextMilestone: string;
};

export type AiPlan = {
  headline: string;
  summary: string;
  steps: string[];
  risks: string[];
  suggestedStack: string[];
};

export type LoginResponse = {
  user: MockUser;
};

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ResumeAnalysis = {
  score: number;
  strengths: string[];
  improvements: string[];
  keywords: string[];
};

export type SkillGapAnalysis = {
  targetRole: string;
  matchedSkills: string[];
  missingSkills: string[];
  priority: string;
};

export type RoadmapStep = {
  week: string;
  title: string;
  outcome: string;
};

export type Roadmap = {
  goal: string;
  steps: RoadmapStep[];
};

export type DeploymentReadiness = {
  environment: string;
  target: string;
  requiredVariables: Array<{
    key: string;
    configured: boolean;
    required: boolean;
  }>;
  checks: string[];
};

export type QualitySuiteResult = {
  chatbot: ChatMessage;
  resumeAnalyzer: ResumeAnalysis;
  skillGapAnalysis: SkillGapAnalysis;
  roadmapGenerator: Roadmap;
  deploymentReadiness?: DeploymentReadiness;
  performance: {
    runtimeMs: number;
    status: 'pass';
  };
};

export type DashboardPayload = {
  user: MockUser;
  projects: Project[];
};
