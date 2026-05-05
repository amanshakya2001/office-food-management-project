import { supabase } from '../../lib/supabase';
import { DayEntry } from '../../types/models';

export async function getAllDayEntries(): Promise<DayEntry[]> {
  const { data, error } = await supabase
    .from('day_entries')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getDayEntryById(id: number): Promise<DayEntry | null> {
  const { data, error } = await supabase
    .from('day_entries')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

export async function getDayEntryByDate(date: string): Promise<DayEntry | null> {
  const { data, error } = await supabase
    .from('day_entries')
    .select('*')
    .eq('date', date)
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function createDayEntry(date: string): Promise<DayEntry> {
  const { data, error } = await supabase
    .from('day_entries')
    .insert({ date })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateDayEntry(
  id: number,
  fields: Partial<Pick<DayEntry, 'total_cost' | 'paid_by_person_id' | 'splitwise_expense_id' | 'splitwise_synced'>>
): Promise<void> {
  const { error } = await supabase.from('day_entries').update(fields).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteDayEntry(id: number): Promise<void> {
  const { error } = await supabase.from('day_entries').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getDayEntriesInRange(startDate: string, endDate: string): Promise<DayEntry[]> {
  const { data, error } = await supabase
    .from('day_entries')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
