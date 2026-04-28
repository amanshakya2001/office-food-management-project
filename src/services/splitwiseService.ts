import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'https://secure.splitwise.com/api/v3.0';
const TOKEN_KEY = 'splitwise_access_token';
const GROUP_KEY = 'splitwise_group_id';

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function saveToken(token: string): Promise<void> {
  return SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  return SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function getSavedGroupId(): Promise<string | null> {
  return SecureStore.getItemAsync(GROUP_KEY);
}

export async function saveGroupId(groupId: string): Promise<void> {
  return SecureStore.setItemAsync(GROUP_KEY, groupId);
}

export async function clearGroupId(): Promise<void> {
  return SecureStore.deleteItemAsync(GROUP_KEY);
}

async function apiFetch(path: string, options: RequestInit = {}, formBody?: Record<string, any>): Promise<any> {
  const token = await getToken();
  if (!token) throw new Error('Not authenticated with Splitwise');

  const isForm = formBody !== undefined;
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': isForm ? 'application/x-www-form-urlencoded' : 'application/json',
      ...(options.headers ?? {}),
    },
    body: isForm
      ? Object.entries(formBody).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
      : options.body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Splitwise API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getCurrentUser(): Promise<any> {
  const data = await apiFetch('/get_current_user');
  return data.user;
}

export async function getGroups(): Promise<any[]> {
  const data = await apiFetch('/get_groups');
  return data.groups;
}

export async function getGroup(groupId: string): Promise<any> {
  const data = await apiFetch(`/get_group/${groupId}`);
  return data.group;
}

export interface ExpenseShare {
  user_id: number;
  paid_share: string;
  owed_share: string;
}

export async function createExpense(
  groupId: number,
  description: string,
  cost: number,
  shares: ExpenseShare[]
): Promise<any> {
  const body: Record<string, any> = {
    cost: cost.toFixed(2),
    description,
    group_id: groupId,
    currency_code: 'INR',
  };
  shares.forEach((s, i) => {
    body[`users__${i}__user_id`] = s.user_id;
    body[`users__${i}__paid_share`] = s.paid_share;
    body[`users__${i}__owed_share`] = s.owed_share;
  });
  const data = await apiFetch('/create_expense', { method: 'POST' }, body);
  return data.expenses?.[0];
}

export async function updateExpense(
  expenseId: string,
  groupId: number,
  description: string,
  cost: number,
  shares: ExpenseShare[]
): Promise<any> {
  const body: Record<string, any> = {
    cost: cost.toFixed(2),
    description,
    group_id: groupId,
    currency_code: 'INR',
  };
  shares.forEach((s, i) => {
    body[`users__${i}__user_id`] = s.user_id;
    body[`users__${i}__paid_share`] = s.paid_share;
    body[`users__${i}__owed_share`] = s.owed_share;
  });
  const data = await apiFetch(`/update_expense/${expenseId}`, { method: 'POST' }, body);
  return data.expenses?.[0];
}
