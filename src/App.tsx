import { useState, useEffect, useMemo } from 'react';
import { 
  Expense, 
  Income, 
  Debt, 
  Goal, 
  Category, 
  FixedExpenseTemplate, 
  ActiveTab 
} from './types.ts';
import { DEFAULT_EXPENSE_CATEGORIES } from './utils/categories.ts';
import { supabase } from './lib/supabase.ts';
import { loadAppState, saveAppState } from './utils/remoteStorage.ts';
import { evaluateMascotStatus } from './utils/mascotEvaluator.ts';
import { Navigation } from './components/Navigation.tsx';
import { PayBillModal } from './components/PayBillModal.tsx';
import { TransactionModal } from './components/TransactionModal.tsx';

import { LoginView } from './views/LoginView.tsx';
import { DashboardView } from './views/DashboardView.tsx';
import { TransactionsView } from './views/TransactionsView.tsx';
import { BillsToPayView } from './views/BillsToPayView.tsx';
import { PaidBillsView } from './views/PaidBillsView.tsx';
import { OverdueBillsView } from './views/OverdueBillsView.tsx';
import { FixedExpensesView } from './views/FixedExpensesView.tsx';
import { IncomesView } from './views/IncomesView.tsx';
import { DebtsView } from './views/DebtsView.tsx';
import { GoalsView } from './views/GoalsView.tsx';
import { CalendarView } from './views/CalendarView.tsx';
import { ReportsView } from './views/ReportsView.tsx';
import { MonthlySummaryView } from './views/MonthlySummaryView.tsx';
import { SettingsView } from './views/SettingsView.tsx';

