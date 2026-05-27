export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "student" | "mentor" | "admin";
  targetRole: string;
  provider: "mock" | "supabase" | "oauth";
};

export type AuthSession = {
  token: string;
  user: AuthUser;
  expiresAt: string;
};

export type AuthResponse =
  | { ok: true; session?: AuthSession; message?: string }
  | { ok: false; error: string };

export const SESSION_COOKIE = "careernex_session";

export type AuthCookieReader = {
  get(name: string): { value: string } | undefined;
};

export type CurrentUserContext = {
  cookies?: AuthCookieReader;
};

export interface CurrentUserProvider {
  getCurrentUser(context?: CurrentUserContext): Promise<AuthUser | null>;
}

function parseMockSession(value?: string): AuthSession | null {
  if (!value) return null;

  const candidates = [value, decodeURIComponent(value)];

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as Partial<AuthSession>;
      if (parsed?.user?.id && parsed?.token) return parsed as AuthSession;
    } catch {
      // Keep trying supported mock-session formats.
    }
  }

  return null;
}

function isSessionActive(session: AuthSession): boolean {
  const expiresAt = Date.parse(session.expiresAt);
  return Number.isNaN(expiresAt) || expiresAt > Date.now();
}

const mockCurrentUserProvider: CurrentUserProvider = {
  async getCurrentUser(context) {
    const cookieStore = context?.cookies ?? (await (await import("next/headers")).cookies());
    const rawSession = cookieStore.get(SESSION_COOKIE)?.value;
    const session = parseMockSession(rawSession);

    if (session && isSessionActive(session)) {
      return session.user;
    }

    return demoUsers[0] ?? null;
  },
};

const currentUserProvider: CurrentUserProvider = mockCurrentUserProvider;

export async function getCurrentUser(context?: CurrentUserContext): Promise<AuthUser | null> {
  return currentUserProvider.getCurrentUser(context);
}

export const demoUsers: Array<AuthUser & { password: string }> = [
  {
    id: "usr_demo_001",
    name: "Sajlendra Pandey",
    email: "student@careernex.ai",
    password: "CareerNex123!",
    role: "student",
    targetRole: "Frontend AI Engineer Intern",
    provider: "mock",
  },
];

export interface AuthProvider {
  login(email: string, password: string): Promise<AuthSession>;
  register(input: { name: string; email: string; password: string; targetRole?: string }): Promise<AuthSession>;
  forgotPassword(email: string): Promise<{ message: string }>;
  logout(): Promise<{ message: string }>;
}

async function requestAuth(action: string, body: Record<string, string> = {}): Promise<AuthResponse> {
  const response = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...body }),
  });

  return response.json() as Promise<AuthResponse>;
}

export const mockAuthProvider: AuthProvider = {
  async login(email, password) {
    const result = await requestAuth("login", { email, password });
    if (!result.ok || !result.session) throw new Error(result.ok ? "Missing session" : result.error);
    return result.session;
  },
  async register(input) {
    const result = await requestAuth("register", {
      name: input.name,
      email: input.email,
      password: input.password,
      targetRole: input.targetRole ?? "Software Engineer Intern",
    });
    if (!result.ok || !result.session) throw new Error(result.ok ? "Missing session" : result.error);
    return result.session;
  },
  async forgotPassword(email) {
    const result = await requestAuth("forgot", { email });
    if (!result.ok) throw new Error(result.error);
    return { message: result.message ?? "Password reset instructions sent." };
  },
  async logout() {
    const result = await requestAuth("logout");
    if (!result.ok) throw new Error(result.error);
    return { message: result.message ?? "Signed out." };
  },
};

export async function logout(): Promise<{ message: string }> {
  return mockAuthProvider.logout();
}
