export interface RuntimeInfo {
  preferred_model: string;
  min_model?: string;
  supports_ollama?: boolean;
  supports_local?: boolean;
  context_window?: number;
  streaming?: boolean;
}

export interface AgentMemory {
  enabled: boolean;
  type: "conversation" | "persistent" | "none";
  max_tokens?: number;
}

export interface AgentManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  license?: string;
  runtime: RuntimeInfo;
  tools?: string[];
  memory?: AgentMemory;
  metadata?: {
    tags?: string[];
    category?: string;
    homepage?: string;
    repository?: string;
  };
  entrypoint?: string;
  dependencies?: string[];
}

export interface Agent {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  manifest: AgentManifest;
}

export interface RunRecord {
  run_id: string;
  agent_id: string;
  session_id: string;
  input_text: string;
  output_text?: string;
  status: "running" | "completed" | "failed";
  error?: string;
  started_at: string;
  completed_at?: string;
}
