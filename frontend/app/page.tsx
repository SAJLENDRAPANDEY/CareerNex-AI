"use client";

import { motion } from "framer-motion";
import { CareerNexPremiumDashboard } from "@/components/careernex-premium-dashboard";
import { StudioDashboard } from "@/components/studio-dashboard";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 selection:bg-cyan-400/30 selection:text-cyan-50">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.28),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.22),transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_52%,#111827_100%)]" />
        <motion.div
          className="absolute -left-32 top-16 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl"
          animate={{ x: [0, 42, 0], y: [0, -28, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-24 top-40 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl"
          animate={{ x: [0, -36, 0], y: [0, 32, 0], scale: [1, 0.92, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      </motion.div>

      <CareerNexPremiumDashboard />
      <motion.section
        className="hidden"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.aside
          className="sticky top-4 z-20 h-fit rounded-[2rem] border border-white/10 bg-white/[0.07] p-4 shadow-2xl shadow-cyan-950/40 backdrop-blur-2xl lg:w-72"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.12, duration: 0.55, ease: "easeOut" }}
        >
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-fuchsia-400 text-xl font-black text-slate-950 shadow-lg shadow-cyan-500/25">
              AI
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200/80">Career Studio</p>
              <h1 className="text-lg font-bold text-white">Student OS</h1>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-2 lg:grid-cols-1" aria-label="Dashboard navigation">
            {[
              ["✦", "Overview", "AI command center"],
              ["☰", "Roadmaps", "Saved learning paths"],
              ["◈", "Resume Lab", "Analysis and scoring"],
              ["▣", "Progress", "Charts and milestones"],
              ["⚙", "Settings", "Profile controls"],
            ].map(([icon, label, hint], index) => (
              <motion.a
                key={label}
                href="#"
                className="group rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-3 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:shadow-lg hover:shadow-cyan-500/10"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.18 + index * 0.05, duration: 0.4 }}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950/60 text-cyan-200 ring-1 ring-white/10 transition group-hover:bg-cyan-300/20 group-hover:text-white">
                    {icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-white">{label}</span>
                    <span className="hidden truncate text-xs text-slate-400 lg:block">{hint}</span>
                  </span>
                </div>
              </motion.a>
            ))}
          </nav>
        </motion.aside>

        <div className="flex-1 space-y-5">
          <motion.div
            className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-4 shadow-2xl shadow-slate-950/40 backdrop-blur-2xl sm:p-6"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.18, duration: 0.55, ease: "easeOut" }}
          >
            <div className="mb-5 grid gap-3 sm:grid-cols-3">
              {[
                ["Learning Velocity", "84%", "from last week"],
                ["Roadmaps Saved", "12", "3 in progress"],
                ["Resume Score", "91", "AI optimized"],
              ].map(([label, value, hint], index) => (
                <motion.div
                  key={label}
                  className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/12 to-white/[0.04] p-4 shadow-xl shadow-slate-950/20 backdrop-blur-xl"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.26 + index * 0.07, duration: 0.45 }}
                >
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">{label}</p>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <span className="bg-gradient-to-r from-cyan-200 to-fuchsia-200 bg-clip-text text-3xl font-black text-transparent">{value}</span>
                    <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2 py-1 text-xs text-emerald-200">{hint}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/35 shadow-inner shadow-white/5">
              <StudioDashboard />
            </div>
          </motion.div>
        </div>
      </motion.section>
    </main>
  );
}
