// Backfill meal_entry_dishes from legacy meal_description text.
// Usage: node scripts/backfill-meal-dishes.mjs [--apply]
// Default is dry-run (no writes).

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://isirwoamqrruzpzlywgc.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzaXJ3b2FtcXJydXpwemx5d2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNTA2OTksImV4cCI6MjA5MjkyNjY5OX0.eusTfhFfsaYEopJlq3MEyJDwldrx_ZvJbQB8e1wFnoo';

const APPLY = process.argv.includes('--apply');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const normalize = (s) => s.toLowerCase().trim().replace(/\s+/g, ' ');

function parseDescription(desc) {
  return desc
    .split('+')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((part) => {
      // "3 roti" or "3roti" → qty 3, name "roti"
      const m = part.match(/^(\d+)\s*(.+)$/);
      if (m) return { qty: parseInt(m[1], 10), name: m[2].trim() };
      return { qty: 1, name: part };
    });
}

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY (will write)' : 'DRY-RUN (no writes)'}`);

  const { data: dishes, error: dErr } = await supabase.from('dishes').select('*');
  if (dErr) throw new Error(`load dishes: ${dErr.message}`);
  const dishByName = new Map();
  dishes.forEach((d) => dishByName.set(normalize(d.name), d));
  console.log(`Loaded ${dishes.length} dishes.`);

  const { data: entries, error: eErr } = await supabase
    .from('meal_entries')
    .select('id, meal_description, meal_entry_dishes(id)');
  if (eErr) throw new Error(`load meal_entries: ${eErr.message}`);

  const untagged = entries.filter(
    (e) => !e.meal_entry_dishes || e.meal_entry_dishes.length === 0
  );
  console.log(`Total meal_entries: ${entries.length}, untagged: ${untagged.length}`);

  const linksToInsert = [];
  const unmatchedSamples = [];
  let matched = 0;
  let skipped = 0;

  for (const entry of untagged) {
    const tokens = parseDescription(entry.meal_description ?? '');
    if (tokens.length === 0) {
      skipped++;
      unmatchedSamples.push({ id: entry.id, desc: entry.meal_description, unknown: ['(empty)'] });
      continue;
    }

    const links = [];
    const unknown = [];
    for (const tok of tokens) {
      const dish = dishByName.get(normalize(tok.name));
      if (dish) {
        links.push({ meal_entry_id: entry.id, dish_id: dish.id, qty: dish.is_countable ? tok.qty : 1 });
      } else {
        unknown.push(tok.name);
      }
    }

    if (unknown.length > 0) {
      skipped++;
      if (unmatchedSamples.length < 50) {
        unmatchedSamples.push({ id: entry.id, desc: entry.meal_description, unknown });
      }
      continue;
    }

    linksToInsert.push(...links);
    matched++;
  }

  console.log('');
  console.log(`Matched (will tag): ${matched}`);
  console.log(`Skipped (leave for in-app re-tag): ${skipped}`);
  console.log(`Dish links to insert: ${linksToInsert.length}`);

  if (unmatchedSamples.length > 0) {
    console.log('');
    console.log('--- Unmatched samples (first 50) ---');
    unmatchedSamples.forEach((s) => {
      console.log(`  #${s.id}  "${s.desc}"  → unknown: [${s.unknown.join(', ')}]`);
    });
  }

  if (!APPLY) {
    console.log('');
    console.log('Dry-run done. Re-run with --apply to actually write.');
    return;
  }

  if (linksToInsert.length === 0) {
    console.log('Nothing to insert.');
    return;
  }

  console.log('');
  console.log('Writing dish links...');
  const chunkSize = 500;
  for (let i = 0; i < linksToInsert.length; i += chunkSize) {
    const chunk = linksToInsert.slice(i, i + chunkSize);
    const { error: insErr } = await supabase.from('meal_entry_dishes').insert(chunk);
    if (insErr) throw new Error(`insert chunk ${i / chunkSize}: ${insErr.message}`);
    console.log(`  inserted ${Math.min(i + chunkSize, linksToInsert.length)} / ${linksToInsert.length}`);
  }
  console.log('Done.');
}

main().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
