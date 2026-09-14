import { useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  AlertTriangle, 
  PieChart as PieIcon 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Expense, Income } from '../types.ts';
import { formatCurrency, MONTH_NAMES } from '../utils/formatters.ts';

interface ReportsViewProps {
  currentYearMonth: string;
  allExpenses: Expense[];
  allIncomes: Income[];
}

const CATEGORY_COLORS: { [key: string]: string } = {
  Moradia: '#6366f1',
  Alimentação: '#10b981',
  Transporte: '#0284c7',
  Saúde: '#ec4899',
  Educação: '#8b5cf6',
  Lazer: '#f59e0b',
  Assinaturas: '#84cc16',
  Dívidas: '#ef4444',
  Outros: '#94a3b8',
};

export function ReportsView({
  currentYearMonth,
  allExpenses,
  allIncomes,
}: ReportsViewProps) {
  // Current month expenses and incomes
  const currentMonthExpenses = useMemo(() => {
    return allExpenses.filter(e => e.dueDate.startsWith(currentYearMonth));
  }, [allExpenses, currentYearMonth]);

  const currentMonthIncomes = useMemo(() => {
    return allIncomes.filter(i => i.date.startsWith(currentYearMonth));
  }, [allIncomes, currentYearMonth]);

  // Financial totals for current month
  const totalExpenses = currentMonthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalIncomes = currentMonthIncomes.reduce((acc, curr) => acc + curr.amount, 0);
  const paidExpenses = currentMonthExpenses
    .filter(e => e.status === 'paid')
    .reduce((acc, curr) => acc + (curr.paidAmount !== undefined ? curr.paidAmount : curr.amount), 0);
  const pendingExpenses = totalExpenses - paidExpenses;

  // Income commitment percentage
  const commitmentRatio = totalIncomes > 0 ? (totalExpenses / totalIncomes) * 100 : 0;
  const commitmentStatus = commitmentRatio <= 70 
    ? { label: 'Saudável (Até 70%)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
    : commitmentRatio <= 90
      ? { label: 'Alerta (70% - 90%)', color: 'text-amber-800 bg-amber-50 border-amber-200' }
      : { label: 'Crítico (Acima de 90%)', color: 'text-rose-700 bg-rose-50 border-rose-200' };

  // Category breakdown data
  const categoryData = useMemo(() => {
    const map: { [cat: string]: number } = {};
    currentMonthExpenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });

    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value,
        color: CATEGORY_COLORS[name] || '#64748b',
      }))
      .sort((a, b) => b.value - a.value);
  }, [currentMonthExpenses]);

  // Status breakdown data
  const statusData = useMemo(() => {
    return [
      { name: 'Pagas', value: paidExpenses, color: '#10b981' },
      { name: 'A pagar / Atrasadas', value: Math.max(0, pendingExpenses), color: '#0284c7' },
    ].filter(d => d.value > 0);
  }, [paidExpenses, pendingExpenses]);

  // Multi-month comparison (last 4 months)
  const monthlyComparisonData = useMemo(() => {
    const [currY, currM] = currentYearMonth.split('-').map(Number);
    const months = [];

    for (let i = 3; i >= 0; i--) {
      let m = currM - i;
      let y = currY;
      while (m <= 0) {
        m += 12;
        y -= 1;
      }
      const ymStr = `${y}-${String(m).padStart(2, '0')}`;
      const mExpenses = allExpenses
        .filter(e => e.dueDate.startsWith(ymStr))
        .reduce((a, c) => a + c.amount, 0);
      const mIncomes = allIncomes
        .filter(inc => inc.date.startsWith(ymStr))
        .reduce((a, c) => a + c.amount, 0);

      months.push({
        monthName: `${MONTH_NAMES[m - 1].slice(0, 3)}/${String(y).slice(2)}`,
        Receitas: mIncomes,
        Despesas: mExpenses,
        Saldo: mIncomes - mExpenses,
      });
    }

    return months;
  }, [allExpenses, allIncomes, currentYearMonth]);

  return (
    <div id="reports-view" className="space-y-5 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="font-display font-bold text-slate-900 text-lg sm:text-xl">
              Relatórios e Indicadores
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Análises visuais de categorias, comparativos e comprometimento de renda
          </p>
        </div>

        {/* Commitment Badge */}
        <div className={`px-4 py-2.5 rounded-2xl border flex items-center gap-3 ${commitmentStatus.color}`}>
          {commitmentRatio <= 70 ? (
            <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
          )}
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider block">
              Comprometimento da Renda
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-bold text-base sm:text-lg">
                {commitmentRatio.toFixed(1)}%
              </span>
              <span className="text-[11px] font-semibold opacity-85">
                {commitmentStatus.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-teal-600" /> Total Receitas do Mês
          </span>
          <p className="font-display font-bold text-teal-800 text-lg sm:text-xl mt-1">
            {formatCurrency(totalIncomes)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-slate-600" /> Total Despesas do Mês
          </span>
          <p className="font-display font-bold text-slate-900 text-lg sm:text-xl mt-1">
            {formatCurrency(totalExpenses)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Saldo Livre Previsto</span>
          <p className={`font-display font-bold text-lg sm:text-xl mt-1 ${
            totalIncomes - totalExpenses >= 0 ? 'text-emerald-700' : 'text-rose-600'
          }`}>
            {formatCurrency(totalIncomes - totalExpenses)}
          </p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Category Breakdown (Donut Chart) */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-600" />
                Despesas por Categoria
              </h3>
              <span className="text-xs text-slate-400 font-medium">Mês Atual</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Distribuição de gastos por centros de custo
            </p>
          </div>

          {categoryData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              Sem despesas cadastradas para este mês.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-1/2 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {categoryData.map(entry => (
                        <Cell key={`cell-${entry.name}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [formatCurrency(Number(val)), 'Valor']}
                      contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full sm:w-1/2 space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {categoryData.map(cat => {
                  const pct = totalExpenses > 0 ? Math.round((cat.value / totalExpenses) * 100) : 0;
                  return (
                    <div key={cat.name} className="flex items-center justify-between text-xs py-1 border-b border-stone-50">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="text-slate-700 truncate font-medium">{cat.name}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-semibold text-slate-900">{formatCurrency(cat.value)}</span>
                        <span className="text-[10px] text-slate-400 ml-1.5">({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Paid vs To Pay Proportion (Donut Chart) */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-sky-600" />
                Contas Pagas vs A Pagar
              </h3>
              <span className="text-xs text-slate-400 font-medium">Mês Atual</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Ritmo de liquidação financeira no período
            </p>
          </div>

          {statusData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              Sem contas para comparar neste mês.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-1/2 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {statusData.map(entry => (
                        <Cell key={`cell-${entry.name}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [formatCurrency(Number(val)), 'Total']}
                      contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full sm:w-1/2 space-y-3">
                <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
                  <span className="text-xs font-semibold text-emerald-800 block">Contas Já Pagas</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="font-display font-bold text-emerald-950 text-base">
                      {formatCurrency(paidExpenses)}
                    </span>
                    <span className="text-xs font-bold text-emerald-700">
                      {totalExpenses > 0 ? Math.round((paidExpenses / totalExpenses) * 100) : 0}%
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-sky-50/70 border border-sky-200/80 rounded-xl">
                  <span className="text-xs font-semibold text-sky-800 block">A Pagar / Pendentes</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="font-display font-bold text-sky-950 text-base">
                      {formatCurrency(pendingExpenses)}
                    </span>
                    <span className="text-xs font-bold text-sky-700">
                      {totalExpenses > 0 ? Math.round((pendingExpenses / totalExpenses) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Multi-Month Historical Bar Chart */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-display font-bold text-slate-900 text-base">
              Evolução Histórica: Receitas vs Despesas
            </h3>
            <p className="text-xs text-slate-500">
              Comparativo dos últimos 4 meses de movimentações consolidadas
            </p>
          </div>
        </div>

        <div className="h-72 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyComparisonData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <XAxis dataKey="monthName" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(val: number) => `R$${val}`} />
              <Tooltip 
                formatter={(val: any) => [formatCurrency(Number(val)), '']}
                contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
              <Bar dataKey="Receitas" fill="#0d9488" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Despesas" fill="#64748b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
