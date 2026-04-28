import { getDB } from '../database';
import { Person } from '../../types/models';

export async function getAllPersons(): Promise<Person[]> {
  const db = await getDB();
  return db.getAllAsync<Person>('SELECT * FROM persons ORDER BY name ASC');
}

export async function getPersonById(id: number): Promise<Person | null> {
  const db = await getDB();
  return db.getFirstAsync<Person>('SELECT * FROM persons WHERE id = ?', [id]);
}

export async function createPerson(name: string, phone_number: string): Promise<Person> {
  const db = await getDB();
  const result = await db.runAsync(
    'INSERT INTO persons (name, phone_number) VALUES (?, ?)',
    [name, phone_number]
  );
  return (await getPersonById(result.lastInsertRowId))!;
}

export async function updatePerson(
  id: number,
  fields: Partial<Pick<Person, 'name' | 'phone_number' | 'splitwise_user_id' | 'splitwise_user_name'>>
): Promise<void> {
  const db = await getDB();
  const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
  if (!entries.length) return;
  const setClauses = entries.map(([k]) => `${k} = ?`).join(', ');
  const values = entries.map(([, v]) => v);
  await db.runAsync(`UPDATE persons SET ${setClauses} WHERE id = ?`, [...values, id]);
}

export async function deletePerson(id: number): Promise<void> {
  const db = await getDB();
  await db.runAsync('DELETE FROM persons WHERE id = ?', [id]);
}
