# dtverify Report — Supabase Auth Migration

**Date:** 2026-03-20
**Scope:** Replace password gate with Supabase Auth email/password login
**Site:** https://juliz.treedigits.ca

## Changes

### Auth Store (`src/stores/authStore.ts`)
- Replaced custom SHA-256 hash + `juliz_portal_config` lookup with `supabase.auth.signInWithPassword()`
- Replaced custom session table logic with `supabase.auth.getSession()`
- Logout now calls `supabase.auth.signOut()`
- Removed `zustand/persist` middleware (Supabase handles session persistence)

### Login UI (`src/components/auth/PasswordGate.tsx`)
- Added email input field with mail icon
- Removed "Remember me" checkbox (Supabase handles session duration)
- Updated subtitle: "Sign in to continue"

### RLS Policies (Supabase migration: `switch_to_supabase_auth`)
- Removed anon policies on `juliz_portal_config` and `juliz_portal_sessions`
- Replaced generic `authenticated` policies with email-restricted policies on all juliz tables
- Only `julian@treedigits.ca` and `liz@treedigits.ca` can access data

### Tests (`src/test/auth.test.ts`)
- Rewritten to mock `supabase.auth` methods instead of `supabase.from()`

## Verification (Playwright on live site)

| Test | Result |
|------|--------|
| Email input renders | PASS |
| Password input renders | PASS |
| Sign in button renders | PASS |
| Wrong credentials show error | PASS ("Invalid login credentials") |
| Empty fields disable submit | PASS |

### Screenshots
- `260320-juliz-auth-login.png` — Clean login with email + password
- `260320-juliz-auth-wrong-creds.png` — Error state with invalid credentials
