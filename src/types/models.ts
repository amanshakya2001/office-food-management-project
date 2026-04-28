export interface Person {
  id: number;
  name: string;
  phone_number: string;
  splitwise_user_id: string | null;
  splitwise_user_name: string | null;
  created_at: string;
}

export interface DayEntry {
  id: number;
  date: string; // YYYY-MM-DD
  total_cost: number | null;
  paid_by_person_id: number | null;
  splitwise_expense_id: string | null;
  splitwise_synced: boolean;
  created_at: string;
}

export interface MealEntry {
  id: number;
  day_entry_id: number;
  person_id: number;
  meal_description: string;
}

export interface DayEntryWithDetails extends DayEntry {
  meal_entries: (MealEntry & { person: Person })[];
  paid_by_person: Person | null;
}
