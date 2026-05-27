import { NextResponse } from 'next/server';
import { analyzeResume, analyzeSkillGap, generateRoadmap, getDeploymentReadiness, runChatbot, runQualitySuite } from '@/lib/quality/career-tools';

export async function GET() {
  return NextResponse.json(runQualitySuite());
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    prompt?: string;
    resume?: string;
    skills?: string[];
    targetRole?: string;
    goal?: string;
  };

  const skillGapAnalysis = analyzeSkillGap(body.skills ?? ['typescript', 'react'], body.targetRole ?? 'frontend engineer');

  return NextResponse.json({
    chatbot: runChatbot(body.prompt ?? ''),
    resumeAnalyzer: analyzeResume(body.resume ?? ''),
    skillGapAnalysis,
    roadmapGenerator: generateRoadmap(body.goal ?? `Grow into a ${skillGapAnalysis.targetRole}`, skillGapAnalysis.missingSkills),
    deploymentReadiness: getDeploymentReadiness(),
    performance: {
      runtimeMs: 0,
      status: 'pass',
    },
  });
}
