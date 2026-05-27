import { Suspense } from "react";
import { AuthPanel } from "@/components/auth-panel";

function ForgotPasswordContent() {
  return <AuthPanel mode="forgot" />;
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 text-slate-100">
          <div className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-6 py-5 text-sm text-slate-300 shadow-2xl shadow-cyan-950/20">
              Loading password reset...
            </div>
          </div>
        </main>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
