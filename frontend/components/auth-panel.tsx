"use client";

import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { mockAuthProvider } from "@/lib/auth";

type AuthMode = "login" | "register" | "forgot";

const copy = {
  login: { title: "Welcome back", subtitle: "Sign in to continue your AI-powered career plan.", button: "Sign in" },
  register: { title: "Create your CareerNex account", subtitle: "Start with a personalized roadmap and resume benchmark.", button: "Create account" },
  forgot: { title: "Reset password", subtitle: "We will send secure reset instructions if the account exists.", button: "Send reset link" },
};

export function AuthPanel({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("student@careernex.ai");
  const [password, setPassword] = useState("CareerNex123!");
  const [targetRole, setTargetRole] = useState("Frontend AI Engineer Intern");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      if (mode === "login") await mockAuthProvider.login(email, password);
      if (mode === "register") await mockAuthProvider.register({ name, email, password, targetRole });
      if (mode === "forgot") {
        const result = await mockAuthProvider.forgotPassword(email);
        setStatus(result.message);
        return;
      }
      router.push(searchParams.get("next") || "/dashboard");
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050714] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.25),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.2),transparent_30%)]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_0.85fr]">
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-8 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <a href="/" className="inline-flex items-center gap-3 text-sm font-semibold text-cyan-100"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-violet-500 font-black text-slate-950">CN</span> CareerNex AI</a>
          <h1 className="mt-8 text-4xl font-black tracking-tight sm:text-5xl">{copy[mode].title}</h1>
          <p className="mt-4 max-w-xl leading-8 text-slate-300">{copy[mode].subtitle}</p>
          <div className="mt-8 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
            {["Cookie sessions", "Mock provider", "Supabase-ready"].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">✓ {item}</div>)}
          </div>
        </motion.section>

        <motion.form onSubmit={onSubmit} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur-2xl sm:p-8">
          <div className="mb-6 flex rounded-2xl bg-white/[0.06] p-1 text-sm">
            <a className={`flex-1 rounded-xl px-3 py-2 text-center ${mode === "login" ? "bg-white text-slate-950" : "text-slate-300"}`} href="/login">Login</a>
            <a className={`flex-1 rounded-xl px-3 py-2 text-center ${mode === "register" ? "bg-white text-slate-950" : "text-slate-300"}`} href="/register">Register</a>
            <a className={`flex-1 rounded-xl px-3 py-2 text-center ${mode === "forgot" ? "bg-white text-slate-950" : "text-slate-300"}`} href="/forgot-password">Forgot</a>
          </div>

          {mode === "register" && (
            <label className="mb-4 block text-sm font-medium text-slate-300">Full name<input value={name} onChange={(event) => setName(event.target.value)} required className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition focus:border-cyan-300" placeholder="Your name" /></label>
          )}
          <label className="mb-4 block text-sm font-medium text-slate-300">Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition focus:border-cyan-300" /></label>
          {mode !== "forgot" && <label className="mb-4 block text-sm font-medium text-slate-300">Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition focus:border-cyan-300" /></label>}
          {mode === "register" && <label className="mb-4 block text-sm font-medium text-slate-300">Target role<input value={targetRole} onChange={(event) => setTargetRole(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition focus:border-cyan-300" /></label>}
          {status && <p className="mb-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm text-cyan-50">{status}</p>}
          <button disabled={loading} className="w-full rounded-2xl bg-gradient-to-r from-cyan-300 to-violet-400 px-6 py-3 font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:scale-[1.01] disabled:cursor-wait disabled:opacity-70">{loading ? "Please wait..." : copy[mode].button}</button>
          <p className="mt-5 text-center text-xs text-slate-500">Demo login: student@careernex.ai / CareerNex123!</p>
        </motion.form>
      </div>
    </main>
  );
}
