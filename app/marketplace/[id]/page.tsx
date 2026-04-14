"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, Star, Download, Tag, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import { InstallProgress } from "@/components/InstallProgress";

export default function MarketplaceAgentPage() {
  const params = useParams();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState(false);
  const [installEvents, setInstallEvents] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/api/marketplace/agents/${agentId}`);
        setAgent(res.data);
      } catch {
        setAgent(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [agentId]);

  async function handleInstall() {
    setInstalling(true);
    setInstallEvents([`Installing ${agentId}...`]);

    try {
      const res = await fetch("http://localhost:8000/api/agents/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_name: agentId, version: "latest" }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split("\n").filter((l) => l.startsWith("data: "));
        for (const line of lines) {
          const data = JSON.parse(line.slice(6));
          setInstallEvents((prev) => [...prev, data.message]);
        }
      }
    } catch (e: unknown) {
      setInstallEvents((prev) => [...prev, `Error: ${e}`]);
    } finally {
      setTimeout(() => setInstalling(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-gray-800 rounded w-1/3" />
        <div className="card p-6 h-48" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-gray-400">Agent not found on Vishva Hub.</p>
        <Link href="/marketplace" className="btn-secondary mt-4">Back to Marketplace</Link>
      </div>
    );
  }

  const metadata = agent.metadata as Record<string, unknown> | undefined;
  const runtime = agent.runtime as Record<string, unknown> | undefined;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <Link href="/marketplace" className="text-gray-400 hover:text-white flex items-center gap-2 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </Link>

      {installing && (
        <InstallProgress
          agentName={agentId}
          events={installEvents}
          onClose={() => setInstalling(false)}
        />
      )}

      <div className="card p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{agent.name as string}</h1>
            <p className="text-gray-400 text-sm mt-1">
              by {agent.author as string} · v{agent.version as string}
            </p>
            {(agent.rating as number) != null && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 text-yellow-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${s <= Math.round(agent.rating as number) ? "fill-yellow-400" : ""}`}
                    />
                  ))}
                </div>
                <span className="text-gray-400 text-sm">{(agent.rating as number).toFixed(1)}</span>
              </div>
            )}
          </div>
          <button onClick={handleInstall} disabled={installing} className="btn-primary shrink-0">
            {installing ? "Installing..." : "Install Agent"}
          </button>
        </div>

        <p className="text-gray-300">{agent.description as string}</p>

        {metadata?.tags && (metadata.tags as string[]).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {(metadata.tags as string[]).map((tag) => (
              <span key={tag} className="badge bg-vishva-900/30 text-vishva-300 border border-vishva-800/40">
                <Tag className="w-3 h-3 mr-1" />{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="card p-6 space-y-3">
        <h2 className="font-semibold text-white mb-4">Details</h2>
        {runtime?.preferred_model && (
          <DetailRow label="Preferred Model" value={runtime.preferred_model as string} />
        )}
        {runtime?.supports_ollama != null && (
          <DetailRow label="Ollama Support" value={runtime.supports_ollama ? "Yes" : "No"} />
        )}
        {metadata?.category && (
          <DetailRow label="Category" value={metadata.category as string} />
        )}
        {metadata?.repository && (
          <div className="flex items-center gap-4">
            <p className="text-gray-500 text-sm w-36 shrink-0">Repository</p>
            <a
              href={metadata.repository as string}
              target="_blank"
              rel="noopener noreferrer"
              className="text-vishva-400 hover:text-vishva-300 text-sm flex items-center gap-1"
            >
              {metadata.repository as string} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <p className="text-gray-500 text-sm w-36 shrink-0">{label}</p>
      <p className="text-gray-200 text-sm">{value}</p>
    </div>
  );
}
