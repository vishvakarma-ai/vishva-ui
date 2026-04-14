"use client";

import { useState, useRef, useCallback } from "react";
import { Send, Square, AlertTriangle } from "lucide-react";
import { streamAgentRun } from "@/lib/sse";
import { getApiKey, getDefaultProvider } from "@/lib/localKeys";
import { StreamOutput } from "@/components/StreamOutput";
import { ApiKeyGuard } from "@/components/ApiKeyGuard";

interface AgentRunnerProps {
  agentId: string;
  agentName: string;
}

export function AgentRunner({ agentId, agentName }: AgentRunnerProps) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(() => crypto.randomUUID());

  const abortRef = useRef<AbortController | null>(null);

  const handleRun = useCallback(async () => {
    if (!input.trim() || streaming) return;

    const provider = getDefaultProvider();
    const apiKey = provider === "ollama" ? "" : (getApiKey(provider) ?? "");

    if (provider !== "ollama" && !apiKey) {
      setError(`No ${provider} API key configured. Go to Settings to add your key.`);
      return;
    }

    setError(null);
    setOutput("");
    setStreaming(true);

    abortRef.current = new AbortController();

    await streamAgentRun({
      agentId,
      input: input.trim(),
      apiKey,
      provider,
      sessionId,
      onToken: (token) => setOutput((prev) => prev + token),
      onDone: () => setStreaming(false),
      onError: (err) => {
        setError(err);
        setStreaming(false);
      },
      signal: abortRef.current.signal,
    });
  }, [agentId, input, sessionId, streaming]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleRun();
    }
  };

  return (
    <div className="space-y-4">
      <ApiKeyGuard />

      {/* Input */}
      <div className="card p-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask ${agentName} something... (Ctrl+Enter to run)`}
          rows={4}
          disabled={streaming}
          className="w-full bg-transparent text-gray-200 placeholder-gray-600 resize-none focus:outline-none text-sm leading-relaxed"
        />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
          <span className="text-xs text-gray-600">Ctrl+Enter to run</span>
          <div className="flex gap-2">
            {streaming && (
              <button onClick={handleStop} className="btn-secondary text-sm py-1.5">
                <Square className="w-3.5 h-3.5" /> Stop
              </button>
            )}
            <button
              onClick={handleRun}
              disabled={!input.trim() || streaming}
              className="btn-primary text-sm py-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {streaming ? "Running..." : "Run"}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card p-4 border-red-800 bg-red-950/20 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Output */}
      {(output || streaming) && (
        <div className="card p-5">
          <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">Output</p>
          <StreamOutput content={output} streaming={streaming} />
        </div>
      )}
    </div>
  );
}
