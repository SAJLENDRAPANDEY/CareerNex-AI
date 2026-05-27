import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { demoUsers, SESSION_COOKIE, type AuthSession, type AuthUser } from "@/lib/auth";

const sessions = new Map<string, AuthSession>();
const registeredUsers = new Map<string, AuthUser & { password: string }>();

demoUsers.forEach((user) => registeredUsers.set(user.email.toLowerCase(), user));

function createSession(user: AuthUser): AuthSession {
  const session: AuthSession = {
    token: `mock_${crypto.randomUUID()}`,
    user,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
  };
  sessions.set(session.token, session);
  return session;
}

async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? sessions.get(token) : undefined;

  if (!session) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({ ok: true, session });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, string>;
  const action = body.action;

  if (action === "login") {
    const email = body.email?.toLowerCase().trim();
    const user = email ? registeredUsers.get(email) : undefined;
    if (!user || user.password !== body.password) {
      return NextResponse.json({ ok: false, error: "Invalid email or password" }, { status: 401 });
    }
    const { password: _password, ...safeUser } = user;
    const session = createSession(safeUser);
    await setSessionCookie(session.token);
    return NextResponse.json({ ok: true, session });
  }

  if (action === "register") {
    const email = body.email?.toLowerCase().trim();
    if (!body.name || !email || !body.password) {
      return NextResponse.json({ ok: false, error: "Name, email, and password are required" }, { status: 400 });
    }
    if (registeredUsers.has(email)) {
      return NextResponse.json({ ok: false, error: "An account already exists for this email" }, { status: 409 });
    }
    const user = {
      id: `usr_${crypto.randomUUID()}`,
      name: body.name,
      email,
      password: body.password,
      role: "student" as const,
      targetRole: body.targetRole || "Software Engineer Intern",
      provider: "mock" as const,
    };
    registeredUsers.set(email, user);
    const { password: _password, ...safeUser } = user;
    const session = createSession(safeUser);
    await setSessionCookie(session.token);
    return NextResponse.json({ ok: true, session });
  }

  if (action === "forgot") {
    return NextResponse.json({ ok: true, message: "If an account exists, password reset instructions were sent." });
  }

  if (action === "logout") {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (token) sessions.delete(token);
    await clearSessionCookie();
    return NextResponse.json({ ok: true, message: "Signed out." });
  }

  return NextResponse.json({ ok: false, error: "Unsupported auth action" }, { status: 400 });
}
