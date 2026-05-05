import { supabase } from '../../lib/supabase';

export interface Dish {
  id: number;
  name: string;
  is_countable: boolean;
  created_at: string;
}

export async function getDishes(): Promise<Dish[]> {
  const { data, error } = await supabase
    .from('dishes')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createDish(name: string, is_countable: boolean): Promise<Dish> {
  const { data, error } = await supabase
    .from('dishes')
    .insert({ name: name.trim(), is_countable })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateDish(id: number, name: string, is_countable: boolean): Promise<void> {
  const { error } = await supabase
    .from('dishes')
    .update({ name: name.trim(), is_countable })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteDish(id: number): Promise<void> {
  const { error } = await supabase.from('dishes').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
