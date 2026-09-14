import { useState, useMemo } from 'react';
import { Clock, CheckCircle2, Search, Plus } from 'lucide-react';
import { Expense, Category } from '../types.ts';
import { formatCurrency, formatDate, getRelativeDueLabel } from '../utils/formatters.ts';

interface BillsToPayViewProps {
  currentYearMonth: string;
  expenses: Expense[];
  categories: Category[];
  onPayBill: (bill: Expense) => void;
  onEditExpense: (bill: Expense) => void;
  onOpenNewTransaction: () => void;
}

export function BillsToPayView({
  expenses,
  categories,
  onPayBill,
  onEditExpense,
  onOpenNewTransaction,
}: BillsToPayViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOption, setSortOption] = useState<'due_asc' | 'due_desc' | 'amount_desc' | 'amount_asc'>('due_asc');

  // Filter only pending (or pending + overdue if desired; prompt says "Contas a pagar")
  const pendingBills = useMemo(() => {
    return expenses
      .filter(e => e.status === 'pending' || e.status === 'overdue')
      .filter(e => {
        const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = selectedCategory === 'all' || e.category === selectedCategory;
        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        if (sortOption === 'due_asc') return a.dueDate.localeCompare(b.dueDate);
        if (sortOption === 'due_desc') return b.dueDate.localeCompare(a.dueDate);
        if (sortOption === 'amount_desc') return b.amount - a.amount;
        return a.amount - b.amount;
      });
  }, [expenses, searchQuery, selectedCategory, sortOption]);

  const totalToPay = pendingBills.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div id="bills-to-pay-view" className="space-y-5 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h2 className="font-display font-bold text-slate-900 text-lg sm:text-xl">
              Contas a Pagar
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Planejamento e controle de todas as obrigações financeiras pendentes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-sky-50/80 border border-sky-200/80 rounded-xl px-4 py-2 text-right">
            <span className="text-[11px] font-semibold text-sky-800 uppercase block">Total a Quitar</span>
            <span className="font-display font-bold text-sky-950 text-base sm:text-lg">
              {formatCurrency(totalToPay)}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nova Despesa
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nome da despesa..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none bg-white transition cursor-pointer"
          >
            <option value="all">Todas as Categorias</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={sortOption}
            onChange={e => setSortOption(e.target.value as any)}
            className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none bg-white transition cursor-pointer"
          >
            <option value="due_asc">Vencimento: Mais próximo primeiro</option>
            <option value="due_desc">Vencimento: Mais distante primeiro</option>
            <option value="amount_desc">Maior valor primeiro</option>
            <option value="amount_asc">Menor valor primeiro</option>
          </select>
        </div>
      </div>

      {/* Bills Cards Grid */}
      {pendingBills.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200/90 p-12 text-center shadow-2xs">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <p className="font-semibold text-slate-800 text-sm">Que alívio! Nenhuma conta pendente para este mês.</p>
          <p className="text-xs text-slate-500 mt-1">Todas as obrigações financeiras deste período estão liquidadas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingBills.map(bill => {
            const relative = getRelativeDueLabel(bill.dueDate, bill.status);
            const isOverdue = bill.status === 'overdue';

            return (
              <div 
                key={bill.id} 
                className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between shadow-2xs hover:shadow-xs ${
                  isOverdue 
                    ? 'border-rose-300 bg-rose-50/15 ring-2 ring-rose-100' 
                    : 'border-stone-200/90'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-slate-600">
                      {bill.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isOverdue 
                        ? 'bg-rose-100 text-rose-800' 
                        : relative.urgency === 'urgent'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-sky-100 text-sky-800'
                    }`}>
                      {relative.label}
                    </span>
                  </div>

                  <h3 
                    onClick={() => onEditExpense(bill)}
                    className="font-display font-semibold text-slate-900 text-base hover:text-emerald-700 cursor-pointer transition line-clamp-1"
                  >
                    {bill.name}
                  </h3>

                  <div className="flex items-center justify-between mt-3 text-xs text-slate-500 pt-2 border-t border-stone-100">
                    <span>Vencimento:</span>
                    <span className="font-semibold text-slate-800">{formatDate(bill.dueDate)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                    <span>Forma de pagamento:</span>
                    <span className="font-medium text-slate-700">{bill.paymentMethod}</span>
                  </div>

                  {bill.notes && (
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-1 italic">
                      "{bill.notes}"
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Valor a pagar</span>
                    <span className="font-display font-bold text-slate-900 text-base sm:text-lg">
                      {formatCurrency(bill.amount)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onPayBill(bill)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Marcar como paga
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
