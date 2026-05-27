"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type NavIcon = "dashboard" | "coach" | "resume" | "skills" | "roadmaps" | "progress" | "community" | "profile" | "settings";

const navItems: { label: string; route: string; icon: NavIcon; hint: string }[] = [
  { label: "Dashboard", route: "/dashboard", icon: "dashboard", hint: "Career command center" },
  { label: "AI Career Coach", route: "/ai-coach", icon: "coach", hint: "Guidance chat" },
  { label: "Resume Analyzer", route: "/resume-analyzer", icon: "resume", hint: "ATS scoring" },
  { label: "Skill Gap Analysis", route: "/skill-gap-analysis", icon: "skills", hint: "Missing skills" },
  { label: "Learning Roadmaps", route: "/roadmaps", icon: "roadmaps", hint: "Weekly plans" },
  { label: "Progress Tracking", route: "/progress", icon: "progress", hint: "Analytics" },
  { label: "Community", route: "/community", icon: "community", hint: "Peer network" },
  { label: "Profile", route: "/profile", icon: "profile", hint: "Career identity" },
  { label: "Settings", route: "/profile", icon: "settings", hint: "Preferences" },
];

function NavIcon({ name }: { name: NavIcon }) {
  const common = "h-5 w-5";
  const icons: Record<NavIcon, JSX.Element> = {
    dashboard: <path d="M3 12.5 12 4l9 8.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-7.5Z" />,
    coach: <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v7A2.5 2.5 0 0 1 17.5 15H12l-4.5 4v-4h-1A2.5 2.5 0 0 1 4 12.5v-7Z" />,
    resume: <path d="M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm7 1v4h4M8 12h8M8 16h6" />,
    skills: <path d="M12 3 4 7v6c0 4.5 3.4 7.4 8 8 4.6-.6 8-3.5 8-8V7l-8-4Zm-3 9 2 2 4-5" />,
    roadmaps: <path d="M5 5h4v4H5V5Zm10 0h4v4h-4V5ZM5 15h4v4H5v-4Zm6-8h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 0-2 2v2" />,
    progress: <path d="M4 19V5m0 14h16M8 16v-5m4 5V8m4 8v-9" />,
    community: <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20a5 5 0 0 1 10 0M11 20a5 5 0 0 1 10 0" />,
    profile: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0" />,
    settings: <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v3m0 12v3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1M3 12h3m12 0h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />,
  };

  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icons[name]}
    </svg>
  );
}

const skills = [
  { name: "React + Next.js", value: 86, color: "from-cyan-300 to-blue-500" },
  { name: "Interview readiness", value: 68, color: "from-violet-300 to-fuchsia-500" },
  { name: "System design", value: 54, color: "from-emerald-300 to-teal-500" },
];
const weekly = [
  { day: "Mon", minutes: 42, lessons: 3 },
  { day: "Tue", minutes: 58, lessons: 5 },
  { day: "Wed", minutes: 34, lessons: 2 },
  { day: "Thu", minutes: 76, lessons: 6 },
  { day: "Fri", minutes: 63, lessons: 5 },
  { day: "Sat", minutes: 91, lessons: 8 },
  { day: "Sun", minutes: 70, lessons: 6 },
];
const resumeBreakdown = [
  { name: "ATS Match", value: 86, color: "#22d3ee" },
  { name: "Impact", value: 78, color: "#a78bfa" },
  { name: "Keywords", value: 64, color: "#34d399" },
];
const recommendations = ["Add quantified React project outcomes", "Practice STAR answers for leadership", "Complete TypeScript testing module"];
const roadmapActivity = ["Finished Portfolio UX polish", "Saved 4-week DSA sprint", "Unlocked Resume v3 review"];
const careerInsights = [
  { label: "Frontend internships", trend: "+18%", note: "Demand is rising for Next.js + AI tooling portfolios." },
  { label: "Top missing keyword", trend: "Testing", note: "Add Jest, Playwright, and accessibility proof points." },
];

function SkeletonCard() {
  return <div className="h-36 animate-pulse rounded-3xl border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/20" />;
}

