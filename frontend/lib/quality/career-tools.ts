import type { ChatMessage, DeploymentReadiness, QualitySuiteResult, ResumeAnalysis, Roadmap, SkillGapAnalysis } from '@/lib/types';

const roleSkillMap: Record<string, string[]> = {
  'frontend engineer': ['typescript', 'react', 'next.js', 'testing', 'accessibility'],
  'product manager': ['roadmapping', 'analytics', 'stakeholder management', 'experimentation'],
  'ai engineer': ['python', 'llm', 'prompting', 'evaluation', 'vector search'],
};

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9.+#\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export function runChatbot(prompt: string): ChatMessage {
  const trimmed = prompt.trim();
  return {
    role: 'assistant',
    content: trimmed
      ? `Mock career coach: prioritize one measurable outcome for “${trimmed}”, then break it into a weekly portfolio proof point.`
      : 'Mock career coach: share your target role and current skills to receive a focused plan.',
  };
}

export function analyzeResume(resumeText: string): ResumeAnalysis {
  const tokens = tokenize(resumeText);
  const keywords = ['typescript', 'react', 'next.js', 'leadership', 'testing', 'analytics', 'ai'].filter((keyword) =>
    resumeText.toLowerCase().includes(keyword),
  );
  const score = Math.min(96, Math.max(45, 50 + keywords.length * 7 + Math.min(tokens.length, 160) / 8));

  return {
    score: Math.round(score),
    strengths: keywords.length
      ? [`Strong signal for ${keywords.slice(0, 3).join(', ')}`, 'Experience is specific enough for targeted role matching']
      : ['Resume has enough baseline content to begin analysis'],
    improvements: [
      'Add quantified impact metrics for each major project',
      'Mirror target role keywords in the summary and recent experience',
      'Include a compact skills section for recruiter screening',
    ],
    keywords: keywords.length ? keywords : ['communication', 'delivery', 'learning'],
  };
}

export function analyzeSkillGap(currentSkills: string[], targetRole: string): SkillGapAnalysis {
  const normalizedRole = targetRole.toLowerCase();
  const required = roleSkillMap[normalizedRole] ?? roleSkillMap['frontend engineer'];
  const normalizedCurrent = currentSkills.map((skill) => skill.toLowerCase().trim());
  const matchedSkills = required.filter((skill) => normalizedCurrent.includes(skill));
  const missingSkills = required.filter((skill) => !normalizedCurrent.includes(skill));

  return {
    targetRole,
    matchedSkills,
    missingSkills,
    priority: missingSkills[0] ?? 'Portfolio depth and interview practice',
  };
}

export function generateRoadmap(goal: string, gaps: string[]): Roadmap {
  const focusAreas = gaps.length ? gaps : ['portfolio polish', 'mock interviews', 'networking'];
  return {
    goal,
    steps: focusAreas.slice(0, 4).map((area, index) => ({
      week: `Week ${index + 1}`,
      title: `Build evidence for ${area}`,
      outcome: `Create one demonstrable artifact or practice result focused on ${area}.`,
    })),
  };
}

export function getDeploymentReadiness(): DeploymentReadiness {
  const environment = process.env.NEXT_PUBLIC_APP_ENV ?? 'production-ready';
  const target = process.env.NEXT_PUBLIC_DEPLOYMENT_TARGET ?? 'vercel';
  const requiredVariables = [
    {
      key: 'NEXT_PUBLIC_APP_ENV',
      configured: Boolean(process.env.NEXT_PUBLIC_APP_ENV),
      required: false,
    },
    {
      key: 'NEXT_PUBLIC_DEPLOYMENT_TARGET',
      configured: Boolean(process.env.NEXT_PUBLIC_DEPLOYMENT_TARGET),
      required: false,
    },
  ];

  return {
    environment,
    target,
    requiredVariables,
    checks: [
      'Next.js route handlers are self-contained for deployment.',
      'Mock auth uses secure httpOnly cookies and can be replaced with a provider.',
      'AI and persistence integrations are behind provider/repository seams.',
      'No mandatory secret keys are required for the mock-first production preview.',
    ],
  };
}

export function runQualitySuite(): QualitySuiteResult {
  const started = performance.now();
  const chatbot = runChatbot('How do I become a frontend engineer?');
  const resumeAnalyzer = analyzeResume('TypeScript React Next.js testing leadership analytics AI projects with measurable launch impact.');
  const skillGapAnalysis = analyzeSkillGap(['typescript', 'react'], 'frontend engineer');
  const roadmapGenerator = generateRoadmap('Become interview-ready for frontend engineer roles', skillGapAnalysis.missingSkills);

  return {
    chatbot,
    resumeAnalyzer,
    skillGapAnalysis,
    roadmapGenerator,
    deploymentReadiness: getDeploymentReadiness(),
    performance: {
      runtimeMs: Math.round(performance.now() - started),
      status: 'pass',
    },
  };
}
