-- ============================================================
-- diana_ops — Full Supabase Schema Migration
-- Project: tvblcyopotvqcrzrvolz
-- Run this in the Supabase SQL Editor (Dashboard → SQL)
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. diana_portal_config — key-value app configuration
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS diana_portal_config (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- ────────────────────────────────────────────────────────────
-- 2. diana_portal_entries — main entries (8 categories)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS diana_portal_entries (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  content          TEXT NOT NULL DEFAULT '',
  category         TEXT NOT NULL CHECK (category IN (
                     'finance','taxes','health','social','ideas','goals','spiritual','music'
                   )),
  subcategory      TEXT,
  tags             TEXT[] DEFAULT '{}',
  owner            TEXT NOT NULL DEFAULT 'shared' CHECK (owner IN ('diana','shared')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  github_path      TEXT,
  embedding        VECTOR(1536),  -- for future vector search (requires pgvector extension)

  -- Finance-specific
  amount           NUMERIC,
  is_recurring     BOOLEAN DEFAULT false,
  frequency        TEXT,
  due_date         DATE,

  -- Tax-specific
  tax_year         INTEGER,
  document_type    TEXT,
  tax_status       TEXT,

  -- Health-specific
  health_type      TEXT,
  appointment_date DATE,
  provider         TEXT,

  -- Social-specific
  event_date       DATE,
  people_involved  TEXT[],
  location         TEXT,

  -- Ideas-specific
  idea_status      TEXT,
  sparked_by       TEXT,

  -- Goals-specific
  goal_status      TEXT,
  target_date      DATE,
  progress_percent INTEGER DEFAULT 0,
  milestones       JSONB DEFAULT '[]'
);

-- Full-text search column (generated from title + content)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'diana_portal_entries' AND column_name = 'fts'
  ) THEN
    ALTER TABLE diana_portal_entries
      ADD COLUMN fts TSVECTOR
      GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))
      ) STORED;
  END IF;
END $$;

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_entries_updated_at ON diana_portal_entries;
CREATE TRIGGER trg_entries_updated_at
  BEFORE UPDATE ON diana_portal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_entries_category   ON diana_portal_entries (category);
CREATE INDEX IF NOT EXISTS idx_entries_owner      ON diana_portal_entries (owner);
CREATE INDEX IF NOT EXISTS idx_entries_updated_at ON diana_portal_entries (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_entries_fts        ON diana_portal_entries USING GIN (fts);
CREATE INDEX IF NOT EXISTS idx_entries_tags       ON diana_portal_entries USING GIN (tags);

-- ────────────────────────────────────────────────────────────
-- 3. grocery_receipts — receipt metadata
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS grocery_receipts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name   TEXT NOT NULL,
  receipt_date DATE NOT NULL,
  subtotal     NUMERIC NOT NULL DEFAULT 0,
  tax          NUMERIC NOT NULL DEFAULT 0,
  total        NUMERIC NOT NULL DEFAULT 0,
  raw_text     TEXT,
  owner        TEXT NOT NULL DEFAULT 'shared' CHECK (owner IN ('diana','shared')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_receipts_updated_at ON grocery_receipts;
CREATE TRIGGER trg_receipts_updated_at
  BEFORE UPDATE ON grocery_receipts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_receipts_date  ON grocery_receipts (receipt_date DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_owner ON grocery_receipts (owner);

-- ────────────────────────────────────────────────────────────
-- 4. grocery_items — individual line items
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS grocery_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id  UUID REFERENCES grocery_receipts(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  price       NUMERIC NOT NULL DEFAULT 0,
  quantity    NUMERIC NOT NULL DEFAULT 1,
  unit_price  NUMERIC,
  category    TEXT NOT NULL DEFAULT 'other' CHECK (category IN (
                'fruits_veggies','legumes_grains','dairy','meats_seafood',
                'cleaning_household','protein_supplements','beverages',
                'snacks_sweets','bakery_bread','frozen_prepared',
                'condiments_spices','personal_care','other'
              )),
  tax_amount  NUMERIC NOT NULL DEFAULT 0,
  owner       TEXT NOT NULL DEFAULT 'shared' CHECK (owner IN ('diana','shared')),
  item_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  is_manual   BOOLEAN NOT NULL DEFAULT false,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_items_receipt  ON grocery_items (receipt_id);
CREATE INDEX IF NOT EXISTS idx_items_date     ON grocery_items (item_date DESC);
CREATE INDEX IF NOT EXISTS idx_items_category ON grocery_items (category);
CREATE INDEX IF NOT EXISTS idx_items_owner    ON grocery_items (owner);

-- ────────────────────────────────────────────────────────────
-- 5. diana_health_reports — lab reports & health data
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS diana_health_reports (
  id          TEXT PRIMARY KEY,
  person      TEXT NOT NULL CHECK (person IN ('liz','julian')),
  date        DATE NOT NULL,
  report_data JSONB NOT NULL DEFAULT '{}',
  is_hidden   BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_health_person ON diana_health_reports (person);
CREATE INDEX IF NOT EXISTS idx_health_date   ON diana_health_reports (date DESC);

-- ────────────────────────────────────────────────────────────
-- 6. Row Level Security (RLS) — permissive for anon/authenticated
--    Since this is a personal app with password gate auth,
--    we allow full access for authenticated users.
-- ────────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE diana_portal_config  ENABLE ROW LEVEL SECURITY;
ALTER TABLE diana_portal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_receipts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE diana_health_reports ENABLE ROW LEVEL SECURITY;

-- Allow full access for authenticated users
CREATE POLICY IF NOT EXISTS "auth_full_access" ON diana_portal_config
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "auth_full_access" ON diana_portal_entries
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "auth_full_access" ON grocery_receipts
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "auth_full_access" ON grocery_items
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "auth_full_access" ON diana_health_reports
  FOR ALL USING (auth.role() = 'authenticated');

-- Also allow anon read on config (for password gate to work before login)
CREATE POLICY IF NOT EXISTS "anon_read_config" ON diana_portal_config
  FOR SELECT USING (true);

-- ────────────────────────────────────────────────────────────
-- 7. Optional: Enable pgvector for future embedding search
-- ────────────────────────────────────────────────────────────
-- Uncomment if you want vector similarity search:
-- CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- Done! All 5 tables created with indexes, triggers, and RLS.
-- ============================================================
