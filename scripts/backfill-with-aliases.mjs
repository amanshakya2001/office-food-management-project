// Backfill round 2: applies a confirmed alias map to the remaining untagged
// meal_entries. Run with --apply to write. Default is dry-run.
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://isirwoamqrruzpzlywgc.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzaXJ3b2FtcXJydXpwemx5d2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNTA2OTksImV4cCI6MjA5MjkyNjY5OX0.eusTfhFfsaYEopJlq3MEyJDwldrx_ZvJbQB8e1wFnoo';

const APPLY = process.argv.includes('--apply');
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const normalize = (s) => s.toLowerCase().trim().replace(/\s+/g, ' ');

// Alias map: source token (normalized) -> canonical existing-dish name.
// Note: dish names matched case-insensitively; we use the exact spelling so
// the lookup is unambiguous in the existing dishes table.
const ALIASES = {
  'aloo simla': 'Aloo shimla',
  'paneer': 'Paneer ki Sabzi',
  'daal': 'Dal',
  'aloo pyaz paratha': 'Aloo Pyaaz Parantha',
  'aloo paratha': 'Aloo Parantha',
  'aloo sabzi': 'Aloo Ki Sabzi',
  'aloo sabji': 'Aloo Ki Sabzi',
  'aloo': 'Aloo Ki Sabzi',
  'khadi': 'Kadhi',
  'kaadi': 'Kadhi',
  'baigan': 'Baingan ki Sabzi',
  'baingan': 'Baingan ki Sabzi',
  'egg bhurji': 'Egg burji',
  'matar paneer': 'Paneer ki Sabzi',
  'kadhi pakora': 'Kadhi',
  'pyaaz paneer': 'Paneer ki Sabzi',
  'egg': 'Egg Curry',
  'curry gravy': 'Egg Curry',
  'sabji': 'Aloo Ki Sabzi',
};

// New dishes to create (shared, price 0) before mapping.
const NEW_DISHES = [
  { name: 'Karela', is_countable: false, price: 0 },
];
// After NEW_DISHES are inserted, map these tokens to them by name.
const NEW_DISH_ALIASES = {
  'karela': 'Karela',
};

function parseDescription(desc) {
  return desc
    .split('+')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((part) => {
      const m = part.match(/^(\d+)\s*(.+)$/);
      if (m) return { qty: parseInt(m[1], 10), name: m[2].trim() };
      return { qty: 1, name: part };
    });
}

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY (will write)' : 'DRY-RUN (no writes)'}`);

  // 1. Ensure new dishes exist.
  let { data: dishes, error: dErr } = await supabase.from('dishes').select('*');
  if (dErr) throw new Error(dErr.message);
  const dishByNorm = new Map();
  dishes.forEach((d) => dishByNorm.set(normalize(d.name), d));

  for (const nd of NEW_DISHES) {
    if (!dishByNorm.has(normalize(nd.name))) {
      console.log(`Creating new dish: ${nd.name} (price ${nd.price})`);
      if (APPLY) {
        const { data: created, error: cErr } = await supabase.from('dishes').insert(nd).select().single();
        if (cErr) throw new Error(`create dish ${nd.name}: ${cErr.message}`);
        dishByNorm.set(normalize(created.name), created);
      } else {
        // Add a stub so dry-run can match.
        dishByNorm.set(normalize(nd.name), { ...nd, id: -1 });
      }
    } else {
      console.log(`Dish already exists, skipping create: ${nd.name}`);
    }
  }

  // 2. Build full alias map (existing aliases + new-dish aliases).
  const fullAliases = { ...ALIASES, ...NEW_DISH_ALIASES };
  // Validate every alias points to a real dish.
  for (const [src, target] of Object.entries(fullAliases)) {
    if (!dishByNorm.has(normalize(target))) {
      throw new Error(`Alias "${src}" -> "${target}" but no such dish exists.`);
    }
  }

  // 3. Pull untagged entries.
  const { data: entries, error: eErr } = await supabase
    .from('meal_entries')
    .select('id, meal_description, meal_entry_dishes(id)');
  if (eErr) throw new Error(eErr.message);

  const untagged = entries.filter((e) => !e.meal_entry_dishes || e.meal_entry_dishes.length === 0);
  console.log(`Untagged entries before this run: ${untagged.length}`);

  const linksToInsert = [];
  const stillUnmatched = [];
  let matched = 0;

  for (const entry of untagged) {
    const tokens = parseDescription(entry.meal_description ?? '');
    if (tokens.length === 0) {
      stillUnmatched.push({ id: entry.id, desc: entry.meal_description, unknown: ['(empty)'] });
      continue;
    }

    const links = [];
    const unknown = [];
    for (const tok of tokens) {
      const norm = normalize(tok.name);
      let dish = dishByNorm.get(norm);
      if (!dish && fullAliases[norm]) {
        dish = dishByNorm.get(normalize(fullAliases[norm]));
      }
      if (dish) {
        links.push({ meal_entry_id: entry.id, dish_id: dish.id, qty: dish.is_countable ? tok.qty : 1 });
      } else {
        unknown.push(tok.name);
      }
    }

    if (unknown.length > 0) {
      stillUnmatched.push({ id: entry.id, desc: entry.meal_description, unknown });
      continue;
    }

    // Deduplicate within entry: if the same dish appears twice (e.g. "Egg Curry + Egg Curry" via two aliases),
    // sum the qty so the UNIQUE (meal_entry_id, dish_id) constraint doesn't blow up.
    const byDishId = new Map();
    for (const l of links) {
      const cur = byDishId.get(l.dish_id);
      byDishId.set(l.dish_id, cur ? { ...cur, qty: cur.qty + l.qty } : l);
    }
    linksToInsert.push(...byDishId.values());
    matched++;
  }

  console.log('');
  console.log(`Matched this round: ${matched}`);
  console.log(`Still unmatched: ${stillUnmatched.length}`);
  console.log(`Dish links to insert: ${linksToInsert.length}`);

  if (stillUnmatched.length > 0) {
    console.log('');
    console.log('--- Still unmatched ---');
    stillUnmatched.forEach((s) => {
      console.log(`  #${s.id}  "${s.desc}"  → unknown: [${s.unknown.join(', ')}]`);
    });
  }

  if (!APPLY) {
    console.log('');
    console.log('Dry-run done. Re-run with --apply to write.');
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
