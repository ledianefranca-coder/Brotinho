import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Briefcase 
} from 'lucide-react';
import { Income } from '../types.ts';
import { formatCurrency, formatDate } from '../utils/formatters.ts';

interface IncomesViewProps {
  currentYearMonth: string;
  incomes: Income[];
  onEditIncome: (income: Income) => void;
  onDeleteIncome: (id: string) => void;
  onOpenNewIncome: () => void;
}

export function IncomesView({
  incomes,
  onEditIncome,
  onDeleteIncome,
  onOpenNewIncome,
}: IncomesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFixed, setFilterFixed] = useState<'all' | 'fixed' | 'eventual'>('all');

  const filteredIncomes = useMemo(() => {
    return incomes
      .filter(inc => {
        const matchesSearch = inc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inc.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFixed = filterFixed === 'all' || 
          (filterFixed === 'fixed' ? inc.isFixed : !inc.isFixed);
        return matchesSearch && matchesFixed;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [incomes, searchQuery, filterFixed]);

  const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const fixedTotal = incomes.filter(i => i.isFixed).reduce((acc, curr) => acc + curr.amount, 0);
  const eventualTotal = incomes.filter(i => !i.isFixed).reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div id="incomes-view" className="space-y-5 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="font-display font-bold text-slate-900 text-lg sm:text-xl">
              Receitas & Entradas
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Acompanhe seus rendimentos, salários e rendas extras
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-teal-50/80 border border-teal-200/80 rounded-xl px-4 py-2 text-right">
            <span className="text-[11px] font-semibold text-teal-800 uppercase block">Total Receitas</span>
            <span className="font-display font-bold text-teal-950 text-base sm:text-lg">
              {formatCurrency(totalIncome)}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenNewIncome}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nova Receita
          </button>
        </div>
      </div>

      {/* Summary Cards: Fixa vs Eventual */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Receitas Fixas (Salários, Contratos)</span>
            <p className="font-display font-bold text-teal-800 text-lg mt-1">
              {formatCurrency(fixedTotal)}
            </p>
          </div>
          <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full font-semibold">
            {totalIncome > 0 ? Math.round((fixedTotal / totalIncome) * 100) : 0}% do total
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Receitas Eventuais (Freelances, Bônus)</span>
            <p className="font-display font-bold text-emerald-700 text-lg mt-1">
              {formatCurrency(eventualTotal)}
            </p>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">
            {totalIncome > 0 ? Math.round((eventualTotal / totalIncome) * 100) : 0}% do total
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Pesquisar receitas..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilterFixed('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              filterFixed === 'all' ? 'bg-teal-700 text-white' : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
            }`}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => setFilterFixed('fixed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              filterFixed === 'fixed' ? 'bg-teal-700 text-white' : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
            }`}
          >
            Apenas Fixas
          </button>
          <button
            type="button"
            onClick={() => setFilterFixed('eventual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              filterFixed === 'eventual' ? 'bg-teal-700 text-white' : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
            }`}
          >
            Apenas Eventuais
          </button>
        </div>
      </div>

      {/* Income List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIncomes.map(inc => (
          <div
            key={inc.id}
            className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs hover:shadow-xs transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-slate-600">
                  {inc.category}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  inc.isFixed ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {inc.isFixed ? 'Receita Fixa' : 'Renda Extra'}
                </span>
              </div>

              <h3 className="font-display font-semibold text-slate-900 text-base">
                {inc.description}
              </h3>

              <div className="mt-3 text-xs text-slate-500 space-y-1 pt-2 border-t border-stone-100">
                <div className="flex justify-between">
                  <span>Data de crédito:</span>
                  <span className="font-medium text-slate-700">{formatDate(inc.date)}</span>
                </div>
                {inc.notes && (
                  <p className="text-[11px] text-slate-400 italic mt-1 line-clamp-1">
                    "{inc.notes}"
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Valor Recebido</span>
                <span className="font-display font-bold text-teal-800 text-base sm:text-lg">
                  +{formatCurrency(inc.amount)}
                </span>
              </div>

              <div className="flex items-center gap-1">
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
            </div>
          </div>
        ))}

        {filteredIncomes.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-stone-200/90 p-10 text-center text-slate-400 text-xs">
            <Briefcase className="w-8 h-8 mx-auto text-stone-300 mb-2" />
            Nenhuma receita encontrada para os filtros selecionados.
          </div>
        )}
      </div>

    </div>
  );
}
