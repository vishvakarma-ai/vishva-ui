"use client";

import { X, CheckCircle, Loader2 } from "lucide-react";

interface InstallProgressProps {
  agentName: string;
  events: string[];
  onClose: () => void;
}

/**
 * Modal overlay showing real-time agent installation progress.
 * Events come from the SSE stream on POST /api/agents/install.
 */
export function InstallProgress({ agentName, events, onClose }: InstallProgressProps) {
  const isDone = events.some((e) => e.toLowerCase().includes("success") || e.toLowerCase().includes("ready"));
  const hasError = events.some((e) => e.toLowerCase().startsWith("error"));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md p-6 shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Installing {agentName}</h3>
          {(isDone || hasError) && (
            <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="space-y-2 min-h-[100px] max-h-[240px] overflow-y-auto">
          {events.map((event, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              {i === events.length - 1 && !isDone && !hasError ? (
                <Loader2 className="w-3.5 h-3.5 text-vishva-400 animate-spin shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${hasError && i === events.length - 1 ? "text-red-400" : "text-green-400"}`} />
              )}
              <span className={`${hasError && i === events.length - 1 ? "text-red-300" : "text-gray-300"}`}>
                {event}
              </span>
            </div>
          ))}
        </div>

        {isDone && (
          <div className="mt-4 pt-4 border-t border-gray-800 flex justify-end">
            <button onClick={onClose} className="btn-primary text-sm">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
