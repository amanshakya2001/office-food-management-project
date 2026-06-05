// List the deduplicated set of unknown dish-name tokens, plus the
// existing dishes for reference. Read-only.
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://isirwoamqrruzpzlywgc.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzaXJ3b2FtcXJydXpwemx5d2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNTA2OTksImV4cCI6MjA5MjkyNjY5OX0.eusTfhFfsaYEopJlq3MEyJDwldrx_ZvJbQB8e1wFnoo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const normalize = (s) => s.toLowerCase().trim().replace(/\s+/g, ' ');

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

const { data: dishes } = await supabase.from('dishes').select('*').order('name');
console.log('=== EXISTING DISHES ===');
dishes.forEach((d) => console.log(`  ${d.name}  (countable=${d.is_countable}, price=${d.price})`));

const dishByName = new Map();
dishes.forEach((d) => dishByName.set(normalize(d.name), d));

const { data: entries } = await supabase
  .from('meal_entries')
  .select('id, meal_description, meal_entry_dishes(id)');

const untagged = entries.filter((e) => !e.meal_entry_dishes || e.meal_entry_dishes.length === 0);

// dedup unknowns, keep one canonical form (the most common spelling)
const unknownCounts = new Map(); // norm -> { display, count, sampleEntryIds }
for (const entry of untagged) {
  const tokens = parseDescription(entry.meal_description ?? '');
  for (const tok of tokens) {
    if (dishByName.has(normalize(tok.name))) continue;
    const key = normalize(tok.name);
    const existing = unknownCounts.get(key) ?? { display: tok.name, count: 0, sampleEntryIds: [] };
    existing.count++;
    if (existing.sampleEntryIds.length < 3) existing.sampleEntryIds.push(entry.id);
    unknownCounts.set(key, existing);
  }
}

const sorted = [...unknownCounts.entries()].sort((a, b) => b[1].count - a[1].count);
console.log('');
console.log(`=== UNIQUE UNMATCHED NAMES (${sorted.length}) ===`);
sorted.forEach(([key, info]) => {
  console.log(`  "${info.display}"  × ${info.count}   (eg entries ${info.sampleEntryIds.join(', ')})`);
});

console.log('');
console.log(`Total untagged entries: ${untagged.length}`);
