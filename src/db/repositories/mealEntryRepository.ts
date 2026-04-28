import { getDB } from '../database';
import { MealEntry, Person } from '../../types/models';

export async function getMealEntriesByDayEntry(
  dayEntryId: number
): Promise<(MealEntry & { person: Person })[]> {
  const db = await getDB();
  const rows = await db.getAllAsync<any>(
    `SELECT me.*, p.id as p_id, p.name as p_name, p.phone_number as p_phone,
            p.splitwise_user_id as p_sw_id, p.splitwise_user_name as p_sw_name, p.created_at as p_created_at
     FROM meal_entries me
     JOIN persons p ON me.person_id = p.id
     WHERE me.day_entry_id = ?
     ORDER BY me.id ASC`,
    [dayEntryId]
  );
  return rows.map((r: any) => ({
    id: r.id,
    day_entry_id: r.day_entry_id,
    person_id: r.person_id,
    meal_description: r.meal_description,
    person: {
      id: r.p_id,
      name: r.p_name,
      phone_number: r.p_phone,
      splitwise_user_id: r.p_sw_id,
      splitwise_user_name: r.p_sw_name,
      created_at: r.p_created_at,
    },
  }));
}

export async function createMealEntry(
  dayEntryId: number,
  personId: number,
  mealDescription: string
): Promise<MealEntry> {
  const db = await getDB();
  const result = await db.runAsync(
    'INSERT INTO meal_entries (day_entry_id, person_id, meal_description) VALUES (?, ?, ?)',
    [dayEntryId, personId, mealDescription]
  );
  const row = await db.getFirstAsync<MealEntry>(
    'SELECT * FROM meal_entries WHERE id = ?',
    [result.lastInsertRowId]
  );
  return row!;
}

export async function updateMealEntry(id: number, mealDescription: string): Promise<void> {
  const db = await getDB();
  await db.runAsync('UPDATE meal_entries SET meal_description = ? WHERE id = ?', [mealDescription, id]);
}

export async function deleteMealEntry(id: number): Promise<void> {
  const db = await getDB();
  await db.runAsync('DELETE FROM meal_entries WHERE id = ?', [id]);
}

export async function bulkCreateMealEntries(
  entries: { dayEntryId: number; personId: number; mealDescription: string }[]
): Promise<void> {
  const db = await getDB();
  await db.withTransactionAsync(async () => {
    for (const e of entries) {
      await db.runAsync(
        'INSERT INTO meal_entries (day_entry_id, person_id, meal_description) VALUES (?, ?, ?)',
        [e.dayEntryId, e.personId, e.mealDescription]
      );
    }
  });
}

export async function getMealEntriesForExport(
  startDate: string,
  endDate: string
): Promise<any[]> {
  const db = await getDB();
  return db.getAllAsync<any>(
    `SELECT de.date, de.total_cost, de.splitwise_synced,
            p.name as person_name, p.phone_number,
            me.meal_description,
            payer.name as paid_by_name
     FROM meal_entries me
     JOIN day_entries de ON me.day_entry_id = de.id
     JOIN persons p ON me.person_id = p.id
     LEFT JOIN persons payer ON de.paid_by_person_id = payer.id
     WHERE de.date >= ? AND de.date <= ?
     ORDER BY de.date DESC, p.name ASC`,
    [startDate, endDate]
  );
}
