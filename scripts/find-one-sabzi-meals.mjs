import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://isirwoamqrruzpzlywgc.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzaXJ3b2FtcXJydXpwemx5d2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNTA2OTksImV4cCI6MjA5MjkyNjY5OX0.eusTfhFfsaYEopJlq3MEyJDwldrx_ZvJbQB8e1wFnoo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const { data, error } = await supabase
  .from('meal_entries')
  .select(
    'id, meal_description, person:persons(name), day_entry:day_entries(date), meal_entry_dishes(dish:dishes(id, name, is_countable, price))'
  );
if (error) throw error;

const EXCLUDE_IDS = new Set([14, 68, 87]);

const matches = data
  .filter((m) => !EXCLUDE_IDS.has(m.id))
  .map((m) => {
    const dishes = (m.meal_entry_dishes ?? []).map((med) => med.dish).filter(Boolean);
    const uncountable = dishes.filter((d) => d.is_countable === false);
    return { meal: m, uncountable };
  })
  .filter(({ uncountable }) => uncountable.length === 1 && Number(uncountable[0].price) === 0);

matches.sort((a, b) => {
  const da = a.meal.day_entry?.date ?? '';
  const db = b.meal.day_entry?.date ?? '';
  return da.localeCompare(db) || a.meal.id - b.meal.id;
});

console.log(`Found ${matches.length} meal(s) with exactly one non-countable dish:\n`);
for (const { meal, uncountable } of matches) {
  const date = meal.day_entry?.date ?? '?';
  const who = meal.person?.name ?? '?';
  const sabzi = uncountable[0].name;
  console.log(
    `#${meal.id}  ${date}  ${who}  [sabzi: ${sabzi}]  desc: ${meal.meal_description}`
  );
}
