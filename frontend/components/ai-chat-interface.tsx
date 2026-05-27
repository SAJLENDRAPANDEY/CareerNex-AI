"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

type ChatApiResponse = {
  reply?: string;
  message?: string;
  response?: string;
  answer?: string;
};

const suggestedPrompts = [
  "How do I prepare for a frontend internship in 30 days?",
  "Review my career goal and suggest a learning roadmap.",
  "What projects should I build for a Next.js portfolio?",
  "Help me practice a behavioral interview answer.",
];

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
}

function getReplyFromPayload(payload: ChatApiResponse) {
  return payload.reply || payload.message || payload.response || payload.answer || "I generated a response, but the server returned it in an unexpected format.";
}

export function AiChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("careernex-ai-chat-history");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ChatMessage[];
        setMessages(parsed);
        return;
      } catch {
        window.localStorage.removeItem("careernex-ai-chat-history");
      }
    }

    setMessages([
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Hi! I’m your CareerNex AI coach. Ask me about resumes, internships, interview prep, skill gaps, or learning roadmaps.",
        createdAt: new Date().toISOString(),
      },
    ]);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      window.localStorage.setItem("careernex-ai-chat-history", JSON.stringify(messages));
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(messageText = input) {
    const trimmed = messageText.trim();
    if (!trimmed || isSending) return;

    const apiBaseUrl = getApiBaseUrl();
    if (!apiBaseUrl) {
      setError("NEXT_PUBLIC_API_URL is not configured for the AI coach API.");
      return;
    }

    setError("");
    setIsSending(true);
    setInput("");

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);

    try {
      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          messages: nextHistory.map(({ role, content }) => ({ role, content })),
          context: "CareerNex AI career coaching chat",
        }),
      });

      if (!response.ok) {
        throw new Error(`AI coach request failed with status ${response.status}`);
      }

      const payload = (await response.json()) as ChatApiResponse;
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: getReplyFromPayload(payload),
        createdAt: new Date().toISOString(),
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to reach the AI coach right now.";
      setError(message);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "I couldn’t connect to the AI coach service. Please try again in a moment.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  function clearHistory() {
    const greeting: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Chat reset. What career goal should we work on next?",
      createdAt: new Date().toISOString(),
    };
    setMessages([greeting]);
    setError("");
  }

  return (
    <main className="min-h-screen bg-[#060816] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.20),transparent_32%),radial-gradient(circle_at_80%_15%,rgba(168,85,247,0.16),transparent_30%),linear-gradient(180deg,#07091a,#02030a)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-5 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/dashboard" className="text-sm font-semibold text-cyan-200 transition hover:text-cyan-100">← Back to dashboard</Link>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">AI Career Coach</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">Ask career questions, plan your next sprint, practice interviews, and keep your coaching history in one place.</p>
          </div>
          <button type="button" onClick={clearHistory} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
            Clear chat
          </button>
        </header>

        {error && (
          <div className="mb-4 rounded-2xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100" role="alert">
            {error}
          </div>
        )}

        <section className="flex min-h-[68vh] flex-1 flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] shadow-2xl shadow-black/25 backdrop-blur-xl">
          <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
            {messages.length === 0 ? (
              <div className="grid h-full place-items-center text-center text-slate-400">Start a conversation with your AI career coach.</div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-3xl px-4 py-3 shadow-xl sm:max-w-[72%] ${message.role === "user" ? "bg-gradient-to-r from-cyan-300 to-violet-400 text-slate-950" : "border border-white/10 bg-slate-950/70 text-slate-100"}`}>
                    <p className="whitespace-pre-wrap text-sm leading-6 sm:text-base">{message.content}</p>
                    <p className={`mt-2 text-[11px] ${message.role === "user" ? "text-slate-800/70" : "text-slate-500"}`}>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>
              ))
            )}
            {isSending && (
              <div className="flex justify-start">
                <div className="rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-300 shadow-xl">
                  <span className="inline-flex items-center gap-2"><span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" /> CareerNex AI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-white/10 p-4 sm:p-5">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {suggestedPrompts.map((prompt) => (
                <button key={prompt} type="button" onClick={() => void sendMessage(prompt)} disabled={isSending} className="min-w-fit rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-slate-200 transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-50">
                  {prompt}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="career-coach-message">Message AI Career Coach</label>
              <textarea
                id="career-coach-message"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder="Ask about resume bullets, roadmaps, interviews, skill gaps..."
                className="min-h-14 flex-1 resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
              />
              <button type="submit" disabled={isSending || !input.trim()} className="rounded-2xl bg-gradient-to-r from-cyan-300 to-violet-400 px-6 py-3 font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100">
                {isSending ? "Sending..." : "Send"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
