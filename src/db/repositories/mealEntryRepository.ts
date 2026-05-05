import { supabase } from '../../lib/supabase';
import { MealEntry, Person } from '../../types/models';

export async function getMealEntriesByDayEntry(
  dayEntryId: number
): Promise<(MealEntry & { person: Person })[]> {
  const { data, error } = await supabase
    .from('meal_entries')
    .select('*, person:persons(*)')
    .eq('day_entry_id', dayEntryId)
    .order('id');
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: any) => ({
    id: row.id,
    day_entry_id: row.day_entry_id,
    person_id: row.person_id,
    meal_description: row.meal_description,
    person: row.person,
  }));
}

export async function createMealEntry(
  dayEntryId: number,
  personId: number,
  mealDescription: string
): Promise<MealEntry> {
  const { data, error } = await supabase
    .from('meal_entries')
    .insert({ day_entry_id: dayEntryId, person_id: personId, meal_description: mealDescription })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateMealEntry(id: number, mealDescription: string): Promise<void> {
  const { error } = await supabase
    .from('meal_entries')
    .update({ meal_description: mealDescription })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteMealEntry(id: number): Promise<void> {
  const { error } = await supabase.from('meal_entries').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function bulkCreateMealEntries(
  entries: { dayEntryId: number; personId: number; mealDescription: string }[]
): Promise<void> {
  const { error } = await supabase.from('meal_entries').insert(
    entries.map((e) => ({
      day_entry_id: e.dayEntryId,
      person_id: e.personId,
      meal_description: e.mealDescription,
    }))
  );
  if (error) throw new Error(error.message);
}

export async function getMealEntriesForExport(
  startDate: string,
  endDate: string
): Promise<any[]> {
  const { data, error } = await supabase
    .from('meal_entries')
    .select(`
      meal_description,
      person:persons(name, phone_number),
      day_entry:day_entries(date, total_cost, splitwise_synced, paid_by_person_id,
        paid_by:persons(name))
    `)
    .gte('day_entry.date', startDate)
    .lte('day_entry.date', endDate)
    .order('id');
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: any) => ({
    date: row.day_entry?.date,
    total_cost: row.day_entry?.total_cost,
    splitwise_synced: row.day_entry?.splitwise_synced,
    person_name: row.person?.name,
    phone_number: row.person?.phone_number,
    meal_description: row.meal_description,
    paid_by_name: row.day_entry?.paid_by?.name,
  }));
}
