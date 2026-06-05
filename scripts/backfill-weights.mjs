// Apply suggested per-dish weights. Run with --apply to write; default is dry-run.
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://isirwoamqrruzpzlywgc.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzaXJ3b2FtcXJydXpwemx5d2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNTA2OTksImV4cCI6MjA5MjkyNjY5OX0.eusTfhFfsaYEopJlq3MEyJDwldrx_ZvJbQB8e1wFnoo';

const APPLY = process.argv.includes('--apply');
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Weights agreed earlier. Dish names must match exactly.
// Priced dishes don't need a weight (the priced path ignores it), but set to 0
// or 1 just to keep DB tidy. We use 0 to make the intent explicit.
const WEIGHTS = {
  // Mains / sabzis
  'Aloo gobhi': 1.0,
  'Aloo Ki Sabzi': 1.0,
  'Aloo shimla': 1.0,
  'Baingan ki Sabzi': 1.0,
  'Bhindi masala': 1.0,
  'Chole': 1.0,
  'Diwani Handi': 1.0,
  'Ghiya Chaana': 1.0,
  'Karela': 1.0,
  'Mix veg': 1.0,
  'Mushroom': 1.0,
  'Paneer ki Sabzi': 1.0,
  'Rajma': 1.0,
  'Egg Curry': 1.0,
  'Egg burji': 1.0,
  'Dal': 0.5,
  'Kadhi': 0.5,
  'Soya chaap': 1.2,
  // Carbs
  'Rice': 1.0,
  'Roti': 0.3,
  'Plain paratha': 0.5,
  'Puri': 0.3,
  'Idli': 0.4,
  'Kadhi kachori': 1.0,
  // Sides / dessert
  'Gulab jamun': 0.2,
  // Priced dishes — weight not used; set to 0 to signal "not part of shared sizing"
  'Non Veg Thali': 0,
  'Veg Thali': 0,
  'Chicken Curry': 0,
  'Mix Parantha': 0,
  'Paneer Parantha': 0,
  'Aloo Parantha': 0,
  'Aloo Pyaaz Parantha': 0,
  'Chole Bhature': 0,
  'Gobhi Parantha': 0,
  'Raita': 0,
};

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY (will write)' : 'DRY-RUN (no writes)'}`);

  const { data: dishes, error } = await supabase.from('dishes').select('*').order('name');
  if (error) throw new Error(error.message);

  const updates = [];
  const missing = [];
  const noChange = [];

  for (const dish of dishes) {
    if (WEIGHTS[dish.name] === undefined) {
      missing.push(dish.name);
      continue;
    }
    const target = WEIGHTS[dish.name];
    const current = typeof dish.weight === 'string' ? parseFloat(dish.weight) : dish.weight;
    if (Math.abs(current - target) < 1e-6) {
      noChange.push(`  ${dish.name}: ${current} (already set)`);
    } else {
      updates.push({ dish, target, current });
    }
  }

  console.log('');
  console.log('=== UPDATES ===');
  updates.forEach((u) => {
    console.log(`  ${u.dish.name.padEnd(28)} ${String(u.current).padStart(4)} → ${u.target}`);
  });
  if (updates.length === 0) console.log('  (none)');

  if (missing.length > 0) {
    console.log('');
    console.log('=== NOT IN WEIGHT MAP (left untouched) ===');
    missing.forEach((m) => console.log(`  ${m}`));
  }

  if (noChange.length > 0) {
    console.log('');
    console.log('=== ALREADY MATCHING ===');
    noChange.forEach((n) => console.log(n));
  }

  if (!APPLY) {
    console.log('');
    console.log(`Dry-run done. ${updates.length} would change. Re-run with --apply to write.`);
    return;
  }

  console.log('');
  console.log('Writing updates...');
  for (const u of updates) {
    const { error: uErr } = await supabase
      .from('dishes')
      .update({ weight: u.target })
      .eq('id', u.dish.id);
    if (uErr) throw new Error(`update ${u.dish.name}: ${uErr.message}`);
    console.log(`  ✓ ${u.dish.name}`);
  }
  console.log('Done.');
}

main().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
