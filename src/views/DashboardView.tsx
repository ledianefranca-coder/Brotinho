import { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Wallet, 
  PiggyBank, 
  ArrowRight,
  Plus,
  PieChart as PieIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';
import { Expense, Income, MascotStatus, ActiveTab } from '../types.ts';
import { formatCurrency, formatYearMonth, getRelativeDueLabel } from '../utils/formatters.ts';
import { Mascot } from '../components/Mascot.tsx';
import { AlertsBanner } from '../components/AlertsBanner.tsx';

const CATEGORY_COLORS: Record<string, string> = {
  Moradia: '#6366f1',       // Indigo
  Alimentação: '#10b981',   // Emerald
  Transporte: '#0284c7',    // Sky
  Saúde: '#ec4899',         // Pink
  Educação: '#8b5cf6',      // Purple
  Lazer: '#f59e0b',         // Amber
  Assinaturas: '#06b6d4',   // Cyan
  Dívidas: '#ef4444',       // Red
  Outros: '#94a3b8',        // Slate
  Investimentos: '#14b8a6', // Teal
  Vestuário: '#f97316',     // Orange
  Beleza: '#d946ef',        // Fuchsia
};

const PALETTE_FALLBACK = [
  '#6366f1', '#10b981', '#0284c7', '#ec4899', '#f59e0b', 
  '#8b5cf6', '#06b6d4', '#ef4444', '#14b8a6', '#f97316', 
  '#84cc16', '#d946ef', '#64748b'
];

interface DashboardViewProps {
  currentYearMonth: string;
  expenses: Expense[];
  incomes: Income[];
  mascotStatus: MascotStatus;
  onNavigateTab: (tab: ActiveTab) => void;
  onPayBill: (bill: Expense) => void;
  onOpenNewTransaction: (type?: 'expense' | 'income') => void;
}

export function DashboardView({
  currentYearMonth,
  expenses,
  incomes,
  mascotStatus,
  onNavigateTab,
  onPayBill,
  onOpenNewTransaction,
}: DashboardViewProps) {
  // Calculations for the current month
  const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const paidExpenses = expenses.filter(e => e.status === 'paid');
  const pendingExpenses = expenses.filter(e => e.status === 'pending');
  const overdueExpenses = expenses.filter(e => e.status === 'overdue');

  const totalPaid = paidExpenses.reduce((acc, curr) => acc + (curr.paidAmount !== undefined ? curr.paidAmount : curr.amount), 0);
  const totalToPay = pendingExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalOverdue = overdueExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  const projectedBalance = totalIncome - totalExpenses;
  const currentBalance = totalIncome - totalPaid;

  // Ratios for Visual Indicators
  const incomeExpenseRatio = totalIncome > 0 
    ? Math.min(Math.round((totalExpenses / totalIncome) * 100), 100) 
    : 0;

  const paidRatio = totalExpenses > 0 ? (totalPaid / totalExpenses) * 100 : 0;
  const pendingRatio = totalExpenses > 0 ? (totalToPay / totalExpenses) * 100 : 0;
  const overdueRatio = totalExpenses > 0 ? (totalOverdue / totalExpenses) * 100 : 0;

  // Upcoming bills: sorted by due date
  const sortedBills = [...expenses].sort((a, b) => {
    // Overdue first, then pending, then paid
    const order = { overdue: 0, pending: 1, paid: 2 };
    if (order[a.status] !== order[b.status]) {
      return order[a.status] - order[b.status];
    }
    return a.dueDate.localeCompare(b.dueDate);
  });

  const previewBills = sortedBills.slice(0, 5);

  // Group by category for visual expense breakdown (Pie chart)
  const categoryChartData = useMemo(() => {
    const totals: Record<string, number> = {};
    expenses.forEach(e => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });

    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], index) => ({
        name,
        value,
        color: CATEGORY_COLORS[name] || PALETTE_FALLBACK[index % PALETTE_FALLBACK.length],
      }));
  }, [expenses]);

  return (
    <div id="dashboard-view-container" className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Welcome & Mascot Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
        <div className="lg:col-span-2">
          <Mascot status={mascotStatus} size="md" />
        </div>

        {/* Quick Month Info / Mood Callout */}
        <div className="bg-white/80 border border-stone-200/80 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-xs text-slate-500 font-medium">Mês em visualização</p>
            <h2 className="font-display font-bold text-slate-800 text-lg">
              {formatYearMonth(currentYearMonth)}
            </h2>
            <p className="text-xs text-emerald-700 font-semibold mt-0.5">
              {expenses.length} contas | {incomes.length} entradas
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenNewTransaction()}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Movimento
          </button>
        </div>
      </div>

      {/* Financial Alerts Banner */}
      <AlertsBanner
        expenses={expenses}
        onFilterClick={status => {
          if (status === 'overdue') onNavigateTab('overdue');
          else if (status === 'today' || status === 'upcoming') onNavigateTab('bills_to_pay');
        }}
      />

      {/* 7 Metric Cards Grid */}
      <div id="dashboard-metric-cards" className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* 1. Receita do Mês */}
        <div 
          onClick={() => onNavigateTab('incomes')}
          className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-xs transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Receitas do Mês</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-105 transition">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="font-display font-bold text-slate-900 text-lg sm:text-xl mt-2 truncate text-teal-800">
            {formatCurrency(totalIncome)}
          </p>
          <span className="text-[11px] text-teal-600 font-medium">Entradas confirmadas</span>
        </div>

        {/* 2. Total de Despesas */}
        <div 
          onClick={() => onNavigateTab('transactions')}
          className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-xs transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Despesas</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="font-display font-bold text-slate-900 text-lg sm:text-xl mt-2 truncate">
            {formatCurrency(totalExpenses)}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">{expenses.length} despesas no mês</span>
        </div>

        {/* 3. Total Pago */}
        <div 
          onClick={() => onNavigateTab('paid_bills')}
          className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-xs transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Pago</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="font-display font-bold text-emerald-900 text-lg sm:text-xl mt-2 truncate">
            {formatCurrency(totalPaid)}
          </p>
          <span className="text-[11px] text-emerald-700 font-medium">{paidExpenses.length} contas liquidadas</span>
        </div>

        {/* 4. Total a Pagar */}
        <div 
          onClick={() => onNavigateTab('bills_to_pay')}
          className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-xs transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total a Pagar</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center group-hover:scale-105 transition">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="font-display font-bold text-sky-900 text-lg sm:text-xl mt-2 truncate">
            {formatCurrency(totalToPay)}
          </p>
          <span className="text-[11px] text-sky-700 font-medium">{pendingExpenses.length} contas pendentes</span>
        </div>

        {/* 5. Total Atrasado */}
        <div 
          onClick={() => onNavigateTab('overdue')}
          className={`bg-white p-4 rounded-2xl border shadow-2xs hover:shadow-xs transition cursor-pointer group ${
            totalOverdue > 0 ? 'border-rose-300 bg-rose-50/20' : 'border-stone-200/90'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Atrasado</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center group-hover:scale-105 transition ${
              totalOverdue > 0 ? 'bg-rose-100 text-rose-700' : 'bg-stone-100 text-slate-400'
            }`}>
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className={`font-display font-bold text-lg sm:text-xl mt-2 truncate ${
            totalOverdue > 0 ? 'text-rose-700' : 'text-slate-700'
          }`}>
            {formatCurrency(totalOverdue)}
          </p>
          <span className={`text-[11px] font-medium ${totalOverdue > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
            {overdueExpenses.length === 0 ? 'Nenhuma pendência' : `${overdueExpenses.length} conta(s) vencida(s)`}
          </span>
        </div>

        {/* 6. Saldo Previsto */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Saldo Previsto</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <p className={`font-display font-bold text-lg sm:text-xl mt-2 truncate ${
            projectedBalance >= 0 ? 'text-slate-900' : 'text-rose-700'
          }`}>
            {formatCurrency(projectedBalance)}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Receita menos todas despesas</span>
        </div>

        {/* 7. Saldo Atual (Col span 2 on medium screens for balance) */}
        <div className="col-span-2 bg-gradient-to-br from-emerald-900 to-teal-950 text-white p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-200">Saldo Atual em Caixa</span>
            <div className="w-8 h-8 rounded-xl bg-white/10 text-emerald-300 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="font-display font-bold text-2xl sm:text-3xl text-emerald-50">
              {formatCurrency(currentBalance)}
            </p>
            <span className="text-xs text-emerald-300 font-medium">disponível</span>
          </div>
          <p className="text-[11px] text-emerald-200/80 mt-1">
            Receita confirmada ({formatCurrency(totalIncome)}) menos o que já foi pago ({formatCurrency(totalPaid)})
          </p>
        </div>

      </div>

      {/* Visual Indicators: Receitas x Despesas & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Indicator 1: Receitas x Despesas */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-semibold text-slate-800 text-sm">
              Receitas x Despesas
            </h3>
            <span className="text-xs font-bold text-slate-600">
              {incomeExpenseRatio}% comprometido
            </span>
          </div>
          
          {/* Visual bar */}
          <div className="h-4 bg-stone-100 rounded-full overflow-hidden flex">
            <div 
              style={{ width: `${Math.min(incomeExpenseRatio, 100)}%` }}
              className={`h-full transition-all duration-500 ${
                incomeExpenseRatio > 90 ? 'bg-rose-500' : incomeExpenseRatio > 70 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
          </div>

          <div className="flex items-center justify-between mt-3 text-xs text-slate-600 pt-2 border-t border-stone-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              <span>Receitas: <strong className="text-slate-800">{formatCurrency(totalIncome)}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Despesas: <strong className="text-slate-800">{formatCurrency(totalExpenses)}</strong></span>
            </div>
          </div>
        </div>

        {/* Indicator 2: Pago / A Pagar / Atrasado */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-semibold text-slate-800 text-sm">
              Status das Despesas do Mês
            </h3>
            <span className="text-xs text-slate-500">
              {Math.round(paidRatio)}% liquidado
            </span>
          </div>

          {/* Segmented bar */}
          <div className="h-4 bg-stone-100 rounded-full overflow-hidden flex gap-0.5">
            <div 
              style={{ width: `${paidRatio}%` }} 
              className="h-full bg-emerald-500 transition-all duration-500" 
              title={`Pago: ${formatCurrency(totalPaid)}`}
            />
            <div 
              style={{ width: `${pendingRatio}%` }} 
              className="h-full bg-sky-400 transition-all duration-500" 
              title={`A Pagar: ${formatCurrency(totalToPay)}`}
            />
            <div 
              style={{ width: `${overdueRatio}%` }} 
              className="h-full bg-rose-500 transition-all duration-500" 
              title={`Atrasado: ${formatCurrency(totalOverdue)}`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-xs text-slate-600 pt-2 border-t border-stone-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Pago: <strong>{formatCurrency(totalPaid)}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span>A pagar: <strong>{formatCurrency(totalToPay)}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Atrasado: <strong className="text-rose-700">{formatCurrency(totalOverdue)}</strong></span>
            </div>
          </div>
        </div>

      </div>

      {/* Two Column Grid: Upcoming Bills & Top Expense Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Upcoming & Priority Bills List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-slate-900 text-base">
                Próximas Contas e Vencimentos
              </h3>
              <p className="text-xs text-slate-500">Acompanhe as contas prioritárias do mês</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('transactions')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer"
            >
              Ver todas ({expenses.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {previewBills.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Nenhuma despesa cadastrada neste mês.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {previewBills.map(bill => {
                const relative = getRelativeDueLabel(bill.dueDate, bill.status);
                return (
                  <div key={bill.id} className="py-3 flex items-center justify-between gap-3 group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        bill.status === 'paid' 
                          ? 'bg-emerald-500' 
                          : bill.status === 'overdue' 
                            ? 'bg-rose-500 ring-4 ring-rose-100' 
                            : 'bg-sky-500'
                      }`} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-slate-950">
                          {bill.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>{bill.category}</span>
                          <span>•</span>
                          <span className={
                            relative.urgency === 'urgent' 
                              ? 'text-rose-600 font-semibold' 
                              : relative.urgency === 'warning' 
                                ? 'text-amber-600 font-medium' 
                                : 'text-slate-500'
                          }>
                            {relative.label} ({bill.dueDate})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-display font-bold text-slate-900 text-sm sm:text-base">
                        {formatCurrency(bill.amount)}
                      </span>

                      {bill.status !== 'paid' ? (
                        <button
                          type="button"
                          onClick={() => onPayBill(bill)}
                          className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg transition cursor-pointer"
                        >
                          Pagar
                        </button>
                      ) : (
                        <span className="px-2 py-0.5 text-[11px] font-medium bg-stone-100 text-slate-500 rounded-md">
                          Paga
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Expense Categories Breakdown - Pie Chart */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display font-semibold text-slate-900 text-base flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-600" />
                Maiores Gastos
              </h3>
              {categoryChartData.length > 0 && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                  {categoryChartData.length} categorias
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-3">Por categoria neste mês</p>

            {categoryChartData.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center text-xs text-slate-400">
                <PieIcon className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
                Sem dados suficientes neste mês.
              </div>
            ) : (
              <div className="space-y-3">
                {/* Gráfico em Pizza / Rosca com cores distintas */}
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={38}
                        outerRadius={66}
                        paddingAngle={3}
                      >
                        {categoryChartData.map(entry => (
                          <Cell 
                            key={`dash-pie-${entry.name}`} 
                            fill={entry.color} 
                            stroke="#ffffff" 
                            strokeWidth={2} 
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any) => [formatCurrency(Number(val)), 'Total']}
                        contentStyle={{ 
                          borderRadius: '12px', 
                          fontSize: '12px', 
                          border: '1px solid #e2e8f0', 
                          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                          padding: '6px 10px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legenda com cores diferentes para cada categoria */}
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 divide-y divide-stone-50">
                  {categoryChartData.map(cat => {
                    const pct = totalExpenses > 0 ? Math.round((cat.value / totalExpenses) * 100) : 0;
                    return (
                      <div key={cat.name} className="flex items-center justify-between text-xs pt-1.5 first:pt-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span 
                            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" 
                            style={{ backgroundColor: cat.color }} 
                          />
                          <span className="font-medium text-slate-700 truncate">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 pl-2">
                          <span className="font-semibold text-slate-900">{formatCurrency(cat.value)}</span>
                          <span className="text-[11px] font-medium text-slate-400">({pct}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={() => onNavigateTab('reports')}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-700 hover:bg-stone-100 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Ver relatório completo
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
