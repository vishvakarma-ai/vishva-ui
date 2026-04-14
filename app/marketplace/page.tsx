"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Package, Star, Download } from "lucide-react";
import { api } from "@/lib/api";
import { InstallProgress } from "@/components/InstallProgress";

interface HubAgent {
  name: string;
  version: string;
  description: string;
  author: string;
  metadata?: {
    tags?: string[];
    category?: string;
  };
  downloads?: number;
  rating?: number;
}

const CATEGORIES = [
  "all", "productivity", "research", "coding", "writing",
  "data-analysis", "automation", "communication", "education", "other",
];

export default function MarketplacePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [agents, setAgents] = useState<HubAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const [installingAgent, setInstallingAgent] = useState<string | null>(null);
  const [installEvents, setInstallEvents] = useState<string[]>([]);

  const search = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: query, page_size: "20" });
      if (category !== "all") params.set("category", category);
      const res = await api.get(`/api/marketplace/search?${params}`);
      setAgents(res.data?.agents ?? []);
    } catch {
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, [query, category]);

  useEffect(() => { search(); }, [search]);

  async function handleInstall(agentName: string) {
    setInstallingAgent(agentName);
    setInstallEvents([`Installing ${agentName}...`]);

    const eventSource = new EventSource(
      `http://localhost:8000/api/agents/install`,
    );
    // Note: EventSource doesn't support POST; use fetch with SSE
    try {
      const res = await fetch("http://localhost:8000/api/agents/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_name: agentName, version: "latest" }),
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
      setTimeout(() => setInstallingAgent(null), 2000);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white">Marketplace</h1>
        <p className="text-gray-400 mt-1">Discover and install AI agents from Vishva Hub</p>
      </div>

      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search agents..."
            className="input pl-10"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input w-full sm:w-48 capitalize"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c} className="capitalize">{c}</option>
          ))}
        </select>
      </div>

      {/* Install progress modal */}
      {installingAgent && (
        <InstallProgress
          agentName={installingAgent}
          events={installEvents}
          onClose={() => setInstallingAgent(null)}
        />
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-gray-800 rounded w-2/3 mb-3" />
              <div className="h-3 bg-gray-800 rounded w-full mb-2" />
              <div className="h-3 bg-gray-800 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400">
            {query ? `No results for "${query}"` : "No agents available. The Hub may be offline."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <HubAgentCard
              key={agent.name}
              agent={agent}
              onInstall={handleInstall}
              installing={installingAgent === agent.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function HubAgentCard({
  agent, onInstall, installing,
}: {
  agent: HubAgent;
  onInstall: (name: string) => void;
  installing: boolean;
}) {
  return (
    <div className="card p-5 hover:border-gray-700 transition-colors flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
          <Package className="w-5 h-5 text-gray-400" />
        </div>
        {agent.rating != null && (
          <div className="flex items-center gap-1 text-yellow-400 text-xs">
            <Star className="w-3.5 h-3.5 fill-yellow-400" />
            {agent.rating.toFixed(1)}
          </div>
        )}
      </div>

      <h3 className="font-semibold text-white">{agent.name}</h3>
      <p className="text-xs text-gray-500 mb-2">by {agent.author} · v{agent.version}</p>
      <p className="text-gray-400 text-sm flex-1 line-clamp-3 mb-4">{agent.description}</p>

      {agent.metadata?.tags && agent.metadata.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {agent.metadata.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="badge bg-gray-800 text-gray-400 text-xs">{tag}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        {agent.downloads != null && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Download className="w-3 h-3" /> {agent.downloads.toLocaleString()}
          </span>
        )}
        <button
          onClick={() => onInstall(agent.name)}
          disabled={installing}
          className="btn-primary text-sm py-1.5 px-3 ml-auto"
        >
          {installing ? "Installing..." : "Install"}
        </button>
      </div>
    </div>
  );
}
