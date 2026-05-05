import { supabase } from '../../lib/supabase';
import { Person } from '../../types/models';

export async function getAllPersons(): Promise<Person[]> {
  const { data, error } = await supabase
    .from('persons')
    .select('*')
    .order('name');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPersonById(id: number): Promise<Person | null> {
  const { data, error } = await supabase
    .from('persons')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

export async function createPerson(name: string, phone_number: string): Promise<Person> {
  const { data, error } = await supabase
    .from('persons')
    .insert({ name, phone_number })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updatePerson(
  id: number,
  fields: Partial<Pick<Person, 'name' | 'phone_number' | 'splitwise_user_id' | 'splitwise_user_name'>>
): Promise<void> {
  const { error } = await supabase.from('persons').update(fields).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deletePerson(id: number): Promise<void> {
  const { error } = await supabase.from('persons').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
