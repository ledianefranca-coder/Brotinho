import { supabase } from '../lib/supabase';
import type { Category, Debt, Expense, FixedExpenseTemplate, Goal, Income } from '../types';

export interface AppStatePayload {
  expenses: Expense[];
  incomes: Income[];
  debts: Debt[];
  goals: Goal[];
  categories: Category[];
  fixedTemplates: FixedExpenseTemplate[];
}

export async function loadAppState(): Promise<AppStatePayload | null> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from('app_state')
    .select('data')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  return (data?.data as AppStatePayload | undefined) ?? null;
}

export async function saveAppState(payload: AppStatePayload): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return;

  const { error } = await supabase
    .from('app_state')
    .upsert({
      user_id: user.id,
      data: payload,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

  if (error) throw error;
}
