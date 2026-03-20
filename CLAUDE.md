# CLAUDE.md — juliz-portal-web

## Project Overview
Personal life assistant web app for Julian & Liz.
- **Live URL:** juliz.treedigits.ca
- **Vercel project:** treedigits-main/juliz-portal-web (separate from treecab/treedigits-main)
- **Supabase project:** `wrvjvijhehyqzrowsfyv` (shared with treecab and treedigits-main)

## Infrastructure
- Supabase project is SHARED across juliz-portal-web, treecab, and treedigits-main
- Vercel project is SEPARATE — do not confuse with treedigits-main's Vercel project
- Auth uses a simple PasswordGate with SHA-256 hash stored in `juliz_portal_config` table (key: `password_hash`)
- Password secret is referenced as `JULIZ_MAIN_PASS` environment variable

## Tech Stack
React + TypeScript + Vite, Tailwind CSS + shadcn/ui, Supabase (shared project), Vercel deployment.

## Build & Dev
```bash
npm run dev          # Local dev server
npm run build        # Production build (must pass before commit)
npm run lint         # Lint check
```

## Key Tables (Supabase)
- `juliz_portal_config` — app configuration (password hash, settings)
- Check other tables with: `SELECT tablename FROM pg_tables WHERE schemaname = 'public';`
