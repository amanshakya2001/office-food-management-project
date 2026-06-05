import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://isirwoamqrruzpzlywgc.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzaXJ3b2FtcXJydXpwemx5d2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNTA2OTksImV4cCI6MjA5MjkyNjY5OX0.eusTfhFfsaYEopJlq3MEyJDwldrx_ZvJbQB8e1wFnoo';

const ids = process.argv.slice(2).map(Number);
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const { data, error } = await supabase
  .from('meal_entries')
  .select('id, meal_description, person:persons(name), day_entry:day_entries(date)')
  .in('id', ids);
if (error) throw error;

data.sort((a, b) => a.id - b.id).forEach((r) => {
  console.log(`#${r.id}  ${r.day_entry?.date}  ${r.person?.name}: ${r.meal_description}`);
});
