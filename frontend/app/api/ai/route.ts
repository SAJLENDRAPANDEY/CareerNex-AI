import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAiProvider } from '@/lib/ai-helper';
import { projectRepository } from '@/lib/data-store';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const body = (await request.json().catch(() => ({}))) as { idea?: string };
  const projects = await projectRepository.listByOwner(user.id);
  const plan = await getAiProvider().generatePlan({ idea: body.idea ?? '', projects });

  return NextResponse.json({ plan });
}
