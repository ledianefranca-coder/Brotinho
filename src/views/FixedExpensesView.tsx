import React, { useState } from 'react';
import { 
  CalendarDays, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Sparkles,
  X
} from 'lucide-react';
import { FixedExpenseTemplate, Category, PaymentMethod } from '../types.ts';
import { formatCurrency } from '../utils/formatters.ts';

interface FixedExpensesViewProps {
  templates: FixedExpenseTemplate[];
  categories: Category[];
  currentYearMonth: string;
  onSaveTemplates: (templates: FixedExpenseTemplate[]) => void;
  onGenerateMonthlyExpenses: (templatesToGenerate: FixedExpenseTemplate[]) => void;
}

export function FixedExpensesView({
  templates,
  categories,
  currentYearMonth,
  onSaveTemplates,
  onGenerateMonthlyExpenses,
}: FixedExpensesViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<FixedExpenseTemplate | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Moradia');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('5');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Pix');
  const [notes, setNotes] = useState('');
  const [active, setActive] = useState(true);

  const [notification, setNotification] = useState<string | null>(null);

  const totalFixedAmount = templates
    .filter(t => t.active)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const openNewModal = () => {
    setEditingTemplate(null);
    setName('');
    setCategory(categories[0]?.name || 'Moradia');
    setAmount('');
    setDueDay('5');
    setPaymentMethod('Pix');
    setNotes('');
    setActive(true);
    setModalOpen(true);
  };

  const openEditModal = (tpl: FixedExpenseTemplate) => {
    setEditingTemplate(tpl);
    setName(tpl.name);
    setCategory(tpl.category);
    setAmount(tpl.amount.toString());
    setDueDay(tpl.dueDay.toString());
    setPaymentMethod(tpl.paymentMethod);
    setNotes(tpl.notes || '');
    setActive(tpl.active);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.')) || 0;
    const parsedDueDay = parseInt(dueDay, 10) || 1;

    if (editingTemplate) {
      const updated = templates.map(t => 
        t.id === editingTemplate.id
          ? {
              ...t,
              name: name.trim(),
              category,
              amount: parsedAmount,
              dueDay: Math.min(Math.max(parsedDueDay, 1), 31),
              paymentMethod,
              notes: notes.trim() || undefined,
              active,
            }
          : t
      );
      onSaveTemplates(updated);
    } else {
      const newTpl: FixedExpenseTemplate = {
        id: `fix-${Date.now()}`,
        name: name.trim(),
        category,
        amount: parsedAmount,
        dueDay: Math.min(Math.max(parsedDueDay, 1), 31),
        paymentMethod,
        notes: notes.trim() || undefined,
        active,
      };
      onSaveTemplates([...templates, newTpl]);
    }

    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const updated = templates.filter(t => t.id !== id);
    onSaveTemplates(updated);
  };

  const handleToggleActive = (id: string) => {
    const updated = templates.map(t => t.id === id ? { ...t, active: !t.active } : t);
    onSaveTemplates(updated);
  };

  const handleGenerate = () => {
    const activeTemplates = templates.filter(t => t.active);
    onGenerateMonthlyExpenses(activeTemplates);
    setNotification(`Lançamentos fixos gerados para o mês ${currentYearMonth}!`);
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div id="fixed-expenses-view" className="space-y-5 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
            <h2 className="font-display font-bold text-slate-900 text-lg sm:text-xl">
              Despesas Fixas & Recorrentes
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Contas mensais previsíveis geradas automaticamente para qualquer mês
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-purple-50/80 border border-purple-200/80 rounded-xl px-4 py-2 text-right">
            <span className="text-[11px] font-semibold text-purple-800 uppercase block">Total Mensal Fixo</span>
            <span className="font-display font-bold text-purple-950 text-base sm:text-lg">
              {formatCurrency(totalFixedAmount)}
            </span>
          </div>

          <button
            type="button"
            onClick={openNewModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nova Despesa Fixa
          </button>
        </div>
      </div>

      {/* Auto-generate Action Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-purple-600 shrink-0" />
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-purple-950">
              Sincronizar com {currentYearMonth}
            </h4>
            <p className="text-xs text-purple-800/80 mt-0.5">
              Clique para lançar todas as despesas fixas ativas no mês selecionado caso ainda não tenham sido criadas.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Gerar Despesas no Mês
        </button>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Templates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(tpl => (
          <div
            key={tpl.id}
            className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between shadow-2xs ${
              tpl.active ? 'border-stone-200/90 hover:border-purple-300' : 'border-stone-200/50 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-slate-600">
                  {tpl.category}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  Todo dia {tpl.dueDay}
                </span>
              </div>

              <h3 className="font-display font-semibold text-slate-900 text-base">
                {tpl.name}
              </h3>

              <div className="mt-3 text-xs text-slate-500 space-y-1 pt-2 border-t border-stone-100">
                <div className="flex justify-between">
                  <span>Forma sugerida:</span>
                  <span className="font-medium text-slate-700">{tpl.paymentMethod}</span>
                </div>
                {tpl.notes && (
                  <p className="text-[11px] text-slate-400 italic mt-1 line-clamp-1">
                    "{tpl.notes}"
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Valor Estimado</span>
                <span className="font-display font-bold text-slate-900 text-base">
                  {formatCurrency(tpl.amount)}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleActive(tpl.id)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    tpl.active ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100' : 'bg-stone-100 text-slate-500 hover:bg-stone-200'
                  }`}
                  title="Ativar/Desativar cobrança"
                >
                  {tpl.active ? 'Ativa' : 'Pausada'}
                </button>
                <button
                  type="button"
                  onClick={() => openEditModal(tpl)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                  title="Editar"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(tpl.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  title="Excluir"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add/Edit Template */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-stone-100 bg-purple-50/50">
              <h3 className="font-display font-semibold text-slate-900">
                {editingTemplate ? 'Editar Despesa Fixa' : 'Nova Despesa Fixa'}
              </h3>
              <button 
                type="button" 
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome da Conta Recorrente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aluguel, Internet Fibra, Mensalidade..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Valor Previsto (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dia do Vencimento (1 a 31) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={dueDay}
                    onChange={e => setDueDay(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Forma de Pagamento
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-2.5 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-white"
                  >
                    <option value="Pix">Pix</option>
                    <option value="Débito">Débito</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Boleto">Boleto</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Transferência">Transferência</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações
                </label>
                <input
                  type="text"
                  placeholder="Informações adicionais..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-xs"
                >
                  Salvar Despesa Fixa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
