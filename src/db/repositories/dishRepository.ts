import { supabase } from '../../lib/supabase';

export interface Dish {
  id: number;
  name: string;
  is_countable: boolean;
  price: number;
  weight: number;
  created_at: string;
}

function normalizeDish(row: any): Dish {
  return {
    id: row.id,
    name: row.name,
    is_countable: row.is_countable,
    price: typeof row.price === 'string' ? parseFloat(row.price) : row.price ?? 0,
    weight: typeof row.weight === 'string' ? parseFloat(row.weight) : row.weight ?? 1,
    created_at: row.created_at,
  };
}

export async function getDishes(): Promise<Dish[]> {
  const { data, error } = await supabase
    .from('dishes')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(normalizeDish);
}

export async function createDish(
  name: string,
  is_countable: boolean,
  price: number,
  weight: number
): Promise<Dish> {
  const { data, error } = await supabase
    .from('dishes')
    .insert({ name: name.trim(), is_countable, price, weight })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return normalizeDish(data);
}

export async function updateDish(
  id: number,
  name: string,
  is_countable: boolean,
  price: number,
  weight: number
): Promise<void> {
  const { error } = await supabase
    .from('dishes')
    .update({ name: name.trim(), is_countable, price, weight })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteDish(id: number): Promise<void> {
  const { error } = await supabase.from('dishes').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
