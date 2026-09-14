import { AlertCircle, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { Expense } from '../types.ts';

interface AlertsBannerProps {
  expenses: Expense[];
  onFilterClick?: (status: 'overdue' | 'today' | 'upcoming' | 'all') => void;
}

export function AlertsBanner({ expenses, onFilterClick }: AlertsBannerProps) {
  if (expenses.length === 0) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date(todayStr + 'T00:00:00');

  const overdue = expenses.filter(e => e.status === 'overdue');
  const pending = expenses.filter(e => e.status === 'pending');
  const paid = expenses.filter(e => e.status === 'paid');

  const dueToday = pending.filter(e => e.dueDate === todayStr);

  const upcomingNext5Days = pending.filter(e => {
    if (e.dueDate === todayStr) return false;
    const due = new Date(e.dueDate + 'T00:00:00');
    const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 5;
  });

  const allPaid = paid.length > 0 && pending.length === 0 && overdue.length === 0;

  return (
    <div id="financial-alerts-container" className="space-y-2">
      {/* Overdue alert */}
      {overdue.length > 0 && (
        <div 
          id="alert-overdue-bills"
          onClick={() => onFilterClick?.('overdue')}
          className="flex items-center justify-between gap-3 p-3 sm:px-4 rounded-xl bg-rose-50/90 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium cursor-pointer hover:bg-rose-100/80 transition shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 shrink-0" />
            <span>
              {overdue.length === 1 
                ? 'Atenção: Existe 1 conta atrasada precisando de regularização.' 
                : `Atenção: Existem ${overdue.length} contas atrasadas aguardando pagamento.`}
            </span>
          </div>
          <span className="text-xs bg-rose-200/80 text-rose-900 px-2.5 py-1 rounded-full shrink-0 font-semibold">
            Ver atrasadas
          </span>
        </div>
      )}

      {/* Due Today alert */}
      {dueToday.length > 0 && (
        <div 
          id="alert-due-today"
          onClick={() => onFilterClick?.('today')}
          className="flex items-center justify-between gap-3 p-3 sm:px-4 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs sm:text-sm font-medium cursor-pointer hover:bg-amber-100/80 transition shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0" />
            <span>
              {dueToday.length === 1 
                ? `Lembrete: "${dueToday[0].name}" vence hoje!` 
                : `Lembrete: Você tem ${dueToday.length} contas que vencem hoje.`}
            </span>
          </div>
          <span className="text-xs bg-amber-200/80 text-amber-900 px-2.5 py-1 rounded-full shrink-0 font-semibold">
            Pagar hoje
          </span>
        </div>
      )}

      {/* Upcoming next 5 days */}
      {upcomingNext5Days.length > 0 && (
        <div 
          id="alert-upcoming-bills"
          onClick={() => onFilterClick?.('upcoming')}
          className="flex items-center justify-between gap-3 p-3 sm:px-4 rounded-xl bg-sky-50/80 border border-sky-200 text-sky-900 text-xs sm:text-sm font-medium cursor-pointer hover:bg-sky-100/70 transition shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600 shrink-0" />
            <span>
              {upcomingNext5Days.length === 1 
                ? '1 conta vence nos próximos 5 dias.' 
                : `${upcomingNext5Days.length} contas vencem nos próximos 5 dias.`}
            </span>
          </div>
          <span className="text-xs bg-sky-200/80 text-sky-900 px-2.5 py-1 rounded-full shrink-0 font-semibold">
            Ver próximas
          </span>
        </div>
      )}

      {/* All Paid Celebration */}
      {allPaid && (
        <div 
          id="alert-all-paid"
          className="flex items-center justify-between gap-3 p-3 sm:px-4 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-medium shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
            <span>
              Todas as contas deste mês foram pagas com sucesso! 🎉 Você está 100% no azul.
            </span>
          </div>
          <span className="text-xs bg-emerald-200/80 text-emerald-950 px-2.5 py-1 rounded-full shrink-0 font-semibold">
            Parabéns
          </span>
        </div>
      )}
    </div>
  );
}
