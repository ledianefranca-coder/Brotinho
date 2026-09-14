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
import { 
  initializeSeedData, 
  isAuthenticated, 
  setAuthenticated,
  getCategories, 
  saveCategories,
  getExpenses, 
  saveExpenses,
  getIncomes, 
  saveIncomes,
  getDebts, 
  saveDebts,
  getGoals, 
  saveGoals,
  getFixedTemplates, 
  saveFixedTemplates,
} from './utils/storage.ts';
import { evaluateMascotStatus } from './utils/mascotEvaluator.ts';
import { Navigation } from './components/Navigation.tsx';
import { PayBillModal } from './components/PayBillModal.tsx';
import { TransactionModal } from './components/TransactionModal.tsx';

// Views
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
  // Authentication state
  const [auth, setAuth] = useState<boolean>(() => isAuthenticated());

  // Current selected month (defaulting to September 2026 where demo data resides)
  const [currentYearMonth, setCurrentYearMonth] = useState<string>('2026-09');

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Central data states
  const [expenses, setExpensesState] = useState<Expense[]>([]);
  const [incomes, setIncomesState] = useState<Income[]>([]);
  const [debts, setDebtsState] = useState<Debt[]>([]);
  const [goals, setGoalsState] = useState<Goal[]>([]);
  const [categories, setCategoriesState] = useState<Category[]>([]);
  const [fixedTemplates, setFixedTemplatesState] = useState<FixedExpenseTemplate[]>([]);

  // Modals state
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payingBill, setPayingBill] = useState<Expense | null>(null);

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionModalDefaultType, setTransactionModalDefaultType] = useState<'expense' | 'income'>('expense');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  // Initialize data on mount
  useEffect(() => {
    initializeSeedData();
    const storedExpenses = getExpenses();
    const storedIncomes = getIncomes();
    const storedDebts = getDebts();
    const storedGoals = getGoals();
    const storedCats = getCategories();
    const storedTemplates = getFixedTemplates();

    // Auto-check overdue status based on current date (September 14, 2026)
    const todayStr = '2026-09-14';
    let hasChanges = false;
    const refreshedExpenses = storedExpenses.map(e => {
      if (e.status === 'pending' && e.dueDate < todayStr) {
        hasChanges = true;
        return { ...e, status: 'overdue' as const };
      }
      return e;
    });

    if (hasChanges) {
      saveExpenses(refreshedExpenses);
      setExpensesState(refreshedExpenses);
    } else {
      setExpensesState(storedExpenses);
    }

    setIncomesState(storedIncomes);
    setDebtsState(storedDebts);
    setGoalsState(storedGoals);
    setCategoriesState(storedCats);
    setFixedTemplatesState(storedTemplates);
  }, []);

  // Update helper functions
  const updateExpenses = (newExpenses: Expense[]) => {
    setExpensesState(newExpenses);
    saveExpenses(newExpenses);
  };

  const updateIncomes = (newIncomes: Income[]) => {
    setIncomesState(newIncomes);
    saveIncomes(newIncomes);
  };

  const updateDebts = (newDebts: Debt[]) => {
    setDebtsState(newDebts);
    saveDebts(newDebts);
  };

  const updateGoals = (newGoals: Goal[]) => {
    setGoalsState(newGoals);
    saveGoals(newGoals);
  };

  const updateCategories = (newCats: Category[]) => {
    setCategoriesState(newCats);
    saveCategories(newCats);
  };

  const updateFixedTemplates = (newTemplates: FixedExpenseTemplate[]) => {
    setFixedTemplatesState(newTemplates);
    saveFixedTemplates(newTemplates);
  };

  // Filter expenses and incomes for the active month
  const monthlyExpenses = useMemo(() => {
    return expenses.filter(e => e.dueDate.startsWith(currentYearMonth));
  }, [expenses, currentYearMonth]);

  const monthlyIncomes = useMemo(() => {
    return incomes.filter(i => i.date.startsWith(currentYearMonth));
  }, [incomes, currentYearMonth]);

  // Mascot evaluation for current month
  const mascotStatus = useMemo(() => {
    return evaluateMascotStatus(monthlyExpenses);
  }, [monthlyExpenses]);

  // Counts for badge notifications
  const overdueCount = useMemo(() => {
    return monthlyExpenses.filter(e => e.status === 'overdue').length;
  }, [monthlyExpenses]);

  const pendingCount = useMemo(() => {
    return monthlyExpenses.filter(e => e.status === 'pending').length;
  }, [monthlyExpenses]);

  // Authentication handlers
  const handleLoginSuccess = () => {
    setAuthenticated(true);
    setAuth(true);
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setAuth(false);
  };

  // Payment Modal handlers
  const handleOpenPayBill = (bill: Expense) => {
    setPayingBill(bill);
    setIsPayModalOpen(true);
  };

  const handleConfirmPayment = (billId: string, paidDate: string, amount: number, notes?: string) => {
    const updated = expenses.map(e => {
      if (e.id === billId) {
        return {
          ...e,
          status: 'paid' as const,
          paidAt: paidDate,
          paidAmount: amount,
          notes: notes !== undefined ? notes : e.notes,
        };
      }
      return e;
    });
    updateExpenses(updated);
    setIsPayModalOpen(false);
    setPayingBill(null);
  };

  // Transaction Modal handlers
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
    if (confirm('Deseja realmente excluir esta despesa?')) {
      updateExpenses(expenses.filter(e => e.id !== id));
    }
  };

  const handleDeleteIncome = (id: string) => {
    if (confirm('Deseja realmente excluir esta receita?')) {
      updateIncomes(incomes.filter(i => i.id !== id));
    }
  };

  const handleSaveExpense = (expenseData: Partial<Expense>) => {
    if (editingExpense) {
      const updated = expenses.map(e =>
        e.id === editingExpense.id
          ? ({ ...e, ...expenseData } as Expense)
          : e
      );
      updateExpenses(updated);
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
      const updated = incomes.map(i =>
        i.id === editingIncome.id
          ? ({ ...i, ...incomeData } as Income)
          : i
      );
      updateIncomes(updated);
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

  // Generate monthly expenses from active fixed templates
  const handleGenerateMonthlyExpenses = (templatesToGenerate: FixedExpenseTemplate[]) => {
    const newExpensesToAdd: Expense[] = [];

    templatesToGenerate.forEach(tpl => {
      // Check if an expense with the same name already exists in this month
      const alreadyExists = monthlyExpenses.some(
        e => e.name.toLowerCase() === tpl.name.toLowerCase()
      );

      if (!alreadyExists) {
        const dayStr = String(tpl.dueDay).padStart(2, '0');
        const dueDate = `${currentYearMonth}-${dayStr}`;
        const todayStr = '2026-09-14';
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

    if (newExpensesToAdd.length > 0) {
      updateExpenses([...expenses, ...newExpensesToAdd]);
    }
  };

  // Restore backup from JSON
  const handleRestoreAllData = (backup: any) => {
    if (backup.expenses) updateExpenses(backup.expenses);
    if (backup.incomes) updateIncomes(backup.incomes);
    if (backup.debts) updateDebts(backup.debts);
    if (backup.goals) updateGoals(backup.goals);
    if (backup.categories) updateCategories(backup.categories);
    if (backup.fixedTemplates) updateFixedTemplates(backup.fixedTemplates);
  };

  // If not authenticated, render LoginView
  if (!auth) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-800 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Top Header & Navigation Sidebar */}
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

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 pt-4 pb-20 lg:pb-12 px-3 sm:px-6 max-w-7xl w-full mx-auto">
        
        {/* Render View according to activeTab */}
        {activeTab === 'dashboard' && (
          <DashboardView
            currentYearMonth={currentYearMonth}
            expenses={monthlyExpenses}
            incomes={monthlyIncomes}
            mascotStatus={mascotStatus}
            onPayBill={handleOpenPayBill}
            onNavigateTab={setActiveTab}
            onOpenNewTransaction={handleOpenNewTransaction}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            currentYearMonth={currentYearMonth}
            expenses={monthlyExpenses}
            incomes={monthlyIncomes}
            categories={categories}
            onPayBill={handleOpenPayBill}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
            onEditIncome={handleEditIncome}
            onDeleteIncome={handleDeleteIncome}
            onOpenNewTransaction={() => handleOpenNewTransaction()}
          />
        )}

        {activeTab === 'bills_to_pay' && (
          <BillsToPayView
            currentYearMonth={currentYearMonth}
            expenses={monthlyExpenses}
            categories={categories}
            onPayBill={handleOpenPayBill}
            onEditExpense={handleEditExpense}
            onOpenNewTransaction={() => handleOpenNewTransaction('expense')}
          />
        )}

        {activeTab === 'paid_bills' && (
          <PaidBillsView
            currentYearMonth={currentYearMonth}
            expenses={monthlyExpenses}
            onEditExpense={handleEditExpense}
          />
        )}

        {activeTab === 'overdue' && (
          <OverdueBillsView
            expenses={monthlyExpenses}
            onPayBill={handleOpenPayBill}
            onEditExpense={handleEditExpense}
          />
        )}

        {activeTab === 'fixed_expenses' && (
          <FixedExpensesView
            templates={fixedTemplates}
            categories={categories}
            currentYearMonth={currentYearMonth}
            onSaveTemplates={updateFixedTemplates}
            onGenerateMonthlyExpenses={handleGenerateMonthlyExpenses}
          />
        )}

        {activeTab === 'incomes' && (
          <IncomesView
            currentYearMonth={currentYearMonth}
            incomes={monthlyIncomes}
            onEditIncome={handleEditIncome}
            onDeleteIncome={handleDeleteIncome}
            onOpenNewIncome={() => handleOpenNewTransaction('income')}
          />
        )}

        {activeTab === 'debts' && (
          <DebtsView
            debts={debts}
            onSaveDebts={updateDebts}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsView
            goals={goals}
            onSaveGoals={updateGoals}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            currentYearMonth={currentYearMonth}
            onMonthChange={setCurrentYearMonth}
            expenses={monthlyExpenses}
            onPayBill={handleOpenPayBill}
            onEditExpense={handleEditExpense}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            currentYearMonth={currentYearMonth}
            allExpenses={expenses}
            allIncomes={incomes}
          />
        )}

        {activeTab === 'monthly_summary' && (
          <MonthlySummaryView
            currentYearMonth={currentYearMonth}
            expenses={monthlyExpenses}
            incomes={monthlyIncomes}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            categories={categories}
            onSaveCategories={updateCategories}
            allExpenses={expenses}
            allIncomes={incomes}
            debts={debts}
            goals={goals}
            fixedTemplates={fixedTemplates}
            onRestoreAllData={handleRestoreAllData}
          />
        )}

      </main>

      {/* Pay Bill Modal */}
      <PayBillModal
        bill={payingBill}
        onClose={() => {
          setIsPayModalOpen(false);
          setPayingBill(null);
        }}
        onConfirm={(billId, paidDate, amount) => {
          handleConfirmPayment(billId, paidDate, amount);
        }}
      />

      {/* Create / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        initialType={transactionModalDefaultType}
        currentYearMonth={currentYearMonth}
        categories={categories}
        editingExpense={editingExpense}
        editingIncome={editingIncome}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingExpense(null);
          setEditingIncome(null);
        }}
        onSaveExpense={handleSaveExpense}
        onSaveIncome={handleSaveIncome}
      />

    </div>
  );
}
