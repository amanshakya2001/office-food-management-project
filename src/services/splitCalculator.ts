import { MealEntryWithDishes, Person } from '../types/models';

export interface PersonSplit {
  person: Person;
  priced: number;        // sum of priced dish costs they ate
  sharedWeight: number;  // total weight of their shared dishes
  shared: number;        // their portion of the shared pool
  overageCredit: number; // refund when priced sum exceeds total (case 2)
  owed: number;          // priced + shared - overageCredit
}

export interface SplitResult {
  splits: PersonSplit[];
  totalCost: number;
  pricedSum: number;
  sharedPool: number;       // total - pricedSum, clamped to >= 0
  overage: number;          // pricedSum - total when positive, else 0
  totalSharedWeight: number;
  sharedParticipantIds: number[];
}

interface Participant {
  person: Person;
  priced: number;
  sharedWeight: number;
}

/**
 * Split rules:
 *  1. Priced dishes (price > 0) charged directly to the eater (× qty).
 *  2. Shared pool = totalCost − pricedSum (>= 0).
 *  3. Shared pool divided proportionally by each person's shared weight
 *     (sum of dish.weight × qty over their price=0 dishes).
 *     If nobody had any shared weight, the pool is split equally among
 *     all participants.
 *  4. Overage (pricedSum > total) refunded proportionally to priced eaters.
 */
export function calculateSplit(
  totalCost: number,
  meals: MealEntryWithDishes[]
): SplitResult {
  const byPerson = new Map<number, Participant>();

  for (const meal of meals) {
    const existing = byPerson.get(meal.person_id) ?? {
      person: meal.person,
      priced: 0,
      sharedWeight: 0,
    };
    for (const { dish, qty } of meal.dishes) {
      if (dish.price > 0) {
        existing.priced += dish.price * qty;
      } else {
        existing.sharedWeight += (dish.weight ?? 1) * qty;
      }
    }
    byPerson.set(meal.person_id, existing);
  }

  const participants = Array.from(byPerson.values());
  const pricedSum = participants.reduce((s, p) => s + p.priced, 0);

  // Case 2: priced > total. Refund overage proportionally; no shared pool.
  if (pricedSum > totalCost) {
    const overage = pricedSum - totalCost;
    const splits: PersonSplit[] = participants.map((p) => {
      const overageCredit = pricedSum > 0 ? (p.priced / pricedSum) * overage : 0;
      return {
        person: p.person,
        priced: p.priced,
        sharedWeight: p.sharedWeight,
        shared: 0,
        overageCredit,
        owed: p.priced - overageCredit,
      };
    });
    return {
      splits,
      totalCost,
      pricedSum,
      sharedPool: 0,
      overage,
      totalSharedWeight: participants.reduce((s, p) => s + p.sharedWeight, 0),
      sharedParticipantIds: [],
    };
  }

  const sharedPool = totalCost - pricedSum;
  const totalSharedWeight = participants.reduce((s, p) => s + p.sharedWeight, 0);

  // Distribute sharedPool by weight. Fallback: equal split among all participants
  // if nobody has shared weight (rare — usually means everyone ate only priced items).
  const useEqualFallback = totalSharedWeight === 0;
  const equalShare =
    useEqualFallback && participants.length > 0 ? sharedPool / participants.length : 0;

  const sharedParticipantIds: number[] = [];
  const splits: PersonSplit[] = participants.map((p) => {
    let shared = 0;
    if (useEqualFallback) {
      shared = equalShare;
    } else if (p.sharedWeight > 0) {
      shared = sharedPool * (p.sharedWeight / totalSharedWeight);
    }
    if (shared > 0) sharedParticipantIds.push(p.person.id);
    return {
      person: p.person,
      priced: p.priced,
      sharedWeight: p.sharedWeight,
      shared,
      overageCredit: 0,
      owed: p.priced + shared,
    };
  });

  return {
    splits,
    totalCost,
    pricedSum,
    sharedPool,
    overage: 0,
    totalSharedWeight,
    sharedParticipantIds,
  };
}

/**
 * Round each person's owed to 2 decimals; absorb the rounding remainder
 * onto the last participant so the total matches `totalCost` exactly.
 */
export function roundOwedShares(result: SplitResult): { person: Person; owed: number }[] {
  const rounded = result.splits.map((s) => ({
    person: s.person,
    owed: Math.round(s.owed * 100) / 100,
  }));
  if (rounded.length === 0) return rounded;
  const sum = rounded.reduce((s, r) => s + r.owed, 0);
  const diff = Math.round((result.totalCost - sum) * 100) / 100;
  if (diff !== 0) {
    rounded[rounded.length - 1].owed = Math.round((rounded[rounded.length - 1].owed + diff) * 100) / 100;
  }
  return rounded;
}
