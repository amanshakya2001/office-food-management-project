import { getDB } from '../database';
import { DayEntry } from '../../types/models';

export async function getAllDayEntries(): Promise<DayEntry[]> {
  const db = await getDB();
  const rows = await db.getAllAsync<any>('SELECT * FROM day_entries ORDER BY date DESC');
  return rows.map(normalizeDayEntry);
}

export async function getDayEntryById(id: number): Promise<DayEntry | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<any>('SELECT * FROM day_entries WHERE id = ?', [id]);
  return row ? normalizeDayEntry(row) : null;
}

export async function getDayEntryByDate(date: string): Promise<DayEntry | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<any>('SELECT * FROM day_entries WHERE date = ?', [date]);
  return row ? normalizeDayEntry(row) : null;
}

export async function createDayEntry(date: string): Promise<DayEntry> {
  const db = await getDB();
  const result = await db.runAsync('INSERT INTO day_entries (date) VALUES (?)', [date]);
  return (await getDayEntryById(result.lastInsertRowId))!;
}

export async function updateDayEntry(
  id: number,
  fields: Partial<Pick<DayEntry, 'total_cost' | 'paid_by_person_id' | 'splitwise_expense_id' | 'splitwise_synced'>>
): Promise<void> {
  const db = await getDB();
  const mapped: Record<string, any> = { ...fields };
  if ('splitwise_synced' in mapped) {
    mapped.splitwise_synced = mapped.splitwise_synced ? 1 : 0;
  }
  const entries = Object.entries(mapped).filter(([, v]) => v !== undefined);
  if (!entries.length) return;
  const setClauses = entries.map(([k]) => `${k} = ?`).join(', ');
  const values = entries.map(([, v]) => v);
  await db.runAsync(`UPDATE day_entries SET ${setClauses} WHERE id = ?`, [...values, id]);
}

export async function deleteDayEntry(id: number): Promise<void> {
  const db = await getDB();
  await db.runAsync('DELETE FROM day_entries WHERE id = ?', [id]);
}

export async function getDayEntriesInRange(startDate: string, endDate: string): Promise<DayEntry[]> {
  const db = await getDB();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM day_entries WHERE date >= ? AND date <= ? ORDER BY date DESC',
    [startDate, endDate]
  );
  return rows.map(normalizeDayEntry);
}

function normalizeDayEntry(row: any): DayEntry {
  return {
    ...row,
    splitwise_synced: row.splitwise_synced === 1,
  };
}
