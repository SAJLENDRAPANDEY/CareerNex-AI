"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";

type ResumeAnalysis = {
  atsScore?: number;
  score?: number;
  summary?: string;
  analysis?: string;
  strengths?: string[];
  improvements?: string[];
  missingKeywords?: string[];
  keywords?: string[];
  recommendations?: string[];
};

const acceptedTypes = ".pdf,.doc,.docx,.txt";

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
}

function normalizeList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  if (typeof value === "string" && value.trim()) return value.split(/\n|,|;/).map((item) => item.trim()).filter(Boolean);
  return [];
}

function normalizeAnalysis(payload: ResumeAnalysis): Required<ResumeAnalysis> {
  const score = Number(payload.atsScore ?? payload.score ?? 0);
  return {
    atsScore: Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0,
    score: Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0,
    summary: payload.summary || payload.analysis || "Resume analysis completed. Review the suggestions below to improve ATS readiness.",
    analysis: payload.analysis || payload.summary || "Resume analysis completed. Review the suggestions below to improve ATS readiness.",
    strengths: normalizeList(payload.strengths),
    improvements: normalizeList(payload.improvements),
    missingKeywords: normalizeList(payload.missingKeywords),
    keywords: normalizeList(payload.keywords),
    recommendations: normalizeList(payload.recommendations),
  };
}

export function ResumeAnalyzerInterface() {
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("Frontend Developer Intern");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [result, setResult] = useState<Required<ResumeAnalysis> | null>(null);

  const scoreColor = useMemo(() => {
    const score = result?.atsScore ?? 0;
    if (score >= 80) return "from-emerald-300 to-cyan-300";
    if (score >= 60) return "from-amber-300 to-orange-400";
    return "from-rose-300 to-pink-500";
  }, [result]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null;
    setError("");
    setToast("");
    setResult(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const maxBytes = 8 * 1024 * 1024;
    if (selectedFile.size > maxBytes) {
      setFile(null);
      setError("Please upload a resume smaller than 8MB.");
      return;
    }

    setFile(selectedFile);
    setToast(`${selectedFile.name} ready for analysis.`);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setError("Upload a resume file before running the analyzer.");
      return;
    }

    const apiBaseUrl = getApiBaseUrl();
    if (!apiBaseUrl) {
      setError("NEXT_PUBLIC_API_URL is not configured for the resume analyzer API.");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setToast("Analyzing resume with CareerNex AI...");

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("file", file);
    formData.append("targetRole", targetRole);
    formData.append("jobDescription", jobDescription);

    try {
      const response = await fetch(`${apiBaseUrl}/api/resume/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Resume analysis failed with status ${response.status}`);
      }

      const payload = (await response.json()) as ResumeAnalysis;
      const normalized = normalizeAnalysis(payload);
      setResult(normalized);
      setToast("Resume analysis complete.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to analyze this resume right now.";
      setError(message);
      setToast("");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#060816] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.20),transparent_32%),radial-gradient(circle_at_80%_15%,rgba(168,85,247,0.16),transparent_30%),linear-gradient(180deg,#07091a,#02030a)]" />
      <div className="relative mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-5 rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-7">
          <Link href="/dashboard" className="text-sm font-semibold text-cyan-200 transition hover:text-cyan-100">← Back to dashboard</Link>
          <div className="mt-4 grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100">AI Resume Analyzer</p>
              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Upload your resume and get an ATS readiness score.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">CareerNex AI checks match quality, missing keywords, strengths, and practical improvements for your target role.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
              <p className="text-sm text-slate-400">Supported files</p>
              <p className="mt-2 text-xl font-bold">PDF, DOC, DOCX, TXT</p>
              <p className="mt-2 text-sm text-slate-400">Maximum upload size: 8MB</p>
            </div>
          </div>
        </header>

        {toast && <div className="mb-4 rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">{toast}</div>}
        {error && <div className="mb-4 rounded-2xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100" role="alert">{error}</div>}

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-6">
            <label htmlFor="resume-upload" className="group grid cursor-pointer place-items-center rounded-3xl border border-dashed border-cyan-300/35 bg-slate-950/50 p-8 text-center transition hover:border-cyan-200/70 hover:bg-cyan-300/5">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-violet-400 text-2xl font-black text-slate-950 shadow-xl shadow-cyan-500/20">↑</span>
              <span className="mt-4 block text-lg font-bold">{file ? file.name : "Choose resume file"}</span>
              <span className="mt-2 block text-sm text-slate-400">Drop in your latest resume or click to browse.</span>
              <input id="resume-upload" type="file" accept={acceptedTypes} onChange={handleFileChange} className="sr-only" />
            </label>

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="target-role" className="text-sm font-semibold text-slate-200">Target role</label>
                <input id="target-role" value={targetRole} onChange={(event) => setTargetRole(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20" placeholder="e.g. Product Manager Intern" />
              </div>
              <div>
                <label htmlFor="job-description" className="text-sm font-semibold text-slate-200">Job description or keywords</label>
                <textarea id="job-description" value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} className="mt-2 min-h-32 w-full resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20" placeholder="Paste a role description or keywords to improve match accuracy..." />
              </div>
            </div>

            <button type="submit" disabled={isAnalyzing || !file} className="mt-5 w-full rounded-2xl bg-gradient-to-r from-cyan-300 to-violet-400 px-6 py-3 font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100">
              {isAnalyzing ? "Analyzing resume..." : "Analyze Resume"}
            </button>
          </form>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-6">
            {!result ? (
              <div className="grid min-h-[420px] place-items-center rounded-3xl border border-white/10 bg-slate-950/40 p-8 text-center">
                <div>
                  <p className="text-2xl font-black">No analysis yet</p>
                  <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">Upload your resume and run the analyzer to see your ATS score, strengths, missing keywords, and improvement plan.</p>
                </div>
              </div>
            ) : (
              <div>
                <div className="grid gap-4 sm:grid-cols-[220px_1fr] sm:items-center">
                  <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5 text-center">
                    <div className={`mx-auto grid h-36 w-36 place-items-center rounded-full bg-gradient-to-br ${scoreColor} p-1`}>
                      <div className="grid h-full w-full place-items-center rounded-full bg-slate-950">
                        <div>
                          <p className="text-4xl font-black">{result.atsScore}</p>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">ATS Score</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">Analysis summary</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{result.summary}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <ResultList title="Strengths" items={result.strengths} empty="Strong formatting and role alignment detected." tone="emerald" />
                  <ResultList title="Priority improvements" items={result.improvements.length ? result.improvements : result.recommendations} empty="No critical improvements returned by the analyzer." tone="cyan" />
                  <ResultList title="Missing keywords" items={result.missingKeywords} empty="No missing keywords found for this target." tone="amber" />
                  <ResultList title="Matched keywords" items={result.keywords} empty="Matched keywords will appear here after analysis." tone="violet" />
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function ResultList({ title, items, empty, tone }: { title: string; items: string[]; empty: string; tone: "emerald" | "cyan" | "amber" | "violet" }) {
  const dotColors = {
    emerald: "bg-emerald-300",
    cyan: "bg-cyan-300",
    amber: "bg-amber-300",
    violet: "bg-violet-300",
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-4">
      <h3 className="font-bold text-white">{title}</h3>
      <div className="mt-3 space-y-2">
        {(items.length ? items : [empty]).map((item) => (
          <p key={item} className="flex gap-3 rounded-2xl bg-white/[0.05] px-3 py-2 text-sm leading-6 text-slate-300">
            <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${dotColors[tone]}`} />
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}
