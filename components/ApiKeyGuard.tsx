"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Key } from "lucide-react";
import { getDefaultProvider, hasApiKey } from "@/lib/localKeys";

/**
 * Shows a warning banner when no API key is configured for the default provider.
 * API keys are stored locally in the browser — this component never reads
 * or transmits any key value.
 */
export function ApiKeyGuard() {
  const [missing, setMissing] = useState(false);
  const [provider, setProvider] = useState("openai");

  useEffect(() => {
    const p = getDefaultProvider();
    setProvider(p);
    if (p !== "ollama") {
      setMissing(!hasApiKey(p));
    }
  }, []);

  if (!missing || provider === "ollama") return null;

  return (
    <div className="card p-4 border-amber-800/60 bg-amber-950/20 flex items-start gap-3">
      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-amber-300">
          No {provider} API key configured.{" "}
          <Link href="/settings" className="underline hover:text-amber-200">
            Add your key in Settings
          </Link>
          {" "}to run agents.
        </p>
        <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
          <Key className="w-3 h-3" />
          Keys are stored locally in your browser only, never on any server.
        </p>
      </div>
    </div>
  );
}
