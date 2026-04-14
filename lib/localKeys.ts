/**
 * Local API Key Manager
 *
 * API keys are stored ONLY in browser localStorage.
 * They are NEVER sent to the kernel, never sent to any backend,
 * and never persisted anywhere other than localStorage.
 *
 * When an agent is run, the key is read here and passed directly
 * in the X-LLM-API-Key header to the kernel, which forwards it to
 * the LLM provider. The kernel never stores it.
 */

const KEY_PREFIX = "vishva_apikey_";

/**
 * Store a provider API key in localStorage.
 * @param provider - e.g. "openai", "anthropic"
 * @param key - The raw API key string
 */
export function setApiKey(provider: string, key: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${KEY_PREFIX}${provider}`, key);
}

/**
 * Retrieve a stored API key for a provider.
 * Returns null if not set.
 */
export function getApiKey(provider: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`${KEY_PREFIX}${provider}`);
}

/**
 * Remove a stored API key.
 */
export function clearApiKey(provider: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`${KEY_PREFIX}${provider}`);
}

/**
 * Check if an API key has been configured for a provider.
 */
export function hasApiKey(provider: string): boolean {
  return Boolean(getApiKey(provider));
}

/**
 * Get the default provider from localStorage settings.
 */
export function getDefaultProvider(): string {
  if (typeof window === "undefined") return "openai";
  return localStorage.getItem("vishva_default_provider") ?? "openai";
}

/**
 * Get the Ollama server URL from localStorage settings.
 */
export function getOllamaUrl(): string {
  if (typeof window === "undefined") return "http://localhost:11434";
  return localStorage.getItem("vishva_ollama_url") ?? "http://localhost:11434";
}
