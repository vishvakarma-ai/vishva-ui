"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Shield, Save, Check, AlertTriangle } from "lucide-react";
import { getApiKey, setApiKey, clearApiKey, hasApiKey } from "@/lib/localKeys";

const PROVIDERS = [
  { id: "openai", label: "OpenAI", models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"] },
  { id: "anthropic", label: "Anthropic", models: ["claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"] },
  { id: "ollama", label: "Ollama (Local)", models: [] },
];

export default function SettingsPage() {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const [defaultProvider, setDefaultProvider] = useState("openai");

  useEffect(() => {
    // Load from localStorage only — never from server
    const loaded: Record<string, string> = {};
    for (const p of PROVIDERS) {
      if (p.id !== "ollama") {
        loaded[p.id] = getApiKey(p.id) ?? "";
      }
    }
    setKeys(loaded);

    const storedOllama = localStorage.getItem("vishva_ollama_url");
    if (storedOllama) setOllamaUrl(storedOllama);

    const storedProvider = localStorage.getItem("vishva_default_provider");
    if (storedProvider) setDefaultProvider(storedProvider);
  }, []);

  function handleSaveKey(providerId: string) {
    const key = keys[providerId] ?? "";
    if (key) {
      setApiKey(providerId, key);
    } else {
      clearApiKey(providerId);
    }
    setSaved((prev) => ({ ...prev, [providerId]: true }));
    setTimeout(() => setSaved((prev) => ({ ...prev, [providerId]: false })), 2000);
  }

  function handleSaveGeneral() {
    localStorage.setItem("vishva_ollama_url", ollamaUrl);
    localStorage.setItem("vishva_default_provider", defaultProvider);
    setSaved((prev) => ({ ...prev, general: true }));
    setTimeout(() => setSaved((prev) => ({ ...prev, general: false })), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Configure LLM providers and kernel preferences</p>
      </div>

      {/* Privacy notice */}
      <div className="card p-5 border-vishva-800 bg-vishva-950/20">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-vishva-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-vishva-300 mb-1">Your API Keys Are Private</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              API keys entered here are stored <strong className="text-white">only in your browser&apos;s
              localStorage</strong>. They are never sent to the Vishva Kernel, never logged, and
              never transmitted to any server. When you run an agent, your browser sends the key
              directly to the LLM provider (OpenAI, Anthropic, etc.).
            </p>
          </div>
        </div>
      </div>

      {/* API Keys */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">API Keys</h2>
        {PROVIDERS.filter((p) => p.id !== "ollama").map((provider) => (
          <div key={provider.id} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium text-white">{provider.label}</h3>
                {hasApiKey(provider.id) ? (
                  <p className="text-xs text-green-400 flex items-center gap-1 mt-0.5">
                    <Check className="w-3 h-3" /> Key configured
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-0.5">No key set</p>
                )}
              </div>
              {!hasApiKey(provider.id) && (
                <div className="flex items-center gap-1.5 text-yellow-600 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Required to run agents
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showKeys[provider.id] ? "text" : "password"}
                  value={keys[provider.id] ?? ""}
                  onChange={(e) => setKeys((prev) => ({ ...prev, [provider.id]: e.target.value }))}
                  placeholder={`${provider.id === "openai" ? "sk-..." : "sk-ant-..."}`}
                  className="input pr-10 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowKeys((prev) => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showKeys[provider.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={() => handleSaveKey(provider.id)}
                className={saved[provider.id] ? "btn-secondary text-green-400 border-green-800" : "btn-secondary"}
              >
                {saved[provider.id] ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved[provider.id] ? "Saved" : "Save"}
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Ollama Settings */}
      <section className="card p-5 space-y-4">
        <h2 className="text-xl font-semibold text-white">Ollama (Local LLMs)</h2>
        <p className="text-gray-400 text-sm">
          Ollama lets you run LLMs locally. No API key is needed.
          Download Ollama from{" "}
          <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="text-vishva-400 hover:underline">
            ollama.ai
          </a>
          .
        </p>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Ollama Server URL</label>
          <input
            type="text"
            value={ollamaUrl}
            onChange={(e) => setOllamaUrl(e.target.value)}
            className="input font-mono text-sm"
          />
        </div>
      </section>

      {/* General Settings */}
      <section className="card p-5 space-y-4">
        <h2 className="text-xl font-semibold text-white">General</h2>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Default Provider</label>
          <select
            value={defaultProvider}
            onChange={(e) => setDefaultProvider(e.target.value)}
            className="input"
          >
            {PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleSaveGeneral}
          className={saved.general ? "btn-primary bg-green-700 hover:bg-green-600" : "btn-primary"}
        >
          {saved.general ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved.general ? "Saved!" : "Save Settings"}
        </button>
      </section>

      {/* Data section */}
      <section className="card p-5 border-red-900/40">
        <h2 className="text-xl font-semibold text-white mb-3">Local Data</h2>
        <p className="text-gray-400 text-sm mb-4">
          Clear all locally stored API keys and settings from your browser.
        </p>
        <button
          onClick={() => {
            if (confirm("Clear all API keys and settings from localStorage?")) {
              localStorage.clear();
              setKeys({});
              setOllamaUrl("http://localhost:11434");
              setDefaultProvider("openai");
            }
          }}
          className="btn-danger"
        >
          Clear All Local Data
        </button>
      </section>
    </div>
  );
}
