# FxLens

FxLens is a Next.js workspace for Power Apps teams. The project is currently in **Phase 2: API-backed studio foundations**: the app has a shared workspace shell, typed request/response contracts, validated server routes, OpenAI-powered generation hooks, and mock fallbacks, but most studio pages are still placeholder UIs rather than fully wired end-to-end workflows.

## What is functional today

### Working server capabilities
- **Scope Studio**: `POST /api/scope` validates input, calls OpenAI when configured, and falls back to deterministic mock scoping output if the model call fails.
- **Build Studio**: `POST /api/generate` validates build requests, supports OpenAI generation, and falls back to mock blueprint/component/formula output.
- **Analyze Studio**: `POST /api/analyze` validates analyzer requests, supports OpenAI generation, and falls back to mock optimization output.
- **Recommendation Engine**: `POST /api/recommend` returns mock recommendations.
- **Solution Review**: `POST /api/solution-review` returns mock review output.

### UI status
- **Landing page and workspace shell** are implemented.
- **Scope Studio, Build Studio, and Analyze Studio pages** exist in the app shell, but the visible page experiences are still mostly placeholders/sample panels.
- **Dashboard, History, Prompts, Settings, and Solution Review pages** are navigable placeholders only.

## Environment and setup

### Requirements
- Node.js 20+ recommended
- npm

### Install and run
```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Environment variables
Create a local `.env.local` file if you want live OpenAI responses instead of mock fallback responses:

```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4.1-mini
OPENAI_API_URL=https://api.openai.com/v1/chat/completions
```

Notes:
- `OPENAI_API_KEY` is required for live model calls.
- `OPENAI_MODEL` and `OPENAI_API_URL` are optional because the app already defaults them.
- If OpenAI is not configured, or the request fails, Scope/Build/Analyze routes fall back to mock data.

## Recommended development workflow

Use Codex for **small, focused tasks** on short-lived branches instead of batching unrelated work together.

1. Create a narrow branch for one change, such as `codex/readme-phase-2` or `codex/wire-scope-form`.
2. Ask Codex to make that single change, verify it, and keep the diff small.
3. Run local checks (`npm run lint`, `npm run typecheck`) before committing.
4. Open a PR, merge, and start the next small branch.

This keeps reviews fast, reduces merge conflicts, and makes it easier to track which Phase 2 capability changed.
