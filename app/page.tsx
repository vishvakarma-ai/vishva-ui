"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bot, Zap, Clock, TrendingUp, ArrowRight, Play } from "lucide-react";
import { api } from "@/lib/api";
import type { Agent, RunRecord } from "@/lib/types";

export default function DashboardPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [recentRuns, setRecentRuns] = useState<RunRecord[]>([]);
  const [kernelOnline, setKernelOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [healthRes, agentsRes, runsRes] = await Promise.allSettled([
          api.get("/api/health"),
          api.get("/api/agents"),
          api.get("/api/run/history?limit=5"),
        ]);

        if (healthRes.status === "fulfilled") setKernelOnline(true);
        if (agentsRes.status === "fulfilled") setAgents(agentsRes.value.data ?? []);
        if (runsRes.status === "fulfilled") setRecentRuns(runsRes.value.data ?? []);
      } catch {
        // Kernel may be offline
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Your AI Agent Operating System</p>
      </div>

      {/* Kernel status banner */}
      {!loading && !kernelOnline && (
        <div className="card p-4 border-yellow-700 bg-yellow-950/30 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
          <p className="text-yellow-300 text-sm">
            Vishva Kernel is not running.{" "}
            <span className="font-mono bg-gray-800 px-1.5 py-0.5 rounded text-xs">
              vk serve
            </span>{" "}
            to start it.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<Bot className="w-5 h-5 text-vishva-400" />}
          label="Installed Agents"
          value={agents.length.toString()}
          href="/agents"
        />
        <StatCard
          icon={<Zap className="w-5 h-5 text-green-400" />}
          label="Total Runs"
          value={recentRuns.length > 0 ? `${recentRuns.length}+` : "0"}
          href="/history"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
          label="Kernel Status"
          value={kernelOnline ? "Online" : "Offline"}
          valueClass={kernelOnline ? "text-green-400" : "text-red-400"}
          href="/settings"
        />
      </div>

      {/* Installed agents */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Installed Agents</h2>
          <Link href="/agents" className="text-vishva-400 hover:text-vishva-300 text-sm flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {agents.length === 0 ? (
          <div className="card p-8 text-center">
            <Bot className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No agents installed yet.</p>
            <Link href="/marketplace" className="btn-primary mt-4 inline-flex">
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.slice(0, 6).map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </section>

      {/* Recent runs */}
      {recentRuns.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Runs</h2>
            <Link href="/history" className="text-vishva-400 hover:text-vishva-300 text-sm flex items-center gap-1">
              Full history <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="card divide-y divide-gray-800">
            {recentRuns.map((run) => (
              <RunRow key={run.run_id} run={run} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({
  icon, label, value, href, valueClass = "text-white",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  valueClass?: string;
}) {
  return (
    <Link href={href} className="card p-5 hover:border-gray-700 transition-colors group">
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <p className={`text-3xl font-bold ${valueClass}`}>{value}</p>
    </Link>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div className="card p-5 hover:border-gray-700 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-vishva-900/50 border border-vishva-800 flex items-center justify-center">
          <Bot className="w-5 h-5 text-vishva-400" />
        </div>
        <span className="badge bg-gray-800 text-gray-400">v{agent.version}</span>
      </div>
      <h3 className="font-semibold text-white mb-1">{agent.name}</h3>
      <p className="text-gray-400 text-sm line-clamp-2 mb-4">{agent.description}</p>
      <Link
        href={`/agents/${agent.id}`}
        className="btn-primary w-full justify-center text-sm py-1.5"
      >
        <Play className="w-3.5 h-3.5" /> Run
      </Link>
    </div>
  );
}

function RunRow({ run }: { run: RunRecord }) {
  const statusColors: Record<string, string> = {
    completed: "text-green-400",
    running: "text-yellow-400",
    failed: "text-red-400",
  };

  return (
    <div className="flex items-center gap-4 px-5 py-3">
      <Clock className="w-4 h-4 text-gray-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{run.agent_id}</p>
        <p className="text-xs text-gray-500 truncate">{run.input_text}</p>
      </div>
      <span className={`text-xs font-medium ${statusColors[run.status] ?? "text-gray-400"}`}>
        {run.status}
      </span>
    </div>
  );
}
