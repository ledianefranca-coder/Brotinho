import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { 
  MONTH_NAMES, 
  getPreviousMonth, 
  getNextMonth 
} from '../utils/formatters.ts';

interface MonthSelectorProps {
  currentYearMonth: string; // YYYY-MM
  onChange: (yearMonth: string) => void;
}

export function MonthSelector({ currentYearMonth, onChange }: MonthSelectorProps) {
  const [yearStr, monthStr] = currentYearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const monthIndex = parseInt(monthStr, 10) - 1;

  const handlePrev = () => {
    onChange(getPreviousMonth(currentYearMonth));
  };

  const handleNext = () => {
    onChange(getNextMonth(currentYearMonth));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = String(parseInt(e.target.value, 10) + 1).padStart(2, '0');
    onChange(`${year}-${newMonth}`);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = e.target.value;
    onChange(`${newYear}-${monthStr}`);
  };

  const prevMonthName = MONTH_NAMES[(monthIndex - 1 + 12) % 12];
  const nextMonthName = MONTH_NAMES[(monthIndex + 1) % 12];
  const currentMonthName = MONTH_NAMES[monthIndex];

  // Range of years up to 2050
  const availableYears = useMemo(() => {
    const startYear = Math.min(2020, year);
    const endYear = Math.max(2050, year);
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  }, [year]);

  return (
    <div 
      id="month-selector-bar" 
      className="inline-flex items-center gap-1.5 sm:gap-2 bg-stone-50/95 hover:bg-white border border-stone-200/90 hover:border-emerald-300 rounded-2xl p-1 sm:p-1.5 shadow-2xs hover:shadow-xs transition-all duration-200"
    >
      {/* Quick Navigation: Prev button */}
      <button
        id="btn-prev-month"
        type="button"
        onClick={handlePrev}
        className="w-8 h-8 sm:w-8.5 sm:h-8.5 flex items-center justify-center rounded-xl text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer shrink-0"
        title={`Mês anterior: ${prevMonthName}`}
        aria-label="Mês anterior"
      >
        <ChevronLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
      </button>

      {/* Calendar Indicator & Selectable Month/Year */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="hidden md:flex items-center gap-1 text-emerald-700 select-none pl-1" title="Calendário de navegação">
          <CalendarIcon className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Mês/Ano</span>
        </div>

        {/* Selectable Month Dropdown */}
        <div className="relative flex items-center">
          <select
            id="select-month-dropdown"
            value={monthIndex}
            onChange={handleMonthChange}
            aria-label="Selecionar mês"
            className="text-xs sm:text-sm font-display font-bold text-slate-900 bg-white hover:bg-emerald-50/60 border border-stone-200/90 hover:border-emerald-300 rounded-xl pl-2.5 pr-6 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 cursor-pointer transition shadow-2xs appearance-none capitalize"
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={name} value={idx}>
                {name}
              </option>
            ))}
          </select>
          <span className="absolute right-2 pointer-events-none text-slate-400 text-[9px]">▼</span>
        </div>

        {/* Selectable Year Dropdown (Up to 2050) */}
        <div className="relative flex items-center">
          <select
            id="select-year-dropdown"
            value={year}
            onChange={handleYearChange}
            aria-label="Selecionar ano"
            className="text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-100/75 hover:bg-emerald-100 border border-emerald-200/90 hover:border-emerald-300 rounded-xl pl-2.5 pr-5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 cursor-pointer transition shadow-2xs appearance-none"
          >
            {availableYears.map(y => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <span className="absolute right-1.5 pointer-events-none text-emerald-700 text-[9px]">▼</span>
        </div>
      </div>

      {/* Next button */}
      <button
        id="btn-next-month"
        type="button"
        onClick={handleNext}
        className="w-8 h-8 sm:w-8.5 sm:h-8.5 flex items-center justify-center rounded-xl text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer shrink-0"
        title={`Próximo mês: ${nextMonthName}`}
        aria-label="Próximo mês"
      >
        <ChevronRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
      </button>
    </div>
  );
}
