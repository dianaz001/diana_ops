Scan this codebase and produce a detailed cost estimation report showing what this project would have cost a real team to build, versus what it cost with AI assistance.

## Step 1: Gather Metrics

Use Glob and Grep tools to collect these metrics (do NOT guess — count actual files):

1. **TypeScript source files**: Count `.tsx`, `.ts` files in `src/`
2. **Lines of code**: Use `wc -l` via Bash on `src/`
3. **React components**: Count component files in `src/components/`
4. **Pages**: Count files in `src/pages/`
5. **Stores**: Count Zustand stores in `src/stores/`
6. **Test files**: Count files in `src/test/`
7. **External integrations**: Grep for imports (supabase, recharts, zustand, tanstack, etc.)
8. **Git history**: Use `git log --oneline` to count commits, `git log --format=%aI` for duration

## Step 2: Calculate Estimates

Use these industry rates (2025-2026 US market):

| Role | Rate/hr | Notes |
|------|---------|-------|
| Senior Frontend Dev | $130/hr | React + TypeScript |
| UI/UX Designer | $100/hr | Design system, dark mode |
| DevOps Engineer | $140/hr | Supabase, Vercel |
| QA Engineer | $90/hr | Testing |

## Step 3: Output Report

Format as a clean markdown table with line items and totals.

## Rules

- Use ACTUAL file counts — never guess
- Round appropriately
- Be conservative — real projects cost MORE
- Include git commit count and project age
