const MEDIA_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const API_BASE = `${MEDIA_BASE}/api`;

export function resolveMediaUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${MEDIA_BASE}${path}`;
}

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

interface RequestOptions extends RequestInit {
  skipAuthRetry?: boolean;
}

async function refreshAccessToken(): Promise<string | null> {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) return null;
  const data = await res.json();
  setAccessToken(data.accessToken);
  return data.accessToken as string;
}

export async function apiFetch<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuthRetry, headers, ...rest } = options;

  const isFormData = typeof FormData !== 'undefined' && rest.body instanceof FormData;

  const doFetch = async (): Promise<Response> =>
    fetch(`${API_BASE}${path}`, {
      ...rest,
      credentials: 'include',
      headers: {
        ...(rest.body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
    });

  let response = await doFetch();

  if (response.status === 401 && !skipAuthRetry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      response = await doFetch();
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: response.statusText }));
    throw new ApiError(response.status, body.message ?? 'Une erreur est survenue.');
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export async function uploadMedia(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetch<{ url: string }>('/media/upload', { method: 'POST', body: formData });
}

export { refreshAccessToken, API_BASE, MEDIA_BASE };
