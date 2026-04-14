"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bot, Play, Trash2, RefreshCw, Package } from "lucide-react";
import { api } from "@/lib/api";
import type { Agent } from "@/lib/types";

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);

  async function loadAgents() {
    try {
      const res = await api.get("/api/agents");
      setAgents(res.data ?? []);
    } catch {
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAgents(); }, []);

  async function handleRemove(agentId: string) {
    if (!confirm(`Remove agent '${agentId}'?`)) return;
    try {
      await api.delete(`/api/agents/${agentId}`);
      setAgents((prev) => prev.filter((a) => a.id !== agentId));
    } catch (e: unknown) {
      alert(`Failed to remove: ${e}`);
    }
  }

  async function handleReload() {
    setReloading(true);
    try {
      await api.post("/api/agents/reload", {});
      await loadAgents();
    } finally {
      setReloading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Installed Agents</h1>
          <p className="text-gray-400 mt-1">{agents.length} agent{agents.length !== 1 ? "s" : ""} installed</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleReload} disabled={reloading} className="btn-secondary">
            <RefreshCw className={`w-4 h-4 ${reloading ? "animate-spin" : ""}`} />
            Reload
          </button>
          <Link href="/marketplace" className="btn-primary">
            <Package className="w-4 h-4" /> Browse Marketplace
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-gray-800 rounded w-1/2 mb-3" />
              <div className="h-3 bg-gray-800 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="card p-12 text-center">
          <Bot className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-300 mb-2">No agents installed</h2>
          <p className="text-gray-500 mb-6">Browse the marketplace to find and install agents.</p>
          <Link href="/marketplace" className="btn-primary">
            Go to Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent) => (
            <div key={agent.id} className="card p-5 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-vishva-900/50 border border-vishva-800 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-vishva-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{agent.name}</h3>
                    <p className="text-xs text-gray-500">by {agent.author} · v{agent.version}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(agent.id)}
                  className="p-1.5 text-gray-600 hover:text-red-400 transition-colors rounded"
                  title="Remove agent"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-gray-400 text-sm line-clamp-2 mb-4">{agent.description}</p>

              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {agent.manifest?.tools?.map((tool: string) => (
                  <span key={tool} className="badge bg-gray-800 text-gray-400">{tool}</span>
                ))}
                {agent.manifest?.memory?.enabled && (
                  <span className="badge bg-vishva-900/50 text-vishva-300 border border-vishva-800/50">
                    memory
                  </span>
                )}
              </div>

              <Link
                href={`/agents/${agent.id}`}
                className="btn-primary w-full justify-center"
              >
                <Play className="w-4 h-4" /> Open & Run
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
