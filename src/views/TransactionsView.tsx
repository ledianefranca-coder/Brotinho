import { useState, useMemo } from 'react';
import { 
  Search, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  Repeat, 
  Plus
} from 'lucide-react';
import { Expense, Income, Category } from '../types.ts';
import { formatCurrency, formatDate, getRelativeDueLabel } from '../utils/formatters.ts';

interface TransactionsViewProps {
  currentYearMonth: string;
  expenses: Expense[];
  incomes: Income[];
  categories: Category[];
  onPayBill: (bill: Expense) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
  onEditIncome: (income: Income) => void;
  onDeleteIncome: (incomeId: string) => void;
  onOpenNewTransaction: () => void;
}

export function TransactionsView({
  expenses,
  incomes,
  categories,
  onPayBill,
  onEditExpense,
  onDeleteExpense,
  onEditIncome,
  onDeleteIncome,
  onOpenNewTransaction,
}: TransactionsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'expense' | 'income'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyFixed, setOnlyFixed] = useState(false);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = selectedStatus === 'all' || e.status === selectedStatus;
      const matchesCategory = selectedCategory === 'all' || e.category === selectedCategory;
      const matchesFixed = !onlyFixed || e.isFixed;
      return matchesSearch && matchesStatus && matchesCategory && matchesFixed;
    });
  }, [expenses, searchQuery, selectedStatus, selectedCategory, onlyFixed]);

  // Filtered incomes
  const filteredIncomes = useMemo(() => {
    return incomes.filter(inc => {
      const matchesSearch = inc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inc.notes && inc.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || inc.category === selectedCategory;
      const matchesFixed = !onlyFixed || inc.isFixed;
      return matchesSearch && matchesCategory && matchesFixed;
    });
  }, [incomes, searchQuery, selectedCategory, onlyFixed]);

  const totalFilteredExpenses = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalFilteredIncomes = filteredIncomes.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div id="transactions-view-container" className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header with Search & Quick Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-bold text-slate-900 text-lg sm:text-xl">
              Movimentações do Mês
            </h2>
            <p className="text-xs text-slate-500">
              Busca e filtros detalhados de despesas e receitas
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenNewTransaction}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Nova movimentação
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2 border-t border-stone-100">
          
          {/* Search bar */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              id="input-search-transactions"
              type="text"
              placeholder="Pesquisar por nome ou observação..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value as any)}
              className="w-full px-2.5 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white transition cursor-pointer"
            >
              <option value="all">Todos os Tipos</option>
              <option value="expense">Apenas Despesas</option>
              <option value="income">Apenas Receitas</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value as any)}
              disabled={selectedType === 'income'}
              className="w-full px-2.5 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white transition cursor-pointer disabled:opacity-50"
            >
              <option value="all">Todos os Status</option>
              <option value="pending">🔵 A pagar</option>
              <option value="paid">🟢 Pago</option>
              <option value="overdue">🔴 Atrasado</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white transition cursor-pointer"
            >
              <option value="all">Todas Categorias</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Quick Checkbox: Fixed Only */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyFixed}
              onChange={e => setOnlyFixed(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500"
            />
            <span className="font-medium">Mostrar apenas Despesas/Receitas Fixas recorrentes</span>
          </label>

          <div className="text-slate-500 text-[11px] font-medium hidden sm:block">
            {selectedType !== 'income' && `Despesas: ${formatCurrency(totalFilteredExpenses)}`}
            {selectedType === 'all' && ' | '}
            {selectedType !== 'expense' && `Receitas: ${formatCurrency(totalFilteredIncomes)}`}
          </div>
        </div>

      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
        
        {/* Table View (Desktop & Tablet) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Movimentação</th>
                <th className="py-3 px-3">Categoria</th>
                <th className="py-3 px-3">Vencimento / Data</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Forma</th>
                <th className="py-3 px-4 text-right">Valor</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              
              {/* Show Incomes if not filtered out */}
              {selectedType !== 'expense' && filteredIncomes.map(inc => (
                <tr key={inc.id} className="hover:bg-teal-50/20 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-900 block">{inc.description}</span>
                        {inc.isFixed && (
                          <span className="text-[10px] text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded font-medium">
                            Receita Fixa
                          </span>
                        )}
                        {inc.notes && <p className="text-[11px] text-slate-400 mt-0.5">{inc.notes}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-medium">
                    <span className="bg-stone-100 px-2 py-0.5 rounded-md">{inc.category}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {formatDate(inc.date)}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                      Recebida
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">-</td>
                  <td className="py-3 px-4 text-right font-display font-bold text-teal-700 text-sm">
                    +{formatCurrency(inc.amount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEditIncome(inc)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-stone-100 rounded-lg transition"
                        title="Editar receita"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteIncome(inc.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Excluir receita"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Show Expenses if not filtered out */}
              {selectedType !== 'income' && filteredExpenses.map(bill => {
                const relative = getRelativeDueLabel(bill.dueDate, bill.status);
                return (
                  <tr key={bill.id} className="hover:bg-stone-50/60 transition group">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          bill.status === 'paid' ? 'bg-emerald-500' : bill.status === 'overdue' ? 'bg-rose-500' : 'bg-sky-500'
                        }`} />
                        <div>
                          <span className="font-semibold text-slate-900 block">{bill.name}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {bill.isFixed && (
                              <span className="text-[10px] text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded font-medium flex items-center gap-0.5">
                                <Repeat className="w-2.5 h-2.5" /> Fixa
                              </span>
                            )}
                            {bill.status === 'paid' && bill.paidAt && (
                              <span className="text-[10px] text-emerald-700">
                                Pago em {formatDate(bill.paidAt)}
                              </span>
                            )}
                          </div>
                          {bill.notes && <p className="text-[11px] text-slate-400 mt-0.5">{bill.notes}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      <span className="bg-stone-100 px-2 py-0.5 rounded-md">{bill.category}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <div>{formatDate(bill.dueDate)}</div>
                      <span className={`text-[10px] font-medium block ${
                        relative.urgency === 'urgent' ? 'text-rose-600' : relative.urgency === 'warning' ? 'text-amber-600' : 'text-slate-400'
                      }`}>
                        {relative.label}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {bill.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> Pago
                        </span>
                      ) : bill.status === 'overdue' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                          🔴 Atrasado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                          🔵 A pagar
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {bill.paymentMethod}
                    </td>
                    <td className="py-3 px-4 text-right font-display font-bold text-slate-900 text-sm">
                      {formatCurrency(bill.amount)}
                      {bill.paidAmount !== undefined && bill.paidAmount !== bill.amount && (
                        <span className="block text-[10px] text-slate-400 font-normal">
                          (pago {formatCurrency(bill.paidAmount)})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {bill.status !== 'paid' && (
                          <button
                            type="button"
                            onClick={() => onPayBill(bill)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-lg text-[11px] border border-emerald-200 transition cursor-pointer"
                            title="Marcar conta como paga"
                          >
                            Pagar
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onEditExpense(bill)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-stone-100 rounded-lg transition"
                          title="Editar despesa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteExpense(bill.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Excluir despesa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Empty state */}
              {((selectedType === 'all' && filteredExpenses.length === 0 && filteredIncomes.length === 0) ||
                (selectedType === 'expense' && filteredExpenses.length === 0) ||
                (selectedType === 'income' && filteredIncomes.length === 0)) && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <p className="text-sm font-medium">Nenhuma movimentação encontrada com estes filtros.</p>
                    <p className="text-xs mt-1 text-slate-400">Tente ajustar a busca ou adicionar um novo registro.</p>
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
