import { apiFetch } from "@/lib/api-client";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = LoginPayload & {
  name?: string;
};

export type AuthResponse = {
  token?: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
  };
  message?: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type RoadmapRequest = {
  goal: string;
  currentSkills?: string[];
  timeline?: string;
};

export type ResumeAnalysisRequest = {
  resumeText: string;
  targetRole?: string;
};

export type ProgressUpdate = {
  metric: string;
  value: number;
};

export type CareerDashboardData = {
  skills?: { name: string; value: number; color?: string }[];
  weekly?: { day: string; minutes: number; lessons: number }[];
  resumeBreakdown?: { name: string; value: number; color?: string }[];
  recommendations?: string[];
  roadmapActivity?: string[];
  careerInsights?: { label: string; trend: string; note: string }[];
};

function authHeaders(token?: string) {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export type ApiRequestState = {
  pendingCount: number;
  isLoading: boolean;
  lastError: string | null;
};

type ApiRequestListener = (state: ApiRequestState) => void;

const apiRequestListeners = new Set<ApiRequestListener>();
let apiRequestState: ApiRequestState = {
  pendingCount: 0,
  isLoading: false,
  lastError: null,
};

function normalizeApiError(error: unknown) {
  if (error instanceof Error) {
    return error.message || "The request failed. Please try again.";
  }

  if (typeof error === "string") {
    return error;
  }

  return "The request failed. Please try again.";
}

function emitApiRequestState(nextState: ApiRequestState) {
  apiRequestState = nextState;
  apiRequestListeners.forEach((listener) => listener(apiRequestState));
}

function setApiLoading(isStarting: boolean) {
  const pendingCount = Math.max(0, apiRequestState.pendingCount + (isStarting ? 1 : -1));

  emitApiRequestState({
    ...apiRequestState,
    pendingCount,
    isLoading: pendingCount > 0,
    lastError: isStarting ? null : apiRequestState.lastError,
  });
}

async function runApiRequest<T>(request: () => Promise<T>) {
  setApiLoading(true);

  try {
    return await request();
  } catch (error) {
    const message = normalizeApiError(error);

    emitApiRequestState({
      ...apiRequestState,
      lastError: message,
    });

    throw new Error(message);
  } finally {
    setApiLoading(false);
  }
}

export function getApiRequestState() {
  return apiRequestState;
}

export function clearApiRequestError() {
  emitApiRequestState({
    ...apiRequestState,
    lastError: null,
  });
}

export function subscribeToApiRequests(listener: ApiRequestListener) {
  apiRequestListeners.add(listener);
  listener(apiRequestState);

  return () => {
    apiRequestListeners.delete(listener);
  };
}

export const careerNexApi = {
  login(payload: LoginPayload) {
    return runApiRequest(() =>
      apiFetch<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
  },

  register(payload: RegisterPayload) {
    return runApiRequest(() =>
      apiFetch<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
  },

  forgotPassword(email: string) {
    return runApiRequest(() =>
      apiFetch<{ message?: string }>("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
    );
  },

  sendChatMessage(messages: ChatMessage[], token?: string) {
    return runApiRequest(() =>
      apiFetch<{ reply?: string; message?: string }>("/api/chatbot", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ messages }),
      }),
    );
  },

  generateRoadmap(payload: RoadmapRequest, token?: string) {
    return runApiRequest(() =>
      apiFetch<{ roadmap?: unknown; message?: string }>("/api/roadmaps/generate", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(payload),
      }),
    );
  },

  analyzeResume(payload: ResumeAnalysisRequest, token?: string) {
    return runApiRequest(() =>
      apiFetch<{ score?: number; analysis?: unknown; suggestions?: string[]; message?: string }>("/api/resume/analyze", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(payload),
      }),
    );
  },

  getProgress(token?: string) {
    return runApiRequest(() =>
      apiFetch<CareerDashboardData>("/api/progress", {
        headers: authHeaders(token),
      }),
    );
  },

  updateProgress(payload: ProgressUpdate, token?: string) {
    return runApiRequest(() =>
      apiFetch<{ success?: boolean; message?: string }>("/api/progress", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(payload),
      }),
    );
  },
};
