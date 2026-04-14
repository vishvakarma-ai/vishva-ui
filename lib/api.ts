/**
 * API client for communicating with the Vishva Kernel (localhost:8000).
 *
 * SECURITY: This module NEVER reads, stores, or transmits API keys.
 * API keys are handled exclusively in lib/localKeys.ts and passed
 * as headers only during agent run requests.
 */

const KERNEL_BASE = process.env.NEXT_PUBLIC_KERNEL_URL ?? "http://localhost:8000";

interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  error: string | null;
}

async function request<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
  headers?: Record<string, string>,
): Promise<ApiResponse<T>> {
  const url = `${KERNEL_BASE}${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${method} ${path} failed (${res.status}): ${text}`);
  }

  return res.json();
}

export const api = {
  get: <T = unknown>(path: string, headers?: Record<string, string>) =>
    request<T>("GET", path, undefined, headers),

  post: <T = unknown>(path: string, body: unknown, headers?: Record<string, string>) =>
    request<T>("POST", path, body, headers),

  delete: <T = unknown>(path: string, headers?: Record<string, string>) =>
    request<T>("DELETE", path, undefined, headers),
};
