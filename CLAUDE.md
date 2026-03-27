# CLAUDE.md — diana_ops (Diana Portal Web)

## Project Overview

Personal life assistant web app for Diana. A **React + TypeScript + Vite** frontend with Supabase backend.

- **Live URL:** diana.treedigits.ca
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4, shadcn/ui, Zustand, TanStack Query, Recharts
- **Database**: Supabase (shared with treecab and treedigits-main)
- **Testing**: Vitest + React Testing Library
- **Deployment**: Vercel (project: treedigits-main/diana-portal-web — separate from treecab)

### Supabase Project (shared with treecab & treedigits-main)

| Field | Value |
|-------|-------|
| Project Ref | `tvblcyopotvqcrzrvolz` |
| Project URL | `https://tvblcyopotvqcrzrvolz.supabase.co` |

**IMPORTANT**: This is a dedicated Supabase project for diana_ops.

- Auth uses a simple PasswordGate with SHA-256 hash stored in `diana_portal_config` table (key: `password_hash`)
- Password secret is referenced as `DIANA_MAIN_PASS` environment variable

## Autonomous Operation Mode

**IMPORTANT**: Operate autonomously — make changes, commit, and push without asking permission. Only ask when genuinely blocked.

### Commit & Push Policy
After completing any task: `git add` → commit → **`git push` immediately**.

### Git Sync Command
When user says **"git sync"**:
1. Push current branch to origin
2. Stash uncommitted changes
3. `git checkout main && git pull origin main`
4. `git merge <current-branch> --no-edit` → `git push origin main`
5. `git checkout <current-branch> && git stash pop`

If merge conflicts occur, resolve and push. Always return to original branch.

### Commit Message Format
- **No AI attribution** — no "Co-Authored-By: Claude", no "Generated with Claude Code"
- Clean, professional messages as if written by a human developer
- **Enforced by hook**: `commit-message-format.py` blocks violating commits

### Task Completion Summary (MANDATORY)
After ANY task, print:
```text
## Completed
- [one bullet per change, with file paths]
- Committed: "commit message"
\x1b[32mUser Prompt: "original request"\x1b[0m
```

## Git Workflow
- Run `git branch --show-current` before any commit or merge
- Verify merge target branch before merging PRs

## Build & Dev
```bash
npm run dev          # Local dev server
npm run build        # Production build (tsc + vite, must pass before commit)
npm run lint         # ESLint check
npm run test         # Vitest watch mode
npm run test:run     # Vitest single run
```

- **Enforced by hook**: `pre-commit-build-check.sh` runs build before commits

## Testing & Verification
- Unit tests: `npm run test:run`
- Max **2 attempts** clicking around Playwright UI — then ask the user

## Fix Verification
- **Grep ALL instances** of the same pattern before committing any fix
- Check related edge cases after partial fixes
- **Enforced by hook**: `grep-before-fix-reminder.py` reminds after edits

## Planning & Exploration
- Bias toward action. If planning takes >5 minutes, present what you have and ask.

## Bash Guidelines
- **Never** pipe through `head`, `tail`, `less`, `more` — causes output buffering issues
- Use command-specific flags instead (e.g., `git log -n 10` not `git log | head -10`)

## Directory Structure

```
diana_ops/
├── src/
│   ├── assets/        # Static assets
│   ├── components/    # React components
│   ├── contexts/      # React contexts
│   ├── data/          # Static data
│   ├── lib/           # Utilities & Supabase client
│   ├── pages/         # Page components
│   ├── stores/        # Zustand stores
│   ├── test/          # Test utilities
│   └── types/         # TypeScript types
├── public/            # Public static files
├── docs/              # Documentation
├── dist/              # Build output (gitignored)
└── .claude/           # Claude Code skills, hooks, commands
```

## Naming Conventions

- **Supabase tables**: use `diana_portal_` or `diana_` prefix where applicable (shared project)
- **React components**: PascalCase (`.tsx`)
- **TypeScript modules**: camelCase or kebab-case
- **Skills**: kebab-case folders

## Key Tables (Supabase)
- `diana_portal_config` — app configuration (password hash, settings)
- Check other tables with: `SELECT tablename FROM pg_tables WHERE schemaname = 'public';`

## Security

NEVER add API tokens, keys, passwords, or credentials to `.env` files, config files, or source code. Reference environment variables by name only.

## MCP Tools

Use MCP tools directly — don't suggest CLI commands. Available: Supabase (`execute_sql`, `apply_migration`, `list_tables`, `get_logs`), GitHub (`create_pull_request`, `list_issues`, `push_files`).

## Communication Style

Explain things for a non-developer who is somewhat technical. Avoid jargon; when technical terms are needed, explain briefly.

## Problem-Solving Approach

Spawn multiple agents for different perspectives. Use parallel exploration before proposing solutions.

## Code Quality

- **Think first:** State assumptions, surface tradeoffs, ask if unclear.
- **Simplicity:** Minimum code to solve the problem. No speculative features or abstractions.
- **Surgical changes:** Touch only what you must. Match existing style. Clean up only your own mess.
- **Goal-driven:** Define success criteria, then loop until verified.

<!-- VERCEL BEST PRACTICES START -->
## Best practices for developing on Vercel

These defaults are optimized for AI coding agents (and humans) working on apps that deploy to Vercel.

- Treat Vercel Functions as stateless + ephemeral (no durable RAM/FS, no background daemons), use Blob or marketplace integrations for preserving state
- Edge Functions (standalone) are deprecated; prefer Vercel Functions
- Don't start new projects on Vercel KV/Postgres (both discontinued); use Marketplace Redis/Postgres instead
- Store secrets in Vercel Env Variables; not in git or `NEXT_PUBLIC_*`
- Provision Marketplace native integrations with `vercel integration add` (CI/agent-friendly)
- Sync env + project settings with `vercel env pull` / `vercel pull` when you need local/offline parity
- Use `waitUntil` for post-response work; avoid the deprecated Function `context` parameter
- Set Function regions near your primary data source; avoid cross-region DB/service roundtrips
- Tune Fluid Compute knobs (e.g., `maxDuration`, memory/CPU) for long I/O-heavy calls (LLMs, APIs)
- Use Runtime Cache for fast **regional** caching + tag invalidation (don't treat it as global KV)
- Use Cron Jobs for schedules; cron runs in UTC and triggers your production URL via HTTP GET
- Use Vercel Blob for uploads/media; Use Edge Config for small, globally-read config
- If Enable Deployment Protection is enabled, use a bypass secret to directly access them
- Add OpenTelemetry via `@vercel/otel` on Node; don't expect OTEL support on the Edge runtime
- Enable Web Analytics + Speed Insights early
- Use AI Gateway for model routing, set AI_GATEWAY_API_KEY, using a model string (e.g. 'anthropic/claude-sonnet-4.6'), Gateway is already default in AI SDK
  needed. Always curl https://ai-gateway.vercel.sh/v1/models first; never trust model IDs from memory
- For durable agent loops or untrusted code: use Workflow (pause/resume/state) + Sandbox; use Vercel MCP for secure infra access
<!-- VERCEL BEST PRACTICES END -->
