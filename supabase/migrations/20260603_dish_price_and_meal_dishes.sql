-- Add price to dishes. Default 0 = shared / split-among-eaters.
ALTER TABLE dishes
  ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) NOT NULL DEFAULT 0;

-- Structured link between a meal entry and the dishes that meal contained.
-- qty is the multiplier for countable dishes (e.g. 3 rotis). Non-countable dishes use qty=1.
CREATE TABLE IF NOT EXISTS meal_entry_dishes (
  id BIGSERIAL PRIMARY KEY,
  meal_entry_id BIGINT NOT NULL REFERENCES meal_entries(id) ON DELETE CASCADE,
  dish_id BIGINT NOT NULL REFERENCES dishes(id) ON DELETE RESTRICT,
  qty INTEGER NOT NULL DEFAULT 1 CHECK (qty > 0),
  UNIQUE (meal_entry_id, dish_id)
);

CREATE INDEX IF NOT EXISTS meal_entry_dishes_meal_entry_idx
  ON meal_entry_dishes (meal_entry_id);
