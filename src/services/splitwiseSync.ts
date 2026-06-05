import { DayEntry, MealEntryWithDishes, Person } from '../types/models';
import { createExpense, updateExpense, ExpenseShare, getSavedGroupId } from './splitwiseService';
import { formatDisplayDate } from './dateUtils';
import { updateDayEntry } from '../db/repositories/dayEntryRepository';
import { calculateSplit, roundOwedShares } from './splitCalculator';

export async function syncToSplitwise(
  dayEntry: DayEntry,
  meals: MealEntryWithDishes[],
  payer: Person
): Promise<void> {
  const groupIdStr = await getSavedGroupId();
  if (!groupIdStr) throw new Error('No Splitwise group selected');

  const groupId = parseInt(groupIdStr, 10);
  const totalCost = dayEntry.total_cost!;
  const description = `Office Food — ${formatDisplayDate(dayEntry.date)}`;

  const splitResult = calculateSplit(totalCost, meals);
  const uniqueParticipants = splitResult.splits.map((s) => s.person);

  for (const p of uniqueParticipants) {
    if (!p.splitwise_user_id) {
      throw new Error(`${p.name} is not linked to a Splitwise user`);
    }
  }

  const isPayerOutside = !uniqueParticipants.find((p) => p.id === payer.id);
  if (isPayerOutside && !payer.splitwise_user_id) {
    throw new Error(`Payer "${payer.name}" is not linked to a Splitwise user`);
  }

  const rounded = roundOwedShares(splitResult);

  const shares: ExpenseShare[] = rounded.map((r) => {
    const isPayer = r.person.id === payer.id;
    return {
      user_id: parseInt(r.person.splitwise_user_id!, 10),
      paid_share: isPayer ? totalCost.toFixed(2) : '0.00',
      owed_share: r.owed.toFixed(2),
    };
  });

  if (isPayerOutside) {
    shares.push({
      user_id: parseInt(payer.splitwise_user_id!, 10),
      paid_share: totalCost.toFixed(2),
      owed_share: '0.00',
    });
    shares.forEach((s) => {
      if (s.user_id !== parseInt(payer.splitwise_user_id!, 10)) {
        s.paid_share = '0.00';
      }
    });
  }

  let expense;
  if (dayEntry.splitwise_expense_id) {
    expense = await updateExpense(dayEntry.splitwise_expense_id, groupId, description, totalCost, shares, dayEntry.date);
  } else {
    expense = await createExpense(groupId, description, totalCost, shares, dayEntry.date);
  }

  await updateDayEntry(dayEntry.id, {
    splitwise_expense_id: String(expense.id),
    splitwise_synced: true,
  });
}
