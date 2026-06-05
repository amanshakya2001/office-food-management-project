-- Per-dish weight used to size shared-pool portions.
-- 1.0 = one "full meal unit" of shared food. Roti=0.3, Dal=0.5, etc.
ALTER TABLE dishes
  ADD COLUMN IF NOT EXISTS weight NUMERIC(4, 2) NOT NULL DEFAULT 1.0
  CHECK (weight >= 0);
