-- ══════════════════════════════════════════════════════
-- RSP.ai Database Schema
-- Run this in Supabase SQL Editor (supabase.com → SQL)
-- ══════════════════════════════════════════════════════

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  stage TEXT DEFAULT '',
  sector TEXT DEFAULT '',
  health TEXT DEFAULT 'green',
  invested TEXT DEFAULT '',
  deployed TEXT DEFAULT '',
  ownership TEXT DEFAULT '',
  board TEXT DEFAULT '',
  logo TEXT DEFAULT '',
  sp_folder TEXT DEFAULT '',
  sp_group TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TEXT DEFAULT '',
  snippet TEXT DEFAULT '',
  source TEXT DEFAULT 'SharePoint',
  folder TEXT DEFAULT '',
  source_url TEXT DEFAULT '',
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE initiatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'not-started',
  owner TEXT DEFAULT '',
  due_date TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  source_play TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  insight TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE play_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT UNIQUE NOT NULL,
  title TEXT DEFAULT '',
  category TEXT DEFAULT '',
  summary TEXT DEFAULT '',
  cached_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_materials_company ON materials(company_id);
CREATE INDEX idx_initiatives_company ON initiatives(company_id);
CREATE INDEX idx_memory_company ON memory(company_id);

-- Disable RLS for simplicity (add auth later)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for service role" ON companies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON materials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON initiatives FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON memory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON play_details FOR ALL USING (true) WITH CHECK (true);
