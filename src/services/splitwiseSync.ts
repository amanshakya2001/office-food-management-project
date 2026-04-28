import { DayEntry, MealEntry, Person } from '../types/models';
import { createExpense, updateExpense, ExpenseShare, getSavedGroupId } from './splitwiseService';
import { formatDisplayDate } from './dateUtils';
import { updateDayEntry } from '../db/repositories/dayEntryRepository';

export async function syncToSplitwise(
  dayEntry: DayEntry,
  meals: (MealEntry & { person: Person })[],
  payer: Person
): Promise<void> {
  const groupIdStr = await getSavedGroupId();
  if (!groupIdStr) throw new Error('No Splitwise group selected');

  const groupId = parseInt(groupIdStr, 10);
  const totalCost = dayEntry.total_cost!;
  const description = `Office Food — ${formatDisplayDate(dayEntry.date)}`;

  const participants = meals.map((m) => m.person);
  const uniqueParticipants = participants.filter(
    (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i
  );

  for (const p of uniqueParticipants) {
    if (!p.splitwise_user_id) {
      throw new Error(`${p.name} is not linked to a Splitwise user`);
    }
  }

  const isPayerOutside = !uniqueParticipants.find((p) => p.id === payer.id);

  // If payer is outside the meal group, they must also be linked to Splitwise
  if (isPayerOutside && !payer.splitwise_user_id) {
    throw new Error(`Payer "${payer.name}" is not linked to a Splitwise user`);
  }

  const perShare = Math.floor((totalCost / uniqueParticipants.length) * 100) / 100;
  const remainder = parseFloat(
    (totalCost - perShare * uniqueParticipants.length).toFixed(2)
  );

  const shares: ExpenseShare[] = uniqueParticipants.map((p, i) => {
    const isPayer = p.id === payer.id;
    const owedShare = i === uniqueParticipants.length - 1
      ? (perShare + remainder).toFixed(2)
      : perShare.toFixed(2);
    return {
      user_id: parseInt(p.splitwise_user_id!, 10),
      paid_share: isPayer ? totalCost.toFixed(2) : '0.00',
      owed_share: owedShare,
    };
  });

  // If payer is outside the meal group, add them with full paid_share and 0 owed
  if (isPayerOutside) {
    shares.push({
      user_id: parseInt(payer.splitwise_user_id!, 10),
      paid_share: totalCost.toFixed(2),
      owed_share: '0.00',
    });
    // Clear paid_share from all meal participants since payer is external
    shares.forEach((s) => {
      if (s.user_id !== parseInt(payer.splitwise_user_id!, 10)) {
        s.paid_share = '0.00';
      }
    });
  }

  let expense;
  if (dayEntry.splitwise_expense_id) {
    expense = await updateExpense(dayEntry.splitwise_expense_id, groupId, description, totalCost, shares);
  } else {
    expense = await createExpense(groupId, description, totalCost, shares);
  }

  await updateDayEntry(dayEntry.id, {
    splitwise_expense_id: String(expense.id),
    splitwise_synced: true,
  });
}
