/**
 * Server-Sent Events (SSE) client for streaming agent output.
 *
 * Uses the Fetch API with streaming reads rather than EventSource,
 * because we need to POST a body (with input/config) and include the
 * X-LLM-API-Key header — neither of which EventSource supports.
 */

const KERNEL_BASE = process.env.NEXT_PUBLIC_KERNEL_URL ?? "http://localhost:8000";

export interface SSEToken {
  token?: string;
  error?: string;
  done?: boolean;
}

/**
 * Stream agent output tokens from the kernel.
 *
 * @param agentId - The agent ID to run
 * @param input - User's input text
 * @param apiKey - LLM provider API key (read from localStorage, never stored)
 * @param provider - LLM provider identifier
 * @param onToken - Callback called with each output token
 * @param onDone - Called when the stream completes
 * @param onError - Called if the stream errors
 * @param signal - AbortController signal to cancel the stream
 */
export async function streamAgentRun({
  agentId,
  input,
  apiKey,
  provider = "openai",
  modelOverride,
  sessionId,
  onToken,
  onDone,
  onError,
  signal,
}: {
  agentId: string;
  input: string;
  apiKey: string;
  provider?: string;
  modelOverride?: string;
  sessionId?: string;
  onToken: (token: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
  signal?: AbortSignal;
}): Promise<void> {
  const body = {
    input,
    provider,
    ...(modelOverride && { model_override: modelOverride }),
    ...(sessionId && { session_id: sessionId }),
  };

  let response: Response;
  try {
    response = await fetch(`${KERNEL_BASE}/api/run/${agentId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-LLM-API-Key": apiKey,
        "X-LLM-Provider": provider,
      },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      onDone();
      return;
    }
    onError(String(err));
    return;
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    onError(`HTTP ${response.status}: ${text}`);
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    onError("No response body");
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();

        if (data === "[DONE]") {
          onDone();
          return;
        }

        try {
          const parsed: SSEToken = JSON.parse(data);
          if (parsed.token) {
            onToken(parsed.token);
          } else if (parsed.error) {
            onError(parsed.error);
            return;
          }
        } catch {
          // Ignore malformed lines
        }
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      onDone();
    } else {
      onError(String(err));
    }
  } finally {
    reader.releaseLock();
    onDone();
  }
}
