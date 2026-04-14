# Vishva UI

> The browser interface for Vishvakarma AI Agent OS — `localhost:3000`

Built with Next.js 14 (App Router), TypeScript, and Tailwind CSS. Dark mode by default.

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:3000
```

Requires the Vishva Kernel running at `localhost:8000`:
```bash
vk serve
```

## Pages

| Path | Description |
|---|---|
| `/` | Dashboard — installed agents, recent runs, kernel status |
| `/agents` | Browse installed agents |
| `/agents/[id]` | Agent detail, run interface, history |
| `/marketplace` | Browse Vishva Hub (cloud) agents |
| `/marketplace/[id]` | Agent detail, install button |
| `/settings` | API key management, provider config |
| `/history` | All past agent runs |

## API Key Security

**API keys are stored ONLY in `localStorage`.** They are never:
- Sent to the Vishva Kernel server
- Transmitted to any backend
- Logged or persisted anywhere else

When you run an agent, the key is read from localStorage and sent directly
in the `X-LLM-API-Key` HTTP header to the kernel. The kernel forwards it to
the LLM provider (OpenAI, Anthropic) and discards it immediately.

The Settings page includes a visible privacy notice explaining this.

## Environment

```bash
# .env.local
NEXT_PUBLIC_KERNEL_URL=http://localhost:8000
```

## Stack

- **Next.js 14** App Router
- **TypeScript** strict mode
- **Tailwind CSS** with dark mode
- **SSE streaming** for real-time agent output
- **lucide-react** for icons
