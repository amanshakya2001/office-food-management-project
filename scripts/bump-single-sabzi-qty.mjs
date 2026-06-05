import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://isirwoamqrruzpzlywgc.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzaXJ3b2FtcXJydXpwemx5d2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNTA2OTksImV4cCI6MjA5MjkyNjY5OX0.eusTfhFfsaYEopJlq3MEyJDwldrx_ZvJbQB8e1wFnoo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const EXCLUDE_IDS = new Set([14, 68, 87]);
const DRY_RUN = process.argv.includes('--apply') ? false : true;

const { data, error } = await supabase
  .from('meal_entries')
  .select(
    'id, meal_description, person:persons(name), day_entry:day_entries(date), meal_entry_dishes(id, qty, dish:dishes(id, name, is_countable, price))'
  );
if (error) throw error;

const targets = [];
for (const meal of data) {
  if (EXCLUDE_IDS.has(meal.id)) continue;
  const meds = meal.meal_entry_dishes ?? [];
  const sabziLinks = meds.filter(
    (med) => med.dish && med.dish.is_countable === false && Number(med.dish.price) === 0
  );
  if (sabziLinks.length !== 1) continue;
  const link = sabziLinks[0];
  targets.push({
    medId: link.id,
    currentQty: link.qty,
    mealId: meal.id,
    date: meal.day_entry?.date,
    person: meal.person?.name,
    sabzi: link.dish.name,
    desc: meal.meal_description,
  });
}

console.log(`Target rows: ${targets.length}`);
console.log(DRY_RUN ? '[DRY RUN — pass --apply to actually update]\n' : '[APPLYING UPDATES]\n');

for (const t of targets) {
  console.log(
    `med_id=${t.medId}  meal=#${t.mealId}  ${t.date}  ${t.person}  [${t.sabzi}]  qty ${t.currentQty} -> 2`
  );
}

if (DRY_RUN) {
  console.log('\nNothing written. Re-run with --apply to update.');
  process.exit(0);
}

let ok = 0;
let skipped = 0;
let failed = 0;
for (const t of targets) {
  if (t.currentQty === 2) {
    skipped++;
    continue;
  }
  const { error: uErr } = await supabase
    .from('meal_entry_dishes')
    .update({ qty: 2 })
    .eq('id', t.medId);
  if (uErr) {
    console.error(`FAILED med_id=${t.medId}: ${uErr.message}`);
    failed++;
  } else {
    ok++;
  }
}
console.log(`\nUpdated: ${ok}  Already qty=2: ${skipped}  Failed: ${failed}`);
