# FxLens

FxLens is a Next.js workspace for Power Apps teams. The project is now in **Phase 3: foundation for persisted studio workflows**. The app includes typed server routes, OpenAI-backed generation with mock fallbacks, and the first workspace foundations for saving and revisiting studio output through Run History and reusable Templates.

## What is functional today

### Studio APIs
- **Scope Studio**: `POST /api/scope` validates requests, calls OpenAI when configured, and falls back to deterministic mock scoping output.
- **Build Studio**: `POST /api/generate` validates requests, supports OpenAI generation, and falls back to mock blueprint/component/formula output.
- **Analyze Studio**: `POST /api/analyze` validates requests, supports OpenAI generation, and falls back to mock optimization output.
- **Recommendation Engine**: `POST /api/recommend` returns mock recommendations.
- **Solution Review**: `POST /api/solution-review` returns mock review output.

### Phase 3 foundation
- **Persisted studio runs**: FxLens now treats studio output as reusable run data instead of one-off responses, laying the groundwork for durable workspace records.
- **Run History**: the workspace includes a dedicated History area for reviewing prior runs and analysis snapshots.
- **Templates**: the workspace includes a Prompts/Templates area for standardizing reusable prompt patterns across teams.

### UI status
- **Landing page and workspace shell** are implemented.
- **Scope Studio, Build Studio, and Analyze Studio** are the primary interactive studio surfaces.
- **History and Prompts/Templates** are part of the Phase 3 foundation and are represented in the app shell as the home for saved runs and reusable templates.
- **Dashboard, Settings, and some supporting pages** remain light-weight while the persisted workflow foundation is expanded.

## Environment and setup

### Requirements
- Node.js 20+
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
- `OPENAI_MODEL` and `OPENAI_API_URL` are optional because FxLens provides defaults.
- **Phase 3 adds no new required environment variables yet.** If OpenAI is not configured, studio routes continue to fall back to mock data.

## Recommended development workflow

Use Codex for **small, focused tasks** on short-lived branches instead of batching unrelated work together.

1. Create a narrow branch for one change, such as `codex/readme-phase-3` or `codex/history-copy`.
2. Ask Codex to make that single change, verify it, and keep the diff small.
3. Run local checks (`npm run lint`, `npm run typecheck`) before committing.
4. Open a PR, merge, and start the next small branch.

This keeps reviews fast, reduces merge conflicts, and makes it easier to track which Phase 3 foundation capability changed.
