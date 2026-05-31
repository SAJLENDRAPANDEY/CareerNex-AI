function getApiBaseUrl(): string {
  const configuredUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

  if (configuredUrl) {
    return configuredUrl;
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    const backendHost = hostname.replace(/^3000-/, '8000-');

    if (backendHost !== hostname) {
      return `${protocol}//${backendHost}`;
    }
  }

  return '';
}

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  health: '/api/health',
  chat: '/api/chat',
  resumeAnalyze: '/api/resume-analyze',
  githubUpdate: '/api/github-update',
  generateRoadmap: '/api/generate-roadmap',
  careerSuggestions: '/api/career-suggestions',
} as const;

export function apiUrl(path: string): string {
  if (!API_BASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_API_URL. Configure the deployed backend URL before making API requests.');
  }

  const normalizedPath = path.startsWith('/api/') ? path : `/api/${path.replace(/^\/+/, '')}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const trimmed = text.trim();

  if (!trimmed) {
    return {} as T;
  }

  const contentType = response.headers.get('content-type') || '';

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const looksLikeHtml = /^<!doctype html/i.test(trimmed) || /^<html/i.test(trimmed);
    const shortPreview = trimmed.replace(/\s+/g, ' ').slice(0, 180);

    if (!response.ok) {
      if (looksLikeHtml) {
        throw new Error(`API returned an HTML error page instead of JSON (${response.status}). Please retry the upload.`);
      }
      throw new Error(shortPreview || `API request failed with status ${response.status}`);
    }

    if (!contentType.includes('application/json') && looksLikeHtml) {
      throw new Error('The backend returned a web page instead of resume analysis data. Please retry the upload.');
    }

    throw new Error(shortPreview || 'The API returned an unreadable response. Please retry the upload.');
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableStatus = (status: number) => status === 408 || status === 429 || status === 502 || status === 503 || status === 504;

export async function apiFetch<T>(path: string, init?: RequestInit, timeoutMs = 30000): Promise<T> {
  const hasBody = typeof init?.body !== 'undefined';
  const isFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData;
  const effectiveTimeoutMs = timeoutMs === 30000 && isFormData ? 180000 : timeoutMs;
  const maxAttempts = hasBody ? 4 : 2;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), effectiveTimeoutMs);

    try {
      const response = await fetch(apiUrl(path), {
        ...init,
        headers: {
          Accept: 'application/json',
          ...(hasBody && !isFormData ? { 'Content-Type': 'application/json' } : {}),
          ...(init?.headers || {}),
        },
        signal: controller.signal,
        cache: 'no-store',
      });

      clearTimeout(timeoutId);

      const data = await parseApiResponse<{ error?: string; message?: string } & T>(response);

      if (!response.ok) {
        const retryable = isRetryableStatus(response.status);

        if (retryable && attempt < maxAttempts) {
          await sleep(1200 * attempt);
          continue;
        }

        if (response.status === 404) {
          throw new Error('API endpoint was not found. Please verify the backend deployment routes.');
        }
        if (response.status === 503 || response.status === 502 || response.status === 504) {
          throw new Error('API service is currently unavailable. Please try again later.');
        }
        if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment before trying again.');
        }
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication required. Please sign in to continue.');
        }
        throw new Error(data.error || data.message || `API request failed with status ${response.status}`);
      }

      return data as T;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;

      const isAbortError = err instanceof DOMException && err.name === 'AbortError';
      const isNetworkError = err instanceof TypeError;
      const retryableNetworkError = isNetworkError || isAbortError;

      if (retryableNetworkError && attempt < maxAttempts) {
        await sleep(1200 * attempt);
        continue;
      }

      if (isAbortError) {
        throw new Error('Resume analysis is taking longer than expected. Please retry the upload; the API connection is healthy but the request timed out.');
      }
      if (isNetworkError) {
        throw new Error('The upload connection was interrupted before the resume analysis finished. Please retry the upload; larger PDFs may take a little longer.');
      }
      throw err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Upload failed after multiple retry attempts. Please try again.');
}
