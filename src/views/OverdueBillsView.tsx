import { useMemo } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Expense } from '../types.ts';
import { formatCurrency, formatDate, getRelativeDueLabel } from '../utils/formatters.ts';

interface OverdueBillsViewProps {
  expenses: Expense[];
  onPayBill: (bill: Expense) => void;
  onEditExpense: (bill: Expense) => void;
}

export function OverdueBillsView({
  expenses,
  onPayBill,
  onEditExpense,
}: OverdueBillsViewProps) {
  // Overdue bills sorted from oldest to newest (mais antiga para mais recente)
  const overdueBills = useMemo(() => {
    return expenses
      .filter(e => e.status === 'overdue')
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate)); // ascending = oldest first
  }, [expenses]);

  const totalOverdue = overdueBills.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div id="overdue-bills-view" className="space-y-5 animate-in fade-in duration-200">
      
      {/* Prominent Red Alert Banner */}
      <div className="bg-gradient-to-r from-rose-500 to-rose-600 rounded-3xl p-6 text-white shadow-md shadow-rose-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0">
              <AlertCircle className="w-7 h-7 text-rose-100" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-rose-200">
                Atenção e Regularização
              </span>
              <h2 className="font-display font-bold text-xl sm:text-2xl mt-0.5">
                Total Atrasado: {formatCurrency(totalOverdue)}
              </h2>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs px-4 py-2 rounded-2xl border border-white/20 self-start sm:self-auto">
            <span className="text-xs text-rose-100 font-medium">
              {overdueBills.length === 0 
                ? 'Nenhuma pendência pendente' 
                : `${overdueBills.length} conta(s) fora do prazo`}
            </span>
          </div>
        </div>

        <p className="text-xs text-rose-100/90 mt-4 leading-relaxed max-w-xl">
          As contas abaixo estão ordenadas da mais antiga para a mais recente. 
          Priorize quitá-las primeiro para evitar juros, multas e restrições.
        </p>
      </div>

      {/* List / Cards */}
      {overdueBills.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200/90 p-12 text-center shadow-2xs">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="font-display font-bold text-slate-900 text-lg">
            Parabéns! Nenhuma conta atrasada por aqui.
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Sua disciplina financeira está excelente. Continue mantendo esse padrão saudável para suas finanças.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {overdueBills.map((bill, index) => {
            const relative = getRelativeDueLabel(bill.dueDate, bill.status);
            return (
              <div
                key={bill.id}
                className="bg-white rounded-2xl border border-rose-200 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 
                        onClick={() => onEditExpense(bill)}
                        className="font-display font-semibold text-slate-900 text-base hover:text-rose-600 cursor-pointer transition"
                      >
                        {bill.name}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        {relative.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                      <span className="bg-stone-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                        {bill.category}
                      </span>
                      <span>•</span>
                      <span>Venceu em: <strong className="text-rose-700">{formatDate(bill.dueDate)}</strong></span>
                      <span>•</span>
                      <span>Forma: {bill.paymentMethod}</span>
                    </div>

                    {bill.notes && (
                      <p className="text-xs text-slate-400 mt-1.5 italic">
                        "{bill.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Valor em atraso</span>
                    <span className="font-display font-bold text-rose-600 text-lg sm:text-xl">
                      {formatCurrency(bill.amount)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onPayBill(bill)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Quitar Agora
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
