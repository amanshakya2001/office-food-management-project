import { supabase } from '../../lib/supabase';
import { MealEntry, MealEntryWithDishes, MealEntryDish, DishLite } from '../../types/models';

function normalizeDishLite(row: any): DishLite {
  return {
    id: row.id,
    name: row.name,
    is_countable: row.is_countable,
    price: typeof row.price === 'string' ? parseFloat(row.price) : row.price ?? 0,
    weight: typeof row.weight === 'string' ? parseFloat(row.weight) : row.weight ?? 1,
  };
}

function normalizeDishes(rows: any[] | null | undefined): MealEntryDish[] {
  return (rows ?? []).map((r) => ({
    dish: normalizeDishLite(r.dish),
    qty: r.qty,
  }));
}

export async function getMealEntriesByDayEntry(
  dayEntryId: number
): Promise<MealEntryWithDishes[]> {
  const { data, error } = await supabase
    .from('meal_entries')
    .select('*, person:persons(*), meal_entry_dishes(qty, dish:dishes(id, name, is_countable, price, weight))')
    .eq('day_entry_id', dayEntryId)
    .order('id');
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: any) => ({
    id: row.id,
    day_entry_id: row.day_entry_id,
    person_id: row.person_id,
    meal_description: row.meal_description,
    person: row.person,
    dishes: normalizeDishes(row.meal_entry_dishes),
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

/**
 * Replace all dish links for a meal entry. Also updates meal_description so
 * the text label stays in sync with the structured dishes.
 */
export async function setMealEntryDishes(
  mealEntryId: number,
  dishes: { dishId: number; qty: number }[],
  mealDescription: string
): Promise<void> {
  const { error: delError } = await supabase
    .from('meal_entry_dishes')
    .delete()
    .eq('meal_entry_id', mealEntryId);
  if (delError) throw new Error(delError.message);

  if (dishes.length > 0) {
    const { error: insError } = await supabase.from('meal_entry_dishes').insert(
      dishes.map((d) => ({ meal_entry_id: mealEntryId, dish_id: d.dishId, qty: d.qty }))
    );
    if (insError) throw new Error(insError.message);
  }

  const { error: updError } = await supabase
    .from('meal_entries')
    .update({ meal_description: mealDescription })
    .eq('id', mealEntryId);
  if (updError) throw new Error(updError.message);
}

export async function deleteMealEntry(id: number): Promise<void> {
  const { error } = await supabase.from('meal_entries').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export interface MealEntryInput {
  dayEntryId: number;
  personId: number;
  mealDescription: string;
  dishes: { dishId: number; qty: number }[];
}

export async function bulkCreateMealEntries(entries: MealEntryInput[]): Promise<void> {
  if (entries.length === 0) return;

  const { data: inserted, error } = await supabase
    .from('meal_entries')
    .insert(
      entries.map((e) => ({
        day_entry_id: e.dayEntryId,
        person_id: e.personId,
        meal_description: e.mealDescription,
      }))
    )
    .select('id');
  if (error) throw new Error(error.message);

  const dishLinks: { meal_entry_id: number; dish_id: number; qty: number }[] = [];
  (inserted ?? []).forEach((row: any, idx: number) => {
    entries[idx].dishes.forEach((d) => {
      dishLinks.push({ meal_entry_id: row.id, dish_id: d.dishId, qty: d.qty });
    });
  });

  if (dishLinks.length > 0) {
    const { error: linkError } = await supabase.from('meal_entry_dishes').insert(dishLinks);
    if (linkError) throw new Error(linkError.message);
  }
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
