"use client";

import { useEffect, useState } from "react";
import { Clock, Trash2, ChevronDown, ChevronRight, Search } from "lucide-react";
import { api } from "@/lib/api";
import type { RunRecord } from "@/lib/types";

export default function HistoryPage() {
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function loadHistory() {
    try {
      const res = await api.get("/api/run/history?limit=100");
      setRuns(res.data ?? []);
    } catch {
      setRuns([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadHistory(); }, []);

  async function handleDelete(runId: string) {
    try {
      await api.delete(`/api/run/history/${runId}`);
      setRuns((prev) => prev.filter((r) => r.run_id !== runId));
    } catch {
      // ignore
    }
  }

  const filtered = runs.filter(
    (r) =>
      r.agent_id.includes(search) ||
      r.input_text.toLowerCase().includes(search.toLowerCase()),
  );

  const statusColors: Record<string, string> = {
    completed: "bg-green-900/50 text-green-300 border border-green-800",
    failed: "bg-red-900/50 text-red-300 border border-red-800",
    running: "bg-yellow-900/50 text-yellow-300 border border-yellow-800",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Run History</h1>
          <p className="text-gray-400 mt-1">{runs.length} run{runs.length !== 1 ? "s" : ""} recorded</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search runs..."
          className="input pl-10"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse h-16" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Clock className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400">
            {search ? "No runs match your search." : "No runs yet. Run an agent to see history here."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((run) => (
            <div key={run.run_id} className="card overflow-hidden">
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-800/50 transition-colors"
                onClick={() => setExpandedId(expandedId === run.run_id ? null : run.run_id)}
              >
                {expandedId === run.run_id ? (
                  <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-vishva-400">{run.agent_id}</span>
                    <span className={`badge text-xs ${statusColors[run.status] ?? "bg-gray-800 text-gray-400"}`}>
                      {run.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 truncate">{run.input_text}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-gray-500">
                    {new Date(run.started_at).toLocaleString()}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(run.run_id); }}
                    className="p-1 text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {expandedId === run.run_id && (
                <div className="px-4 pb-4 pt-1 border-t border-gray-800 space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Input</p>
                    <p className="text-sm text-gray-300 bg-gray-800/50 rounded-lg p-3">{run.input_text}</p>
                  </div>
                  {run.output_text && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Output</p>
                      <p className="text-sm text-gray-300 bg-gray-800/50 rounded-lg p-3 whitespace-pre-wrap">
                        {run.output_text}
                      </p>
                    </div>
                  )}
                  {run.error && (
                    <div>
                      <p className="text-xs text-red-400 mb-1">Error</p>
                      <p className="text-sm text-red-300 bg-red-950/30 rounded-lg p-3 font-mono">{run.error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
