import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  X,
  TrendingUp,
  Minus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Goal } from '../types.ts';
import { formatCurrency, formatDate } from '../utils/formatters.ts';

interface GoalsViewProps {
  goals: Goal[];
  onSaveGoals: (goals: Goal[]) => void;
}

export function GoalsView({ goals, onSaveGoals }: GoalsViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [isWithdraw, setIsWithdraw] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Reserva financeira');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const goalCategories = [
    'Reserva financeira',
    'Quitar uma dívida',
    'Viagem',
    'Compra específica',
    'Projeto pessoal',
    'Investimentos',
    'Outros'
  ];

  const openNewModal = () => {
    setSelectedGoal(null);
    setName('');
    setCategory('Reserva financeira');
    setTargetAmount('');
    setCurrentAmount('0');
    setDeadline('');
    setModalOpen(true);
  };

  const openEditModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setName(goal.name);
    setCategory(goal.category || 'Reserva financeira');
    setTargetAmount(goal.targetAmount.toString());
    setCurrentAmount(goal.currentAmount.toString());
    setDeadline(goal.deadline || '');
    setModalOpen(true);
  };

  const openDepositModal = (goal: Goal, withdraw = false) => {
    setSelectedGoal(goal);
    setIsWithdraw(withdraw);
    setDepositAmount('');
    setDepositModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = parseFloat(targetAmount.replace(',', '.')) || 0;
    const parsedCurrent = parseFloat(currentAmount.replace(',', '.')) || 0;

    if (selectedGoal) {
      const updated = goals.map(g =>
        g.id === selectedGoal.id
          ? {
              ...g,
              name: name.trim(),
              category,
              targetAmount: parsedTarget,
              currentAmount: parsedCurrent,
              deadline: deadline || undefined,
            }
          : g
      );
      onSaveGoals(updated);
    } else {
      const newGoal: Goal = {
        id: `goal-${Date.now()}`,
        name: name.trim(),
        category,
        targetAmount: parsedTarget,
        currentAmount: parsedCurrent,
        deadline: deadline || undefined,
      };
      onSaveGoals([...goals, newGoal]);
    }

    setModalOpen(false);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;

    const val = parseFloat(depositAmount.replace(',', '.')) || 0;
    if (val <= 0) return;

    const newAmount = isWithdraw 
      ? Math.max(0, selectedGoal.currentAmount - val)
      : selectedGoal.currentAmount + val;

    const updated = goals.map(g =>
      g.id === selectedGoal.id ? { ...g, currentAmount: newAmount } : g
    );
    onSaveGoals(updated);

    // If goal reached target, trigger confetti!
    if (!isWithdraw && newAmount >= selectedGoal.targetAmount) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    setDepositModalOpen(false);
  };

  const handleDelete = (id: string) => {
    onSaveGoals(goals.filter(g => g.id !== id));
  };

  const totalTarget = goals.reduce((acc, curr) => acc + curr.targetAmount, 0);
  const totalAccumulated = goals.reduce((acc, curr) => acc + curr.currentAmount, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalAccumulated / totalTarget) * 100) : 0;

  return (
    <div id="goals-view" className="space-y-5 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <h2 className="font-display font-bold text-slate-900 text-lg sm:text-xl">
              Metas & Sonhos Financeiros
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Planejamento e acompanhamento de reservas, viagens e projetos
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl px-4 py-2 text-right">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase block">Total Poupado</span>
            <span className="font-display font-bold text-emerald-950 text-base sm:text-lg">
              {formatCurrency(totalAccumulated)}
            </span>
          </div>

          <button
            type="button"
            onClick={openNewModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nova Meta
          </button>
        </div>
      </div>

      {/* Global Progress Bar */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-700">Progresso Geral das Metas</span>
          <span className="font-bold text-emerald-700 font-mono text-sm">
            {overallProgress}% ({formatCurrency(totalAccumulated)} de {formatCurrency(totalTarget)})
          </span>
        </div>

        <div className="h-3.5 bg-stone-100 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${Math.min(overallProgress, 100)}%` }}
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500 rounded-full"
          />
        </div>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map(goal => {
          const pct = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
          const isCompleted = goal.currentAmount >= goal.targetAmount;
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <div
              key={goal.id}
              className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between shadow-2xs ${
                isCompleted 
                  ? 'border-emerald-300 bg-emerald-50/20' 
                  : 'border-stone-200/90 hover:border-emerald-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-slate-600">
                    {goal.category || 'Meta'}
                  </span>
                  
                  {isCompleted ? (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Meta Atingida!
                    </span>
                  ) : goal.deadline ? (
                    <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Até {formatDate(goal.deadline)}
                    </span>
                  ) : null}
                </div>

                <h3 className="font-display font-semibold text-slate-900 text-base sm:text-lg">
                  {goal.name}
                </h3>

                {/* Progress bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-500">
                      {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                    </span>
                    <span className="font-bold text-emerald-800 font-mono">
                      {pct}%
                    </span>
                  </div>

                  <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-teal-600'
                      }`}
                    />
                  </div>
                </div>

                {!isCompleted && (
                  <p className="text-[11px] text-slate-400 mt-2">
                    Faltam <strong>{formatCurrency(remaining)}</strong> para alcançar seu objetivo.
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(goal)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-stone-100 rounded-lg transition"
                    title="Editar"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(goal.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openDepositModal(goal, true)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-stone-100 border border-stone-200 rounded-lg text-xs font-semibold transition"
                    title="Resgatar valor"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openDepositModal(goal, false)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Valor
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add/Edit Goal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-stone-100 bg-emerald-50/50">
              <h3 className="font-display font-semibold text-slate-900">
                {selectedGoal ? 'Editar Meta' : 'Nova Meta Financeira'}
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
                  Nome da Meta / Objetivo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Reserva de Emergência, Viagem Disney..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de Objetivo *
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white"
                >
                  {goalCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Valor Alvo (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={targetAmount}
                    onChange={e => setTargetAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Valor Já Acumulado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={currentAmount}
                    onChange={e => setCurrentAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prazo Estimado (opcional)
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
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
                  className="px-4 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs"
                >
                  Salvar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Deposit / Withdraw Modal */}
      {depositModalOpen && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-xs rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-stone-100 bg-emerald-50/50">
              <h3 className="font-display font-semibold text-slate-900 text-sm">
                {isWithdraw ? 'Resgatar Valor' : 'Aportar na Meta'}
              </h3>
              <button 
                type="button" 
                onClick={() => setDepositModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="p-4 space-y-3">
              <p className="text-xs text-slate-600">
                Meta: <strong>{selectedGoal.name}</strong>
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Valor da Operação (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  autoFocus
                  placeholder="0,00"
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-semibold text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDepositModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 text-xs font-semibold text-white rounded-xl shadow-xs transition ${
                    isWithdraw ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {isWithdraw ? 'Confirmar Resgate' : 'Confirmar Aporte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
