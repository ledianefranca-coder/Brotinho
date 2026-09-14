import { useMemo } from 'react';
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  PieChart as PieIcon, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import { Expense, Income } from '../types.ts';
import { formatCurrency, MONTH_NAMES } from '../utils/formatters.ts';

interface MonthlySummaryViewProps {
  currentYearMonth: string;
  expenses: Expense[];
  incomes: Income[];
  onNavigateTab: (tab: any) => void;
}

export function MonthlySummaryView({
  currentYearMonth,
  expenses,
  incomes,
  onNavigateTab,
}: MonthlySummaryViewProps) {
  const [yearStr, monthStr] = currentYearMonth.split('-');
  const monthName = MONTH_NAMES[parseInt(monthStr, 10) - 1];

  const totalIncomes = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const paidExpenses = expenses
    .filter(e => e.status === 'paid')
    .reduce((acc, curr) => acc + (curr.paidAmount !== undefined ? curr.paidAmount : curr.amount), 0);
  const finalBalance = totalIncomes - paidExpenses;

  // Largest expense
  const largestExpense = useMemo(() => {
    if (expenses.length === 0) return null;
    return [...expenses].sort((a, b) => b.amount - a.amount)[0];
  }, [expenses]);

  // Largest category
  const largestCategory = useMemo(() => {
    const map: { [cat: string]: number } = {};
    expenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? { name: sorted[0][0], amount: sorted[0][1] } : null;
  }, [expenses]);

  const allBillsPaid = expenses.length > 0 && expenses.every(e => e.status === 'paid');

  return (
    <div id="monthly-summary-view" className="space-y-5 animate-in fade-in duration-200 max-w-4xl">
      
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="font-display font-bold text-slate-900 text-lg sm:text-xl">
              Fechamento & Resumo de {monthName} de {yearStr}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Balanço consolidado de receitas, despesas pagas e destaques do período
          </p>
        </div>

        {allBillsPaid ? (
          <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Mês 100% Quitado</span>
          </div>
        ) : (
          <div className="bg-sky-50 border border-sky-200 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs text-sky-800 font-semibold">
            <span>Mês em Andamento</span>
          </div>
        )}
      </div>

      {/* Primary Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Receitas */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-teal-600" /> Receitas Consolidadas
          </span>
          <p className="font-display font-bold text-teal-800 text-xl mt-1.5">
            {formatCurrency(totalIncomes)}
          </p>
          <span className="text-[11px] text-slate-400 block mt-1">
            {incomes.length} lançamento(s)
          </span>
        </div>

        {/* Total Despesas Pagas */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-rose-500" /> Total Efetivamente Pago
          </span>
          <p className="font-display font-bold text-slate-900 text-xl mt-1.5">
            {formatCurrency(paidExpenses)}
          </p>
          <span className="text-[11px] text-slate-400 block mt-1">
            Previsto total: {formatCurrency(totalExpenses)}
          </span>
        </div>

        {/* Saldo Final */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-600" /> Saldo Realizado Atual
          </span>
          <p className={`font-display font-bold text-xl mt-1.5 ${
            finalBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'
          }`}>
            {formatCurrency(finalBalance)}
          </p>
          <span className="text-[11px] text-slate-400 block mt-1">
            {finalBalance >= 0 ? 'Superávit financeiro' : 'Atenção ao déficit'}
          </span>
        </div>

      </div>

      {/* Detailed Insights & Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Maior Despesa do Mês */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs">
          <h3 className="font-display font-semibold text-slate-900 text-base mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Maior Despesa do Mês
          </h3>

          {largestExpense ? (
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/70">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-200 text-slate-700">
                  {largestExpense.category}
                </span>
                <span className="font-display font-bold text-slate-900 text-base">
                  {formatCurrency(largestExpense.amount)}
                </span>
              </div>
              <h4 className="font-display font-bold text-slate-800 text-sm mt-2">
                {largestExpense.name}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Forma: {largestExpense.paymentMethod} • Vencimento: {largestExpense.dueDate}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Nenhuma despesa registrada.</p>
          )}
        </div>

        {/* Categoria com maior gasto */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs">
          <h3 className="font-display font-semibold text-slate-900 text-base mb-3 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-purple-600" />
            Categoria com Maior Impacto
          </h3>

          {largestCategory ? (
            <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200/70">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 text-sm">
                  {largestCategory.name}
                </span>
                <span className="font-display font-bold text-purple-900 text-base">
                  {formatCurrency(largestCategory.amount)}
                </span>
              </div>
              <p className="text-xs text-purple-800/80 mt-1">
                Representa {totalExpenses > 0 ? Math.round((largestCategory.amount / totalExpenses) * 100) : 0}% de todas as despesas deste mês.
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Nenhuma despesa registrada.</p>
          )}
        </div>

      </div>

      {/* Monthly Reflection & Forward Action */}
      <div className="bg-gradient-to-br from-stone-900 to-slate-800 text-white p-6 rounded-3xl shadow-md">
        <h3 className="font-display font-bold text-lg text-emerald-300">
          Metas & Próximos Passos
        </h3>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-xl">
          Use os dados de {monthName} para calibrar o orçamento do próximo período. 
          Se sobrou saldo, que tal direcionar uma fatia para suas Metas Financeiras ou Reserva de Emergência?
        </p>

        <div className="mt-4 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => onNavigateTab('goals')}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Aportar em Metas
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('fixed_expenses')}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Revisar Despesas Fixas
          </button>
        </div>
      </div>

    </div>
  );
}
