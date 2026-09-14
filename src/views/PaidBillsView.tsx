import { useState, useMemo } from 'react';
import { CheckCircle2, Search, Calendar, DollarSign } from 'lucide-react';
import { Expense } from '../types.ts';
import { formatCurrency, formatDate } from '../utils/formatters.ts';

interface PaidBillsViewProps {
  currentYearMonth: string;
  expenses: Expense[];
  onEditExpense: (bill: Expense) => void;
}

export function PaidBillsView({
  expenses,
  onEditExpense,
}: PaidBillsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const paidBills = useMemo(() => {
    return expenses
      .filter(e => e.status === 'paid')
      .filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => (b.paidAt || b.dueDate).localeCompare(a.paidAt || a.dueDate));
  }, [expenses, searchQuery]);

  const totalPaid = paidBills.reduce((acc, curr) => acc + (curr.paidAmount !== undefined ? curr.paidAmount : curr.amount), 0);

  return (
    <div id="paid-bills-view" className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h2 className="font-display font-bold text-slate-900 text-lg sm:text-xl">
              Contas Pagas & Histórico
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registro de todas as obrigações quitadas com comprovante de quitação
          </p>
        </div>

        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl px-4 py-2 text-right">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase block">Total Liquidado</span>
          <span className="font-display font-bold text-emerald-950 text-base sm:text-lg">
            {formatCurrency(totalPaid)}
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Pesquisar contas pagas..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
          />
        </div>
      </div>

      {/* Paid Bills Table / List */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
        {paidBills.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            Nenhuma conta paga encontrada para este período.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Despesa</th>
                  <th className="py-3 px-3">Categoria</th>
                  <th className="py-3 px-3">Vencimento Original</th>
                  <th className="py-3 px-3">Data do Pagamento</th>
                  <th className="py-3 px-3">Forma</th>
                  <th className="py-3 px-4 text-right">Valor Pago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {paidBills.map(bill => (
                  <tr 
                    key={bill.id} 
                    onClick={() => onEditExpense(bill)}
                    className="hover:bg-emerald-50/20 cursor-pointer transition"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800 block">{bill.name}</span>
                          {bill.notes && <span className="text-[10px] text-slate-400">{bill.notes}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-stone-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                        {bill.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {formatDate(bill.dueDate)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-medium text-emerald-800">
                        <Calendar className="w-3 h-3 text-emerald-600" />
                        <span>{bill.paidAt ? formatDate(bill.paidAt) : formatDate(bill.dueDate)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {bill.paymentMethod}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-display font-bold text-emerald-900 text-sm">
                        {formatCurrency(bill.paidAmount !== undefined ? bill.paidAmount : bill.amount)}
                      </span>
                      {bill.paidAmount !== undefined && bill.paidAmount !== bill.amount && (
                        <span className="block text-[10px] text-slate-400 line-through">
                          Original: {formatCurrency(bill.amount)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
