import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { projectRepository } from '@/lib/data-store';
import type { ProjectStatus } from '@/lib/types';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const projects = await projectRepository.listByOwner(user.id);
  return NextResponse.json({ user, projects });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    title?: string;
    summary?: string;
    status?: ProjectStatus;
  };

  if (!body.title || !body.summary) {
    return NextResponse.json({ error: 'Title and summary are required.' }, { status: 400 });
  }

  const project = await projectRepository.create({
    ownerId: user.id,
    title: body.title,
    summary: body.summary,
    status: body.status ?? 'Discovery',
    progress: 10,
    stack: ['Next.js', 'Mock repository', 'Supabase-ready'],
    nextMilestone: 'Review and prioritize the first product slice',
  });

  return NextResponse.json({ project }, { status: 201 });
}