function MetricCard({ label, value, detail, gradient, href, children }: { label: string; value: string; detail: string; gradient: string; href: string; children?: ReactNode }) {
  return (
    <Link href={href} className="block focus:outline-none focus:ring-2 focus:ring-cyan-300/70 focus:ring-offset-2 focus:ring-offset-slate-950 rounded-3xl" aria-label={`Open ${label}`}>
      <motion.div
        whileHover={{ y: -6, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl"
      >
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient}`} />
        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-400/10 blur-2xl transition group-hover:bg-cyan-300/20" />
        <p className="text-sm font-medium text-slate-400">{label}</p>
        <p className="mt-3 text-3xl font-bold tracking-tight text-white">{value}</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">{detail}</p>
        {children && <div className="relative mt-4">{children}</div>}
      </motion.div>
    </Link>
  );
}

function WidgetShell({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">{eyebrow}</p>
      <h2 className="mt-2 text-xl font-bold text-white">{title}</h2>
      <div className="mt-5">{children}</div>
    </motion.section>
  );
}

export function CareerNexPremiumDashboard() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeItem = useMemo(() => navItems.find((item) => item.route === pathname) ?? navItems[0], [pathname]);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 650);
    return () => window.clearTimeout(timer);
  }, []);

  const todayFocus = useMemo(() => ["Polish resume bullets", "Complete React patterns module", "Practice 2 behavioral answers"], []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#060816] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_32%),radial-gradient(circle_at_70%_20%,rgba(168,85,247,0.18),transparent_30%),linear-gradient(180deg,#07091a,#02030a)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1500px] flex-col lg:flex-row">
        <aside className={`sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 p-3 backdrop-blur-2xl transition-all duration-300 lg:h-screen lg:border-b-0 lg:border-r ${collapsed ? "lg:w-24" : "lg:w-80"}`}>
          <div className="flex items-center justify-between gap-3">
            <a href="/" className="flex min-w-0 items-center gap-3" aria-label="CareerNex AI dashboard">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-violet-500 font-black text-slate-950 shadow-lg shadow-cyan-500/25">CN</div>
              <div className={`min-w-0 transition-all duration-300 ${collapsed ? "lg:hidden" : "block"}`}>
                <p className="truncate text-lg font-bold tracking-tight">CareerNex AI</p>
                <p className="truncate text-xs text-slate-400">Student Career OS</p>
              </div>
            </a>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileOpen((value) => !value)}
                className="rounded-2xl border border-white/10 bg-white/10 p-3 text-slate-200 transition hover:bg-white/15 lg:hidden"
                aria-expanded={mobileOpen}
                aria-label="Toggle navigation menu"
              >
                ☰
              </button>
              <button
                type="button"
                onClick={() => setCollapsed((value) => !value)}
                className="hidden rounded-2xl border border-white/10 bg-white/10 p-3 text-slate-200 transition hover:bg-white/15 lg:inline-flex"
                aria-expanded={!collapsed}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? "→" : "←"}
              </button>
            </div>
          </div>
          <div className={`mt-4 overflow-hidden transition-all duration-300 lg:block ${mobileOpen ? "max-h-[680px] opacity-100" : "max-h-0 opacity-0 lg:max-h-none lg:opacity-100"}`}>
            <span className={`mb-3 inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-200 ${collapsed ? "lg:hidden" : ""}`}>AI online</span>
            <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible" aria-label="CareerNex AI primary navigation">
              {navItems.map((item) => {
                const isActive = activeItem.label === item.label;
                return (
                  <Link
                    key={item.label}
                    href={item.route}
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    title={collapsed ? item.label : undefined}
                    className={`group relative flex min-w-fit items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all lg:min-w-0 ${
                      isActive
                        ? "bg-white text-slate-950 shadow-lg shadow-cyan-500/20"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    } ${collapsed ? "lg:justify-center lg:px-3" : ""}`}
                  >
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition ${isActive ? "bg-slate-950 text-cyan-200" : "bg-white/5 text-slate-300 group-hover:bg-cyan-300/15 group-hover:text-cyan-100"}`}>
                      <NavIcon name={item.icon} />
                    </span>
                    <span className={`min-w-0 transition-all duration-300 ${collapsed ? "lg:hidden" : "block"}`}>
                      <span className="block truncate font-semibold">{item.label}</span>
                      <span className={`block truncate text-xs ${isActive ? "text-slate-600" : "text-slate-500 group-hover:text-slate-300"}`}>{item.hint}</span>
                    </span>
                    {isActive && <motion.span layoutId="activeNavPill" className="absolute inset-y-3 right-2 w-1 rounded-full bg-cyan-400" />}
                  </Link>
                );
              })}
            </nav>
            <div className={`mt-6 rounded-3xl border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-black/20 ${collapsed ? "lg:hidden" : ""}`}>
              <p className="text-sm font-semibold">Upgrade readiness</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">Your profile is 82% ready for internship applications.</p>
              <div className="mt-4 h-2 rounded-full bg-white/10"><div className="h-2 w-[82%] rounded-full bg-gradient-to-r from-cyan-300 to-violet-400" /></div>
            </div>
          </div>
        </aside>

        <section className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <motion.header
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-8 lg:p-10"
          >
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
              <div>
                <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 shadow-lg shadow-cyan-950/30">AI-powered career guidance SaaS</p>
                <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl lg:text-7xl">Build your career roadmap with CareerNex AI.</h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">A premium student operating system for resumes, skill gaps, learning roadmaps, interview prep, and measurable career progress.</p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link href="/ai-coach" className="rounded-2xl bg-gradient-to-r from-cyan-300 to-violet-400 px-6 py-3 text-center font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:scale-[1.02]">Ask AI Coach</Link>
                  <Link href="/resume-analyzer" className="rounded-2xl border border-white/15 bg-white/10 px-6 py-3 text-center font-semibold text-white transition hover:bg-white/15">Analyze Resume</Link>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5 shadow-2xl shadow-black/20">
                <p className="text-sm text-slate-400">Next milestone</p>
                <p className="mt-2 text-2xl font-bold">Frontend Internship Sprint</p>
                <div className="mt-5 space-y-3">
                  {todayFocus.map((item) => <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/[0.06] p-3 text-sm text-slate-200"><span className="text-cyan-300">✓</span>{item}</div>)}
                </div>
              </div>
            </div>
          </motion.header>

          {loading ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Learning streak" value="18 days" detail="Top 7% of focused learners this month." gradient="from-orange-300 to-pink-500" href="/progress">
                <div className="flex gap-1.5">{Array.from({ length: 7 }).map((_, index) => <span key={index} className="h-8 flex-1 rounded-lg bg-gradient-to-t from-orange-500/50 to-pink-300" />)}</div>
              </MetricCard>
              <MetricCard label="Resume score" value="86/100" detail="ATS-ready with 5 priority improvements." gradient="from-cyan-300 to-blue-500" href="/resume-analyzer">
                <ResponsiveContainer width="100%" height={58}><PieChart><Pie data={[{ value: 86 }, { value: 14 }]} innerRadius={20} outerRadius={28} dataKey="value" startAngle={90} endAngle={-270}><Cell fill="#22d3ee" /><Cell fill="rgba(255,255,255,0.12)" /></Pie></PieChart></ResponsiveContainer>
              </MetricCard>
              <MetricCard label="Skill velocity" value="+24%" detail="React and TypeScript momentum improved." gradient="from-emerald-300 to-teal-500" href="/skill-gap-analysis">
                <ResponsiveContainer width="100%" height={58}><AreaChart data={weekly}><Area type="monotone" dataKey="lessons" stroke="#34d399" fill="#34d399" fillOpacity={0.22} /></AreaChart></ResponsiveContainer>
              </MetricCard>
              <MetricCard label="AI recommendations" value={String(recommendations.length)} detail="Personalized actions generated today." gradient="from-violet-300 to-fuchsia-500" href="/ai-coach">
                <div className="space-y-2">{recommendations.slice(0, 2).map((item) => <p key={item} className="rounded-xl bg-white/[0.06] px-3 py-2 text-xs text-slate-200">{item}</p>)}</div>
              </MetricCard>
            </motion.div>
          )}

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <WidgetShell title="Weekly activity chart" eyebrow="Analytics">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-400">Practice, lessons, applications, and AI coaching minutes.</p>
                <span className="rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-200">+16% vs last week</span>
              </div>
              <div className="mt-5 h-72 rounded-3xl bg-slate-950/40 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekly}>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis dataKey="day" stroke="#64748b" tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: "rgba(255,255,255,0.06)" }} contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, color: "#fff" }} />
                    <Bar dataKey="minutes" radius={[12, 12, 0, 0]} fill="#22d3ee" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </WidgetShell>

            <WidgetShell title="Skills progress" eyebrow="Gap analysis">
              <div className="space-y-5">
                {skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="mb-2 flex justify-between text-sm"><span>{skill.name}</span><span className="text-slate-400">{skill.value}%</span></div>
                    <div className="h-3 rounded-full bg-white/10"><motion.div initial={{ width: 0 }} animate={{ width: `${skill.value}%` }} className={`h-3 rounded-full bg-gradient-to-r ${skill.color}`} /></div>
                  </div>
                ))}
              </div>
              <div className="mt-7 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-50">AI insight: prioritize portfolio proof, testing confidence, and system-design storytelling before applying to top-tier internships.</div>
            </WidgetShell>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <WidgetShell title="Resume score breakdown" eyebrow="ATS intelligence">
              <div className="h-56"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={resumeBreakdown} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={4}>{resumeBreakdown.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16 }} /></PieChart></ResponsiveContainer></div>
            </WidgetShell>
            <WidgetShell title="Recent roadmap activity" eyebrow="Momentum">
              <div className="space-y-3">{roadmapActivity.map((item, index) => <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-sm text-slate-200"><span className="mr-2 text-cyan-300">0{index + 1}</span>{item}</div>)}</div>
            </WidgetShell>
            <WidgetShell title="Career insights" eyebrow="Market signals">
              <div className="space-y-4">{careerInsights.map((insight) => <div key={insight.label} className="rounded-2xl bg-slate-950/40 p-4"><div className="flex items-center justify-between gap-3"><p className="font-semibold">{insight.label}</p><span className="rounded-full bg-violet-300/10 px-2 py-1 text-xs text-violet-100">{insight.trend}</span></div><p className="mt-2 text-sm leading-6 text-slate-400">{insight.note}</p></div>)}</div>
            </WidgetShell>
          </div>
        </section>
      </div>
    </main>
  );
}
