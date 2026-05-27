"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { AiPlan, DashboardPayload, MockUser, Project, QualitySuiteResult } from "@/lib/types";

type RequestState = "idle" | "loading" | "error";

const fallbackUser: MockUser = {
  id: "user-fallback",
  name: "Product Lead",
  email: "lead@example.com",
  role: "founder",
};

export function StudioDashboard() {
  const [user, setUser] = useState<MockUser>(fallbackUser);
  const [projects, setProjects] = useState<Project[]>([]);
  const [requestState, setRequestState] = useState<RequestState>("loading");
  const [email, setEmail] = useState("ava@prettiflow.dev");
  const [newTitle, setNewTitle] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [idea, setIdea] = useState("AI workspace for validating startup feature briefs");
  const [plan, setPlan] = useState<AiPlan | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [qualityResult, setQualityResult] = useState<QualitySuiteResult | null>(null);
  const [qualityLoading, setQualityLoading] = useState(false);

  async function loadDashboard() {
    setRequestState("loading");
    try {
      const response = await fetch("/api/projects");
      if (!response.ok) throw new Error("Unable to load dashboard");
      const payload = (await response.json()) as DashboardPayload;
      setUser(payload.user);
      setProjects(payload.projects);
      setRequestState("idle");
    } catch {
      setRequestState("error");
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const averageProgress = useMemo(() => {
    if (!projects.length) return 0;
    return Math.round(projects.reduce((total, project) => total + project.progress, 0) / projects.length);
  }, [projects]);

  async function handleLogin() {
    setRequestState("loading");
    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    await loadDashboard();
  }

  async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newTitle.trim() || !newSummary.trim()) return;

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, summary: newSummary }),
    });

    if (response.ok) {
      setNewTitle("");
      setNewSummary("");
      await loadDashboard();
    }
  }

  async function handleGeneratePlan() {
    setAiLoading(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      if (!response.ok) throw new Error("AI helper unavailable");
      const payload = (await response.json()) as { plan: AiPlan };
      setPlan(payload.plan);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleRunQualitySuite() {
    setQualityLoading(true);
    try {
      const response = await fetch("/api/quality-suite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Help me become a frontend engineer",
          resume: "TypeScript React Next.js testing leadership analytics projects with measurable launch impact.",
          skills: ["typescript", "react"],
          targetRole: "frontend engineer",
          goal: "Become interview-ready for frontend engineer roles",
        }),
      });
      if (!response.ok) throw new Error("Quality suite unavailable");
      setQualityResult((await response.json()) as QualitySuiteResult);
    } finally {
      setQualityLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 lg:px-10">
        <header className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-600/25 via-slate-900 to-cyan-500/10 p-8 shadow-2xl shadow-cyan-950/30">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-4 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100">
                Next.js 15 · TypeScript · Mock auth · Provider-ready AI
              </p>
              <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                PrettiFlow product studio for implementation-ready planning.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                A polished Next.js app with route-handler authentication, cookie-backed mock users, Supabase/PostgreSQL-ready repository abstractions, and an AI helper that safely falls back to mock output.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Signed in as</p>
              <p className="mt-2 text-2xl font-semibold">{user.name}</p>
              <p className="text-slate-300">{user.email}</p>
              <div className="mt-4 flex gap-2">
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="min-w-0 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none ring-cyan-300/40 focus:ring-2"
                  aria-label="Mock user email"
                />
                <button onClick={handleLogin} className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-200">
                  Switch
                </button>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            ["Active projects", projects.length.toString()],
            ["Avg progress", `${averageProgress}%`],
            ["Persistence", "Mock now · DB-ready"],
            ["Deploy target", process.env.NEXT_PUBLIC_DEPLOYMENT_TARGET ?? "vercel"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.06] p-6">
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-2 text-3xl font-bold">{value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Project pipeline</h2>
                <p className="text-slate-400">Loaded through Next.js API routes using mock repository data.</p>
              </div>
              {requestState === "loading" ? <span className="text-sm text-cyan-200">Syncing…</span> : null}
            </div>
            {requestState === "error" ? (
              <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-red-100">Could not load projects.</div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <article key={project.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-sm font-medium text-cyan-200">{project.status}</p>
                        <h3 className="mt-1 text-xl font-semibold">{project.title}</h3>
                        <p className="mt-2 text-slate-300">{project.summary}</p>
                      </div>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300">{project.updatedAt}</span>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-400" style={{ width: `${project.progress}%` }} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.stack.map((item) => (
                        <span key={item} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">{item}</span>
                      ))}
                    </div>
                    <p className="mt-4 text-sm text-slate-400">Next milestone: {project.nextMilestone}</p>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-8">
            <form onSubmit={handleCreateProject} className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
              <h2 className="text-2xl font-semibold">Create mock project</h2>
              <p className="mt-2 text-sm text-slate-400">Persists in the route-handler repository during the running session and can be swapped for Supabase/PostgreSQL.</p>
              <input
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                placeholder="Project title"
                className="mt-5 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none ring-cyan-300/40 focus:ring-2"
              />
              <textarea
                value={newSummary}
                onChange={(event) => setNewSummary(event.target.value)}
                placeholder="Short product summary"
                rows={4}
                className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none ring-cyan-300/40 focus:ring-2"
              />
              <button className="mt-4 w-full rounded-2xl bg-white px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-100">
                Add to pipeline
              </button>
            </form>

            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-6">
              <h2 className="text-2xl font-semibold">AI planning helper</h2>
              <p className="mt-2 text-sm text-cyan-100/80">Provider-ready abstraction with mock fallback, so no secret keys are required for the first version.</p>
              <textarea
                value={idea}
                onChange={(event) => setIdea(event.target.value)}
                rows={4}
                className="mt-5 w-full rounded-2xl border border-cyan-200/20 bg-slate-950/80 px-4 py-3 text-white outline-none ring-cyan-300/40 focus:ring-2"
              />
              <button onClick={handleGeneratePlan} className="mt-4 w-full rounded-2xl bg-cyan-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-200">
                {aiLoading ? "Generating mock plan…" : "Generate provider-ready plan"}
              </button>
              {plan ? (
                <div className="mt-5 rounded-2xl bg-slate-950/70 p-5">
                  <h3 className="text-lg font-semibold">{plan.headline}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{plan.summary}</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="font-semibold text-cyan-100">Steps</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
                        {plan.steps.map((step) => <li key={step}>{step}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-cyan-100">Risks</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
                        {plan.risks.map((risk) => <li key={risk}>{risk}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">Comprehensive testing suite</h2>
                  <p className="mt-2 text-sm text-emerald-100/80">
                    Exercises chatbot, resume analyzer, skill gap analysis, roadmap generation, and performance status through a dedicated API route.
                  </p>
                </div>
                <span className="rounded-full bg-emerald-300/20 px-3 py-1 text-xs font-semibold text-emerald-100">QA</span>
              </div>
              <button onClick={handleRunQualitySuite} className="mt-5 w-full rounded-2xl bg-emerald-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-emerald-200">
                {qualityLoading ? "Running checks…" : "Run core feature test"}
              </button>
              {qualityResult ? (
                <div className="mt-5 space-y-4 rounded-2xl bg-slate-950/70 p-5">
                  <div className="flex items-center justify-between rounded-xl bg-emerald-300/10 px-4 py-3">
                    <span className="font-semibold text-emerald-100">Performance</span>
                    <span className="text-sm text-emerald-100">{qualityResult.performance.status.toUpperCase()} · {qualityResult.performance.runtimeMs}ms</span>
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-100">Chatbot</p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">{qualityResult.chatbot.content}</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-white/10 p-4">
                      <p className="font-semibold text-emerald-100">Resume analyzer</p>
                      <p className="mt-1 text-sm text-slate-300">Score: {qualityResult.resumeAnalyzer.score}/100</p>
                      <p className="mt-2 text-xs text-slate-400">Keywords: {qualityResult.resumeAnalyzer.keywords.join(", ")}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 p-4">
                      <p className="font-semibold text-emerald-100">Skill gaps</p>
                      <p className="mt-1 text-sm text-slate-300">Priority: {qualityResult.skillGapAnalysis.priority}</p>
                      <p className="mt-2 text-xs text-slate-400">Missing: {qualityResult.skillGapAnalysis.missingSkills.join(", ") || "None"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-100">Roadmap generator</p>
                    <ol className="mt-2 space-y-2 text-sm text-slate-300">
                      {qualityResult.roadmapGenerator.steps.map((step) => (
                        <li key={step.week} className="rounded-xl bg-white/5 px-3 py-2">
                          <span className="font-semibold">{step.week}: {step.title}</span> — {step.outcome}
                        </li>
                      ))}
                    </ol>
                  </div>
                  {qualityResult.deploymentReadiness ? (
                    <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-4">
                      <p className="font-semibold text-emerald-100">Deployment readiness</p>
                      <p className="mt-1 text-sm text-slate-300">
                        Target: {qualityResult.deploymentReadiness.target} · Env: {qualityResult.deploymentReadiness.environment}
                      </p>
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-400">
                        {qualityResult.deploymentReadiness.checks.map((check) => <li key={check}>{check}</li>)}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
