import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Edit3, 
  Sparkles, 
  CheckCircle2, 
  Building2,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Debt } from '../types.ts';
import { formatCurrency } from '../utils/formatters.ts';

interface DebtsViewProps {
  debts: Debt[];
  onSaveDebts: (debts: Debt[]) => void;
}

export function DebtsView({ debts, onSaveDebts }: DebtsViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('12');
  const [paidInstallments, setPaidInstallments] = useState('0');
  const [installmentAmount, setInstallmentAmount] = useState('');
  const [institution, setInstitution] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [canAnticipate, setCanAnticipate] = useState(true);
  const [notes, setNotes] = useState('');
  const [dueDay, setDueDay] = useState('15');

  const openNewModal = () => {
    setEditingDebt(null);
    setName('');
    setInitialAmount('');
    setTotalInstallments('12');
    setPaidInstallments('0');
    setInstallmentAmount('');
    setInstitution('');
    setInterestRate('');
    setCanAnticipate(true);
    setNotes('');
    setDueDay('15');
    setModalOpen(true);
  };

  const openEditModal = (debt: Debt) => {
    setEditingDebt(debt);
    setName(debt.name);
    setInitialAmount(debt.initialAmount.toString());
    setTotalInstallments(debt.totalInstallments.toString());
    setPaidInstallments(debt.paidInstallments.toString());
    setInstallmentAmount(debt.installmentAmount.toString());
    setInstitution(debt.institution);
    setInterestRate(debt.interestRate || '');
    setCanAnticipate(debt.canAnticipate);
    setNotes(debt.notes || '');
    setDueDay(debt.dueDay.toString());
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedInit = parseFloat(initialAmount.replace(',', '.')) || 0;
    const parsedTotal = parseInt(totalInstallments, 10) || 1;
    const parsedPaid = parseInt(paidInstallments, 10) || 0;
    const parsedInstallment = parseFloat(installmentAmount.replace(',', '.')) || (parsedInit / parsedTotal);
    const parsedDueDay = parseInt(dueDay, 10) || 10;

    if (editingDebt) {
      const updated = debts.map(d =>
        d.id === editingDebt.id
          ? {
              ...d,
              name: name.trim(),
              initialAmount: parsedInit,
              totalInstallments: parsedTotal,
              paidInstallments: Math.min(parsedPaid, parsedTotal),
              installmentAmount: parsedInstallment,
              institution: institution.trim(),
              interestRate: interestRate.trim() || undefined,
              canAnticipate,
              notes: notes.trim() || undefined,
              dueDay: parsedDueDay,
            }
          : d
      );
      onSaveDebts(updated);
    } else {
      const newDebt: Debt = {
        id: `debt-${Date.now()}`,
        name: name.trim(),
        initialAmount: parsedInit,
        totalInstallments: parsedTotal,
        paidInstallments: Math.min(parsedPaid, parsedTotal),
        installmentAmount: parsedInstallment,
        institution: institution.trim(),
        interestRate: interestRate.trim() || undefined,
        canAnticipate,
        notes: notes.trim() || undefined,
        dueDay: parsedDueDay,
        startDate: new Date().toISOString().split('T')[0],
      };
      onSaveDebts([...debts, newDebt]);
    }

    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    onSaveDebts(debts.filter(d => d.id !== id));
  };

  const handlePayNextInstallment = (id: string) => {
    const debt = debts.find(d => d.id === id);
    if (!debt || debt.paidInstallments >= debt.totalInstallments) return;

    const newPaid = debt.paidInstallments + 1;
    const updated = debts.map(d => d.id === id ? { ...d, paidInstallments: newPaid } : d);
    onSaveDebts(updated);

    // If reached 100% quitação, trigger celebratory confetti!
    if (newPaid === debt.totalInstallments) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  // Aggregated Debt Metrics
  const totalOriginalDebt = debts.reduce((acc, curr) => acc + curr.initialAmount, 0);
  const totalRemainingDebt = debts.reduce((acc, curr) => {
    const remainingCount = curr.totalInstallments - curr.paidInstallments;
    return acc + (remainingCount * curr.installmentAmount);
  }, 0);
  const totalPaidDebt = debts.reduce((acc, curr) => {
    return acc + (curr.paidInstallments * curr.installmentAmount);
  }, 0);

  return (
    <div id="debts-view" className="space-y-5 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <h2 className="font-display font-bold text-slate-900 text-lg sm:text-xl">
              Dívidas e Parcelamentos
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Planejamento claro para quitação e amortização sem pressão
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-purple-50/80 border border-purple-200/80 rounded-xl px-4 py-2 text-right">
            <span className="text-[11px] font-semibold text-purple-800 uppercase block">Saldo Devedor Restante</span>
            <span className="font-display font-bold text-purple-950 text-base sm:text-lg">
              {formatCurrency(totalRemainingDebt)}
            </span>
          </div>

          <button
            type="button"
            onClick={openNewModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nova Dívida / Financiamento
          </button>
        </div>
      </div>

      {/* Global Progress Summary Bar */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-700">Progresso Geral de Quitação</span>
          <span className="font-bold text-emerald-700">
            {totalOriginalDebt > 0 ? Math.round((totalPaidDebt / (totalPaidDebt + totalRemainingDebt)) * 100) : 0}% Amortizado
          </span>
        </div>

        <div className="h-3.5 bg-stone-100 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${totalOriginalDebt > 0 ? Math.round((totalPaidDebt / (totalPaidDebt + totalRemainingDebt)) * 100) : 0}%` }}
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 mt-3 border-t border-stone-100 text-xs text-slate-600">
          <div>
            <span className="text-slate-400 block text-[11px]">Total Já Quitado:</span>
            <strong className="text-emerald-700 font-semibold">{formatCurrency(totalPaidDebt)}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Valor Restante:</span>
            <strong className="text-slate-800 font-semibold">{formatCurrency(totalRemainingDebt)}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Dívidas Cadastradas:</span>
            <strong className="text-purple-700 font-semibold">{debts.length} contratos ativos</strong>
          </div>
        </div>
      </div>

      {/* Debt Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {debts.map(debt => {
          const remainingCount = debt.totalInstallments - debt.paidInstallments;
          const pct = Math.round((debt.paidInstallments / debt.totalInstallments) * 100);
          const remainingAmount = remainingCount * debt.installmentAmount;
          const paidAmount = debt.paidInstallments * debt.installmentAmount;
          const isCompleted = debt.paidInstallments >= debt.totalInstallments;

          return (
            <div
              key={debt.id}
              className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between shadow-2xs ${
                isCompleted 
                  ? 'border-emerald-300 bg-emerald-50/20' 
                  : 'border-stone-200/90 hover:border-purple-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{debt.institution || 'Instituição não informada'}</span>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    isCompleted 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {isCompleted ? 'Quitado 🎉' : `Dia ${debt.dueDay}`}
                  </span>
                </div>

                <h3 className="font-display font-semibold text-slate-900 text-base sm:text-lg">
                  {debt.name}
                </h3>

                {/* Progress Bar Display */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      {debt.paidInstallments} de {debt.totalInstallments} parcelas pagas
                    </span>
                    <span className="font-bold text-slate-900 font-mono">
                      {pct}%
                    </span>
                  </div>

                  <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-purple-600'
                      }`}
                    />
                  </div>
                </div>

                {/* Debt Details Grid */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-stone-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Valor da Parcela:</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(debt.installmentAmount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Parcelas Restantes:</span>
                    <span className="font-semibold text-purple-700">{remainingCount}x</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Já Pago:</span>
                    <span className="font-medium text-emerald-700">{formatCurrency(paidAmount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Estimativa Restante:</span>
                    <span className="font-medium text-slate-800">{formatCurrency(remainingAmount)}</span>
                  </div>
                </div>

                {debt.interestRate && (
                  <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between bg-stone-50 px-2.5 py-1 rounded-lg">
                    <span>Taxa de juros: <strong>{debt.interestRate}</strong></span>
                    {debt.canAnticipate && (
                      <span className="text-emerald-700 font-medium">Permite antecipação</span>
                    )}
                  </div>
                )}

                {debt.notes && (
                  <p className="text-[11px] text-slate-400 italic mt-2 line-clamp-2">
                    "{debt.notes}"
                  </p>
                )}
              </div>

              {/* Action Bar */}
              <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(debt)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-stone-100 rounded-lg transition"
                    title="Editar"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(debt.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {!isCompleted && (
                  <button
                    type="button"
                    onClick={() => handlePayNextInstallment(debt.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl shadow-2xs transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Pagar Parcela #{debt.paidInstallments + 1}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add/Edit Debt */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-stone-200 overflow-hidden my-6">
            <div className="flex items-center justify-between p-4 border-b border-stone-100 bg-purple-50/50">
              <h3 className="font-display font-semibold text-slate-900">
                {editingDebt ? 'Editar Dívida / Financiamento' : 'Nova Dívida / Financiamento'}
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
                  Nome do Contrato / Dívida *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Financiamento Carro, Empréstimo Pessoal..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Instituição / Banco *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Santander, Nubank, Itaú..."
                    value={institution}
                    onChange={e => setInstitution(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Valor Inicial Contratado *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={initialAmount}
                    onChange={e => setInitialAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Total Parcelas *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={totalInstallments}
                    onChange={e => setTotalInstallments(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Parcelas Já Pagas *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={paidInstallments}
                    onChange={e => setPaidInstallments(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Valor da Parcela *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={installmentAmount}
                    onChange={e => setInstallmentAmount(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Taxa de Juros (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 1.5% a.m."
                    value={interestRate}
                    onChange={e => setInterestRate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dia Vencimento Mensal
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dueDay}
                    onChange={e => setDueDay(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={canAnticipate}
                  onChange={e => setCanAnticipate(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="font-medium text-slate-700">Permite amortização / antecipação com desconto de juros</span>
              </label>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalhes sobre o contrato, garantias ou metas de quitação..."
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
                  Salvar Dívida
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
