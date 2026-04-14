"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Bot, Clock, ArrowLeft, Tag } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { AgentRunner } from "@/components/AgentRunner";
import type { Agent, RunRecord } from "@/lib/types";

export default function AgentDetailPage() {
  const params = useParams();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [history, setHistory] = useState<RunRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"run" | "history" | "details">("run");

  useEffect(() => {
    async function load() {
      try {
        const [agentRes, historyRes] = await Promise.allSettled([
          api.get(`/api/agents/${agentId}`),
          api.get(`/api/run/history?agent_id=${agentId}&limit=20`),
        ]);
        if (agentRes.status === "fulfilled") setAgent(agentRes.value.data);
        if (historyRes.status === "fulfilled") setHistory(historyRes.value.data ?? []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [agentId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-gray-800 rounded w-1/3" />
        <div className="card p-6 h-32" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-gray-400">Agent not found.</p>
        <Link href="/agents" className="btn-secondary mt-4">Back to Agents</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/agents" className="p-2 text-gray-400 hover:text-white mt-1">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-12 h-12 rounded-xl bg-vishva-900/50 border border-vishva-800 flex items-center justify-center shrink-0">
          <Bot className="w-6 h-6 text-vishva-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
          <p className="text-gray-400 text-sm">
            by {agent.author} · v{agent.version}
          </p>
          <p className="text-gray-300 mt-2">{agent.description}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-800">
        {(["run", "history", "details"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px
              ${activeTab === tab
                ? "border-vishva-500 text-vishva-400"
                : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "run" && (
        <AgentRunner agentId={agentId} agentName={agent.name} />
      )}

      {activeTab === "history" && (
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="card p-8 text-center text-gray-500">
              No run history yet. Run the agent to see results here.
            </div>
          ) : (
            history.map((run) => <HistoryEntry key={run.run_id} run={run} />)
          )}
        </div>
      )}

      {activeTab === "details" && (
        <div className="card p-6 space-y-4">
          <DetailRow label="Name" value={agent.manifest?.name} />
          <DetailRow label="Version" value={agent.manifest?.version} />
          <DetailRow label="Author" value={agent.manifest?.author} />
          <DetailRow label="License" value={agent.manifest?.license ?? "MIT"} />
          <DetailRow
            label="Preferred Model"
            value={agent.manifest?.runtime?.preferred_model}
          />
          <DetailRow
            label="Supports Ollama"
            value={agent.manifest?.runtime?.supports_ollama ? "Yes" : "No"}
          />
          <DetailRow
            label="Memory"
            value={agent.manifest?.memory?.enabled
              ? `${agent.manifest.memory.type} (${agent.manifest.memory.max_tokens} tokens)`
              : "Disabled"}
          />
          {agent.manifest?.tools?.length > 0 && (
            <div>
              <p className="text-gray-500 text-sm mb-2">Tools</p>
              <div className="flex flex-wrap gap-2">
                {agent.manifest.tools.map((t: string) => (
                  <span key={t} className="badge bg-gray-800 text-gray-300">
                    <Tag className="w-3 h-3 mr-1" />{t}
                  </span>
                ))}
              </div>
            </div>
          )}
          {agent.manifest?.metadata?.tags?.length > 0 && (
            <div>
              <p className="text-gray-500 text-sm mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {agent.manifest.metadata.tags.map((tag: string) => (
                  <span key={tag} className="badge bg-vishva-900/30 text-vishva-300 border border-vishva-800/40">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-4">
      <p className="text-gray-500 text-sm w-36 shrink-0">{label}</p>
      <p className="text-gray-200 text-sm">{value}</p>
    </div>
  );
}

function HistoryEntry({ run }: { run: RunRecord }) {
  const [expanded, setExpanded] = useState(false);
  const statusColors: Record<string, string> = {
    completed: "bg-green-900/50 text-green-300 border-green-800",
    failed: "bg-red-900/50 text-red-300 border-red-800",
    running: "bg-yellow-900/50 text-yellow-300 border-yellow-800",
  };

  return (
    <div className="card p-4 hover:border-gray-700 transition-colors cursor-pointer" onClick={() => setExpanded(!expanded)}>
      <div className="flex items-start gap-3">
        <Clock className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-200 truncate">{run.input_text}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {new Date(run.started_at).toLocaleString()}
          </p>
        </div>
        <span className={`badge border ${statusColors[run.status] ?? "bg-gray-800 text-gray-400"}`}>
          {run.status}
        </span>
      </div>
      {expanded && run.output_text && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          <p className="text-sm text-gray-300 whitespace-pre-wrap">{run.output_text}</p>
        </div>
      )}
    </div>
  );
}