export default function App() {
  const [auth, setAuth] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataReady, setDataReady] = useState(false);
  const [currentYearMonth, setCurrentYearMonth] = useState<string>('2026-09');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [expenses, setExpensesState] = useState<Expense[]>([]);
  const [incomes, setIncomesState] = useState<Income[]>([]);
  const [debts, setDebtsState] = useState<Debt[]>([]);
  const [goals, setGoalsState] = useState<Goal[]>([]);
  const [categories, setCategoriesState] = useState<Category[]>([]);
  const [fixedTemplates, setFixedTemplatesState] = useState<FixedExpenseTemplate[]>([]);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payingBill, setPayingBill] = useState<Expense | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionModalDefaultType, setTransactionModalDefaultType] = useState<'expense' | 'income'>('expense');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      setAuth(!!session);
      setAuthLoading(false);
    };
    bootstrap();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setAuth(!!session);
      if (!session) setDataReady(false);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!auth) return;
    let cancelled = false;
    const load = async () => {
      try {
        const cloud = await loadAppState();
        if (cancelled) return;
        setExpensesState(cloud?.expenses ?? []);
        setIncomesState(cloud?.incomes ?? []);
        setDebtsState(cloud?.debts ?? []);
        setGoalsState(cloud?.goals ?? []);
        setCategoriesState(cloud?.categories?.length ? cloud.categories : DEFAULT_EXPENSE_CATEGORIES);
        setFixedTemplatesState(cloud?.fixedTemplates ?? []);
        setDataReady(true);
      } catch (error) {
        console.error('Erro ao carregar dados do Supabase:', error);
        if (!cancelled) {
          setCategoriesState(DEFAULT_EXPENSE_CATEGORIES);
          setDataReady(true);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [auth]);

  useEffect(() => {
    if (!auth || !dataReady) return;
    const timer = window.setTimeout(() => {
      saveAppState({ expenses, incomes, debts, goals, categories, fixedTemplates })
        .catch(error => console.error('Erro ao salvar dados no Supabase:', error));
    }, 350);
    return () => window.clearTimeout(timer);
  }, [auth, dataReady, expenses, incomes, debts, goals, categories, fixedTemplates]);

  const updateExpenses = (newExpenses: Expense[]) => setExpensesState(newExpenses);
  const updateIncomes = (newIncomes: Income[]) => setIncomesState(newIncomes);
  const updateDebts = (newDebts: Debt[]) => setDebtsState(newDebts);
  const updateGoals = (newGoals: Goal[]) => setGoalsState(newGoals);
  const updateCategories = (newCats: Category[]) => setCategoriesState(newCats);
  const updateFixedTemplates = (newTemplates: FixedExpenseTemplate[]) => setFixedTemplatesState(newTemplates);

  const monthlyExpenses = useMemo(() => expenses.filter(e => e.dueDate.startsWith(currentYearMonth)), [expenses, currentYearMonth]);
  const monthlyIncomes = useMemo(() => incomes.filter(i => i.date.startsWith(currentYearMonth)), [incomes, currentYearMonth]);
  const mascotStatus = useMemo(() => evaluateMascotStatus(monthlyExpenses), [monthlyExpenses]);
  const overdueCount = useMemo(() => monthlyExpenses.filter(e => e.status === 'overdue').length, [monthlyExpenses]);
  const pendingCount = useMemo(() => monthlyExpenses.filter(e => e.status === 'pending').length, [monthlyExpenses]);

  const handleLoginSuccess = () => setAuth(true);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuth(false);
    setDataReady(false);
  };

  const handleOpenPayBill = (bill: Expense) => {
    setPayingBill(bill);
    setIsPayModalOpen(true);
  };

  const handleConfirmPayment = (billId: string, paidDate: string, amount: number, notes?: string) => {
    const updated = expenses.map(e => e.id === billId ? { ...e, status: 'paid' as const, paidAt: paidDate, paidAmount: amount, notes: notes !== undefined ? notes : e.notes } : e);
    updateExpenses(updated);
    setIsPayModalOpen(false);
    setPayingBill(null);
  };

  const handleOpenNewTransaction = (type: 'expense' | 'income' = 'expense') => {
    setEditingExpense(null);
    setEditingIncome(null);
    setTransactionModalDefaultType(type);
    setIsTransactionModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setEditingIncome(null);
    setTransactionModalDefaultType('expense');
    setIsTransactionModalOpen(true);
  };

  const handleEditIncome = (income: Income) => {
    setEditingIncome(income);
    setEditingExpense(null);
    setTransactionModalDefaultType('income');
    setIsTransactionModalOpen(true);
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('Deseja realmente excluir esta despesa?')) updateExpenses(expenses.filter(e => e.id !== id));
  };

  const handleDeleteIncome = (id: string) => {
    if (confirm('Deseja realmente excluir esta receita?')) updateIncomes(incomes.filter(i => i.id !== id));
  };

  const handleSaveExpense = (expenseData: Partial<Expense>) => {
    if (editingExpense) {
      updateExpenses(expenses.map(e => e.id === editingExpense.id ? ({ ...e, ...expenseData } as Expense) : e));
    } else {
      const newExp: Expense = {
        id: `exp-${Date.now()}`,
        name: expenseData.name || 'Nova Despesa',
        category: expenseData.category || 'Outros',
        amount: expenseData.amount || 0,
        dueDate: expenseData.dueDate || `${currentYearMonth}-15`,
        status: expenseData.status || 'pending',
        paymentMethod: expenseData.paymentMethod || 'Pix',
        notes: expenseData.notes,
        isFixed: !!expenseData.isFixed,
        repeatMonthly: !!expenseData.repeatMonthly,
        paidAt: expenseData.paidAt,
        paidAmount: expenseData.paidAmount,
        yearMonth: (expenseData.dueDate || currentYearMonth).substring(0, 7),
      };
      updateExpenses([...expenses, newExp]);
    }
    setIsTransactionModalOpen(false);
  };

  const handleSaveIncome = (incomeData: Partial<Income>) => {
    if (editingIncome) {
      updateIncomes(incomes.map(i => i.id === editingIncome.id ? ({ ...i, ...incomeData } as Income) : i));
    } else {
      const newInc: Income = {
        id: `inc-${Date.now()}`,
        description: incomeData.description || 'Nova Receita',
        amount: incomeData.amount || 0,
        date: incomeData.date || `${currentYearMonth}-05`,
        category: incomeData.category || 'Salário',
        isFixed: !!incomeData.isFixed,
        notes: incomeData.notes,
        yearMonth: (incomeData.date || currentYearMonth).substring(0, 7),
      };
      updateIncomes([...incomes, newInc]);
    }
    setIsTransactionModalOpen(false);
  };

  const handleGenerateMonthlyExpenses = (templatesToGenerate: FixedExpenseTemplate[]) => {
    const newExpensesToAdd: Expense[] = [];
    templatesToGenerate.forEach(tpl => {
      const alreadyExists = monthlyExpenses.some(e => e.name.toLowerCase() === tpl.name.toLowerCase());
      if (!alreadyExists) {
        const dayStr = String(tpl.dueDay).padStart(2, '0');
        const dueDate = `${currentYearMonth}-${dayStr}`;
        const todayStr = new Date().toISOString().slice(0, 10);
        const isOverdue = dueDate < todayStr;
        newExpensesToAdd.push({
          id: `exp-fix-${tpl.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: tpl.name,
          category: tpl.category,
          amount: tpl.amount,
          dueDate,
          status: isOverdue ? 'overdue' : 'pending',
          paymentMethod: tpl.paymentMethod,
          notes: tpl.notes,
          isFixed: true,
          repeatMonthly: true,
          yearMonth: currentYearMonth,
        });
      }
    });
    if (newExpensesToAdd.length > 0) updateExpenses([...expenses, ...newExpensesToAdd]);
  };

  const handleRestoreAllData = (backup: any) => {
    if (backup.expenses) updateExpenses(backup.expenses);
    if (backup.incomes) updateIncomes(backup.incomes);
    if (backup.debts) updateDebts(backup.debts);
    if (backup.goals) updateGoals(backup.goals);
    if (backup.categories) updateCategories(backup.categories);
    if (backup.fixedTemplates) updateFixedTemplates(backup.fixedTemplates);
  };

  if (authLoading) return <div className="min-h-screen grid place-items-center bg-[#faf8f5] text-slate-500">Carregando Brotinho…</div>;
  if (!auth) return <LoginView onLoginSuccess={handleLoginSuccess} />;
  if (!dataReady) return <div className="min-h-screen grid place-items-center bg-[#faf8f5] text-slate-500">Sincronizando suas finanças…</div>;

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-800 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentYearMonth={currentYearMonth}
        onMonthChange={setCurrentYearMonth}
        onOpenNewTransaction={handleOpenNewTransaction}
        onLogout={handleLogout}
        mascotStatus={mascotStatus}
        overdueCount={overdueCount}
        pendingCount={pendingCount}
      />

      <main className="flex-1 lg:pl-64 pt-4 pb-20 lg:pb-12 px-3 sm:px-6 max-w-7xl w-full mx-auto">
        {activeTab === 'dashboard' && <DashboardView currentYearMonth={currentYearMonth} expenses={monthlyExpenses} incomes={monthlyIncomes} mascotStatus={mascotStatus} onPayBill={handleOpenPayBill} onNavigateTab={setActiveTab} onOpenNewTransaction={handleOpenNewTransaction} />}
        {activeTab === 'transactions' && <TransactionsView currentYearMonth={currentYearMonth} expenses={monthlyExpenses} incomes={monthlyIncomes} categories={categories} onPayBill={handleOpenPayBill} onEditExpense={handleEditExpense} onDeleteExpense={handleDeleteExpense} onEditIncome={handleEditIncome} onDeleteIncome={handleDeleteIncome} onOpenNewTransaction={() => handleOpenNewTransaction()} />}
        {activeTab === 'bills_to_pay' && <BillsToPayView currentYearMonth={currentYearMonth} expenses={monthlyExpenses} categories={categories} onPayBill={handleOpenPayBill} onEditExpense={handleEditExpense} onOpenNewTransaction={() => handleOpenNewTransaction('expense')} />}
        {activeTab === 'paid_bills' && <PaidBillsView currentYearMonth={currentYearMonth} expenses={monthlyExpenses} onEditExpense={handleEditExpense} />}
        {activeTab === 'overdue' && <OverdueBillsView expenses={monthlyExpenses} onPayBill={handleOpenPayBill} onEditExpense={handleEditExpense} />}
        {activeTab === 'fixed_expenses' && <FixedExpensesView templates={fixedTemplates} categories={categories} currentYearMonth={currentYearMonth} onSaveTemplates={updateFixedTemplates} onGenerateMonthlyExpenses={handleGenerateMonthlyExpenses} />}
        {activeTab === 'incomes' && <IncomesView currentYearMonth={currentYearMonth} incomes={monthlyIncomes} onEditIncome={handleEditIncome} onDeleteIncome={handleDeleteIncome} onOpenNewIncome={() => handleOpenNewTransaction('income')} />}
        {activeTab === 'debts' && <DebtsView debts={debts} onSaveDebts={updateDebts} />}
        {activeTab === 'goals' && <GoalsView goals={goals} onSaveGoals={updateGoals} />}
        {activeTab === 'calendar' && <CalendarView currentYearMonth={currentYearMonth} onMonthChange={setCurrentYearMonth} expenses={monthlyExpenses} onPayBill={handleOpenPayBill} onEditExpense={handleEditExpense} />}
        {activeTab === 'reports' && <ReportsView currentYearMonth={currentYearMonth} allExpenses={expenses} allIncomes={incomes} />}
        {activeTab === 'monthly_summary' && <MonthlySummaryView currentYearMonth={currentYearMonth} expenses={monthlyExpenses} incomes={monthlyIncomes} onNavigateTab={setActiveTab} />}
        {activeTab === 'settings' && <SettingsView categories={categories} onSaveCategories={updateCategories} allExpenses={expenses} allIncomes={incomes} debts={debts} goals={goals} fixedTemplates={fixedTemplates} onRestoreAllData={handleRestoreAllData} />}
      </main>

      <footer className="lg:pl-64 px-4 pb-24 lg:pb-6 text-center text-xs text-slate-500">
        Desenvolvido por <span className="font-semibold text-emerald-700">Lediane França</span>
      </footer>

      <PayBillModal bill={payingBill} onClose={() => { setIsPayModalOpen(false); setPayingBill(null); }} onConfirm={(billId, paidDate, amount) => handleConfirmPayment(billId, paidDate, amount)} />
      <TransactionModal isOpen={isTransactionModalOpen} initialType={transactionModalDefaultType} currentYearMonth={currentYearMonth} categories={categories} editingExpense={editingExpense} editingIncome={editingIncome} onClose={() => { setIsTransactionModalOpen(false); setEditingExpense(null); setEditingIncome(null); }} onSaveExpense={handleSaveExpense} onSaveIncome={handleSaveIncome} />
    </div>
  );
}
