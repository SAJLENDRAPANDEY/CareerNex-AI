# Implementation Plan: Cohort

## Overview
Build **Cohort** as a fresh Next.js 15 + TypeScript application in `/workspace/frontend` using App Router, Tailwind CSS, dark premium responsive UI, reusable components, API routes, cookie-based mock authentication, provider-ready AI helpers with mock fallback, and Supabase/PostgreSQL-ready data abstractions backed by mock data for now.

## Key Files to Change
- `/workspace/frontend/package.json` — ensure Next.js 15, TypeScript, Tailwind, icons, charts, and scripts are aligned.
- `/workspace/frontend/app/layout.tsx` — root metadata, fonts, dark shell, global providers.
- `/workspace/frontend/app/globals.css` — Tailwind base, dark theme tokens, gradients, animations.
- `/workspace/frontend/app/page.tsx` — animated landing page for Cohort.
- `/workspace/frontend/app/login/page.tsx` and `/workspace/frontend/app/register/page.tsx` — auth pages.
- `/workspace/frontend/app/dashboard/page.tsx` — student analytics and progress dashboard.
- `/workspace/frontend/app/chatbot/page.tsx` — AI career guidance chatbot.
- `/workspace/frontend/app/resume/page.tsx` — resume analyzer.
- `/workspace/frontend/app/skills/page.tsx` — skill gap analysis.
- `/workspace/frontend/app/roadmap/page.tsx` — personalized learning roadmap.
- `/workspace/frontend/app/community/page.tsx` — cohort learning groups.
- `/workspace/frontend/app/admin/page.tsx` — role-gated admin analytics.
- `/workspace/frontend/app/profile/page.tsx` — achievements, streaks, profile overview.
- `/workspace/frontend/app/api/**/route.ts` — auth, AI chat, resume, skills, roadmap, community, admin, and profile API handlers.
- `/workspace/frontend/components/*` — sidebar, navbar, cards, chart widgets, forms, chat UI, progress bars, badges, tables.
- `/workspace/frontend/lib/*` — auth/session helpers, mock data, AI service, validation, types, database adapter interfaces.

## Main Implementation Steps
1. **Create fresh app structure**
   - Standardize `/workspace/frontend` as the Next.js 15 TypeScript App Router project.
   - Configure Tailwind and global dark design tokens.

2. **Build visual foundation**
   - Implement premium dark UI with gradient cards, glass panels, responsive layout, sidebar navigation, and smooth CSS animations.
   - Add shared components for stat cards, progress bars, charts, page headers, empty states, and CTA buttons.

3. **Implement authentication**
   - Add login and register pages.
   - Use Next.js API routes with secure cookie-based mock sessions.
   - Support `student` and `admin` roles and protect app/admin pages accordingly.

4. **Create data layer**
   - Define TypeScript types for users, profiles, achievements, roadmaps, cohorts, resumes, skills, messages, and analytics.
   - Add Supabase/PostgreSQL-ready repository interfaces while using typed mock data in the first version.

5. **Implement AI service layer**
   - Create a centralized AI helper that can call a configured provider when an API key exists.
   - Provide deterministic mock fallback responses for chatbot, resume feedback, skill gaps, and roadmap generation.

6. **Build main pages**
   - Landing page with startup-style hero, feature sections, animations, testimonials/stats, and CTA.
   - Dashboard with career progress, streaks, roadmap completion, skill readiness, resume score, and recent activity.
   - Chatbot with conversational UI and career guidance suggestions.
   - Resume analyzer with paste/upload-style input and AI feedback sections.
   - Skill analysis with target role comparison and priority gaps.
   - Roadmap generator with milestones, projects, resources, and completion tracking.
   - Community page with cohort cards, discussions, study rooms, and member progress.
   - Profile page with user info, achievements, streaks, and learning stats.
   - Admin panel with user metrics, popular paths, AI usage, activity, and management tables.

7. **Add API routes**
   - `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, `/api/auth/me`.
   - `/api/ai/chat`, `/api/resume/analyze`, `/api/skills/analyze`, `/api/roadmap/generate`.
   - `/api/community`, `/api/profile`, `/api/admin/analytics`.

8. **Quality pass**
   - Keep all implementation TypeScript and Next.js-only.
   - Ensure responsive mobile layouts, accessible labels, loading/error states, and clean folder structure.
   - Avoid Python/FastAPI changes and avoid hard database requirements until Supabase/PostgreSQL credentials are provided.
