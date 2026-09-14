import { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  X 
} from 'lucide-react';
import { Expense } from '../types.ts';
import { 
  MONTH_NAMES, 
  formatCurrency, 
  formatDate, 
  getRelativeDueLabel 
} from '../utils/formatters.ts';

interface CalendarViewProps {
  currentYearMonth: string;
  onMonthChange: (ym: string) => void;
  expenses: Expense[];
  onPayBill: (bill: Expense) => void;
  onEditExpense: (bill: Expense) => void;
}

export function CalendarView({
  currentYearMonth,
  onMonthChange,
  expenses,
  onPayBill,
  onEditExpense,
}: CalendarViewProps) {
  const [selectedDayBills, setSelectedDayBills] = useState<{ day: number; dateStr: string; bills: Expense[] } | null>(null);

  const [yearStr, monthStr] = currentYearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1-indexed

  // Calendar calculations
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayIndex = new Date(year, month - 1, 1).getDay(); // 0 = Sunday

  const weekDayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Map expenses by day of month
  const expensesByDay = useMemo(() => {
    const map: { [day: number]: Expense[] } = {};
    expenses.forEach(e => {
      const parts = e.dueDate.split('-');
      if (parts.length === 3 && parseInt(parts[0], 10) === year && parseInt(parts[1], 10) === month) {
        const day = parseInt(parts[2], 10);
        if (!map[day]) map[day] = [];
        map[day].push(e);
      }
    });
    return map;
  }, [expenses, year, month]);

  // Range of years up to 2050
  const availableYears = useMemo(() => {
    const startYear = Math.min(2020, year);
    const endYear = Math.max(2050, year);
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  }, [year]);

  const handlePrev = () => {
    let newYear = year;
    let newMonth = month - 1;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    onMonthChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleNext = () => {
    let newYear = year;
    let newMonth = month + 1;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    onMonthChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const openDayDetails = (day: number) => {
    const dayBills = expensesByDay[day] || [];
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDayBills({ day, dateStr, bills: dayBills });
  };

  return (
    <div id="calendar-view" className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <h2 className="font-display font-bold text-slate-900 text-lg sm:text-xl">
              Calendário de Vencimentos
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visualização diária das contas organizadas por data de vencimento
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Pago
          </span>
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Vence em breve
          </span>
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200">
            <span className="w-2 h-2 rounded-full bg-sky-500" /> A pagar
          </span>
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Atrasado
          </span>
        </div>
      </div>

      {/* Calendar Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-5 py-3 rounded-2xl border border-stone-200/90 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className="p-2 hover:bg-stone-100 rounded-xl text-slate-600 transition cursor-pointer"
            title="Mês anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h3 className="font-display font-bold text-slate-800 text-base sm:text-lg">
            {MONTH_NAMES[month - 1]} de {year}
          </h3>

          <button
            type="button"
            onClick={handleNext}
            className="p-2 hover:bg-stone-100 rounded-xl text-slate-600 transition cursor-pointer"
            title="Próximo mês"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Quick select dropdowns */}
        <div className="flex items-center gap-1.5 ml-auto">
          <CalendarIcon className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          <select
            id="calendar-month-select"
            value={month - 1}
            onChange={(e) => {
              const newMonth = String(parseInt(e.target.value, 10) + 1).padStart(2, '0');
              onMonthChange(`${year}-${newMonth}`);
            }}
            className="text-xs font-medium bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={name} value={idx}>{name}</option>
            ))}
          </select>

          <select
            id="calendar-year-select"
            value={year}
            onChange={(e) => {
              onMonthChange(`${e.target.value}-${String(month).padStart(2, '0')}`);
            }}
            className="text-xs font-medium bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
        
        {/* Week Day Header */}
        <div className="grid grid-cols-7 border-b border-stone-200 bg-stone-50/80 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider py-2.5">
          {weekDayNames.map((d, i) => (
            <div key={d} className={i === 0 || i === 6 ? 'text-slate-400' : ''}>
              {d}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-stone-100 min-h-[480px]">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-stone-50/40 p-2 min-h-[85px]" />
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const bills = expensesByDay[day] || [];
            const hasBills = bills.length > 0;
            const hasOverdue = bills.some(b => b.status === 'overdue');
            const allPaid = hasBills && bills.every(b => b.status === 'paid');

            return (
              <div
                key={`day-${day}`}
                onClick={() => openDayDetails(day)}
                className={`p-2 sm:p-2.5 min-h-[85px] transition cursor-pointer flex flex-col justify-between hover:bg-stone-50/80 ${
                  hasOverdue ? 'bg-rose-50/20' : allPaid ? 'bg-emerald-50/15' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold rounded-md w-6 h-6 flex items-center justify-center ${
                    hasOverdue ? 'bg-rose-600 text-white' : allPaid ? 'bg-emerald-600 text-white' : 'text-slate-700'
                  }`}>
                    {day}
                  </span>

                  {hasBills && (
                    <span className="text-[10px] font-bold text-slate-400">
                      {bills.length} {bills.length === 1 ? 'conta' : 'contas'}
                    </span>
                  )}
                </div>

                {/* Bill chips inside day */}
                <div className="mt-1.5 space-y-1 overflow-hidden">
                  {bills.slice(0, 2).map(b => {
                    const relative = getRelativeDueLabel(b.dueDate, b.status);
                    const isUpcoming = relative.urgency === 'warning';
                    return (
                      <div
                        key={b.id}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate flex items-center gap-1 ${
                          b.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-900'
                            : b.status === 'overdue'
                              ? 'bg-rose-100 text-rose-900 font-semibold'
                              : isUpcoming
                                ? 'bg-amber-100 text-amber-950 font-semibold'
                                : 'bg-sky-100 text-sky-900'
                        }`}
                        title={`${b.name} - ${formatCurrency(b.amount)}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          b.status === 'paid'
                            ? 'bg-emerald-600'
                            : b.status === 'overdue'
                              ? 'bg-rose-600'
                              : isUpcoming
                                ? 'bg-amber-600'
                                : 'bg-sky-600'
                        }`} />
                        <span className="truncate">{b.name}</span>
                      </div>
                    );
                  })}
                  {bills.length > 2 && (
                    <p className="text-[10px] text-slate-400 font-medium pl-1">
                      +{bills.length - 2} mais
                    </p>
                  )}
                </div>

                <div className="mt-1 text-right">
                  {hasBills && (
                    <span className="text-[10px] font-bold text-slate-600">
                      {formatCurrency(bills.reduce((a, c) => a + c.amount, 0))}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Day Detail Modal */}
      {selectedDayBills && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-stone-100 bg-stone-50">
              <div>
                <h3 className="font-display font-semibold text-slate-900">
                  Vencimentos de {formatDate(selectedDayBills.dateStr)}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedDayBills.bills.length === 0 
                    ? 'Nenhuma conta para este dia' 
                    : `${selectedDayBills.bills.length} conta(s) agendada(s)`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayBills(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-[400px] overflow-y-auto divide-y divide-stone-100">
              {selectedDayBills.bills.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Sem despesas agendadas para esta data.
                </p>
              ) : (
                selectedDayBills.bills.map(bill => (
                  <div key={bill.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{bill.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>{bill.category}</span>
                        <span>•</span>
                        <span>{bill.paymentMethod}</span>
                      </div>
                      {bill.notes && (
                        <p className="text-[11px] text-slate-400 mt-1 italic">"{bill.notes}"</p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-display font-bold text-slate-900 text-sm block">
                        {formatCurrency(bill.amount)}
                      </span>
                      {bill.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-1">
                          <CheckCircle2 className="w-3 h-3" /> Pago
                        </span>
                      ) : bill.status === 'overdue' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDayBills(null);
                            onPayBill(bill);
                          }}
                          className="mt-1 px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100"
                        >
                          Quitar
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDayBills(null);
                            onPayBill(bill);
                          }}
                          className="mt-1 px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg hover:bg-emerald-100"
                        >
                          Pagar
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-stone-50 border-t border-stone-100 text-right">
              <button
                type="button"
                onClick={() => setSelectedDayBills(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-stone-200/60 rounded-xl"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
