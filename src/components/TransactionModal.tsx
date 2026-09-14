import React, { useState } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { 
  Expense, 
  Income, 
  Category, 
  PaymentMethod, 
  TransactionStatus 
} from '../types.ts';
import { DEFAULT_INCOME_CATEGORIES } from '../utils/categories.ts';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  currentYearMonth: string;
  initialType?: 'expense' | 'income';
  editingExpense?: Expense | null;
  editingIncome?: Income | null;
  onSaveExpense: (expense: Expense) => void;
  onSaveIncome: (income: Income) => void;
}

export function TransactionModal({
  isOpen,
  onClose,
  categories,
  currentYearMonth,
  initialType = 'expense',
  editingExpense,
  editingIncome,
  onSaveExpense,
  onSaveIncome,
}: TransactionModalProps) {
  if (!isOpen) return null;

  const [type, setType] = useState<'expense' | 'income'>(
    editingIncome ? 'income' : editingExpense ? 'expense' : initialType
  );

  // Expense form state
  const defaultDueDate = editingExpense ? editingExpense.dueDate : `${currentYearMonth}-15`;
  const [expenseName, setExpenseName] = useState(editingExpense?.name || '');
  const [expenseCategory, setExpenseCategory] = useState(editingExpense?.category || (categories[0]?.name || 'Outros'));
  const [expenseAmount, setExpenseAmount] = useState(editingExpense ? editingExpense.amount.toString() : '');
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const [status, setStatus] = useState<TransactionStatus>(editingExpense?.status || 'pending');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(editingExpense?.paymentMethod || 'Pix');
  const [expenseNotes, setExpenseNotes] = useState(editingExpense?.notes || '');
  const [isFixed, setIsFixed] = useState<boolean>(editingExpense?.isFixed || false);
  const [repeatMonthly, setRepeatMonthly] = useState<boolean>(editingExpense?.repeatMonthly || false);
  const [paidAt, setPaidAt] = useState<string>(editingExpense?.paidAt || defaultDueDate);
  const [paidAmount, setPaidAmount] = useState<string>(
    editingExpense?.paidAmount !== undefined ? editingExpense.paidAmount.toString() : ''
  );

  // Income form state
  const defaultIncomeDate = editingIncome ? editingIncome.date : `${currentYearMonth}-05`;
  const [incomeDescription, setIncomeDescription] = useState(editingIncome?.description || '');
  const [incomeCategory, setIncomeCategory] = useState(editingIncome?.category || 'Salário');
  const [incomeAmount, setIncomeAmount] = useState(editingIncome ? editingIncome.amount.toString() : '');
  const [incomeDate, setIncomeDate] = useState(defaultIncomeDate);
  const [incomeIsFixed, setIncomeIsFixed] = useState<boolean>(editingIncome?.isFixed ?? true);
  const [incomeNotes, setIncomeNotes] = useState(editingIncome?.notes || '');

  const paymentMethodsList: PaymentMethod[] = [
    'Pix',
    'Cartão de Crédito',
    'Boleto',
    'Débito',
    'Dinheiro',
    'Transferência'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (type === 'expense') {
      const parsedAmount = parseFloat(expenseAmount.replace(',', '.')) || 0;
      if (parsedAmount <= 0) return;

      const ym = dueDate.slice(0, 7);
      const isPaid = status === 'paid';
      const actualPaidAmount = isPaid 
        ? (parseFloat(paidAmount.replace(',', '.')) || parsedAmount)
        : undefined;

      const newExpense: Expense = {
        id: editingExpense?.id || `exp-${Date.now()}`,
        name: expenseName.trim(),
        category: expenseCategory,
        amount: parsedAmount,
        dueDate,
        status,
        paymentMethod,
        notes: expenseNotes.trim() || undefined,
        isFixed,
        repeatMonthly,
        paidAt: isPaid ? (paidAt || dueDate) : undefined,
        paidAmount: actualPaidAmount,
        yearMonth: ym,
      };

      onSaveExpense(newExpense);
    } else {
      const parsedAmount = parseFloat(incomeAmount.replace(',', '.')) || 0;
      if (parsedAmount <= 0) return;

      const ym = incomeDate.slice(0, 7);
      const newIncome: Income = {
        id: editingIncome?.id || `inc-${Date.now()}`,
        description: incomeDescription.trim(),
        category: incomeCategory,
        amount: parsedAmount,
        date: incomeDate,
        isFixed: incomeIsFixed,
        notes: incomeNotes.trim() || undefined,
        yearMonth: ym,
      };

      onSaveIncome(newIncome);
    }

    onClose();
  };

  return (
    <div id="modal-transaction-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        id="modal-transaction-content"
        className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-stone-200/80 overflow-hidden my-6 transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-100 bg-stone-50/70">
          <div>
            <h3 className="font-display font-semibold text-slate-900 text-base sm:text-lg">
              {editingExpense || editingIncome 
                ? 'Editar Movimentação' 
                : 'Nova Movimentação Financeira'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Organize suas receitas e despesas com facilidade
            </p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-stone-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Toggle: Despesa vs Receita */}
        {!editingExpense && !editingIncome && (
          <div className="p-4 sm:p-5 pb-0">
            <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl">
              <button
                type="button"
                id="tab-toggle-expense"
                onClick={() => setType('expense')}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${
                  type === 'expense'
                    ? 'bg-white text-rose-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowDownCircle className="w-4 h-4" />
                Despesa (Conta)
              </button>
              <button
                type="button"
                id="tab-toggle-income"
                onClick={() => setType('income')}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${
                  type === 'income'
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowUpCircle className="w-4 h-4" />
                Receita (Entrada)
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {type === 'expense' ? (
            /* --- EXPENSE FIELDS --- */
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome da Despesa *
                </label>
                <input
                  id="input-expense-name"
                  type="text"
                  required
                  placeholder="Ex: Aluguel, Supermercado, Internet..."
                  value={expenseName}
                  onChange={e => setExpenseName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    id="select-expense-category"
                    value={expenseCategory}
                    onChange={e => setExpenseCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none bg-white transition cursor-pointer"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    id="input-expense-amount"
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={expenseAmount}
                    onChange={e => setExpenseAmount(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data de Vencimento *
                  </label>
                  <input
                    id="input-expense-due-date"
                    type="date"
                    required
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Forma de Pagamento
                  </label>
                  <select
                    id="select-expense-payment-method"
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none bg-white transition cursor-pointer"
                  >
                    {paymentMethodsList.map(pm => (
                      <option key={pm} value={pm}>{pm}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status da Conta
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('pending')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition cursor-pointer ${
                      status === 'pending'
                        ? 'bg-sky-50 border-sky-400 text-sky-800 font-semibold'
                        : 'border-stone-200 text-slate-600 hover:bg-stone-50'
                    }`}
                  >
                    🔵 A pagar
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('paid')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition cursor-pointer ${
                      status === 'paid'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-semibold'
                        : 'border-stone-200 text-slate-600 hover:bg-stone-50'
                    }`}
                  >
                    🟢 Pago
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('overdue')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition cursor-pointer ${
                      status === 'overdue'
                        ? 'bg-rose-50 border-rose-400 text-rose-800 font-semibold'
                        : 'border-stone-200 text-slate-600 hover:bg-stone-50'
                    }`}
                  >
                    🔴 Atrasado
                  </button>
                </div>
              </div>

              {/* Conditional fields if Marked as PAGO */}
              {status === 'paid' && (
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-3">
                  <p className="text-xs font-semibold text-emerald-900">Detalhes da Quitação</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-emerald-950 mb-0.5">
                        Data do Pagamento
                      </label>
                      <input
                        type="date"
                        value={paidAt}
                        onChange={e => setPaidAt(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-emerald-200 rounded-lg outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-emerald-950 mb-0.5">
                        Valor Efetivamente Pago (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder={expenseAmount || "0,00"}
                        value={paidAmount}
                        onChange={e => setPaidAmount(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-emerald-200 rounded-lg outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Toggles: Despesa Fixa & Repetir Mensalmente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 cursor-pointer">
                  <input
                    id="checkbox-fixed-expense"
                    type="checkbox"
                    checked={isFixed}
                    onChange={e => setIsFixed(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-800">Despesa Fixa</span>
                    <p className="text-slate-500 text-[11px]">Ex: aluguel, internet, condomínio</p>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 cursor-pointer">
                  <input
                    id="checkbox-repeat-monthly"
                    type="checkbox"
                    checked={repeatMonthly}
                    onChange={e => setRepeatMonthly(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-800">Repetir Mensalmente</span>
                    <p className="text-slate-500 text-[11px]">Gerar nos meses seguintes</p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observação (opcional)
                </label>
                <textarea
                  rows={2}
                  value={expenseNotes}
                  onChange={e => setExpenseNotes(e.target.value)}
                  placeholder="Informações adicionais, código do boleto, etc."
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition"
                />
              </div>
            </>
          ) : (
            /* --- INCOME FIELDS --- */
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descrição da Receita *
                </label>
                <input
                  id="input-income-description"
                  type="text"
                  required
                  placeholder="Ex: Salário mensal, Freelance, 13º salário..."
                  value={incomeDescription}
                  onChange={e => setIncomeDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoria da Receita *
                  </label>
                  <select
                    id="select-income-category"
                    value={incomeCategory}
                    onChange={e => setIncomeCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white transition cursor-pointer"
                  >
                    {DEFAULT_INCOME_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Valor da Receita (R$) *
                  </label>
                  <input
                    id="input-income-amount"
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={incomeAmount}
                    onChange={e => setIncomeAmount(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition font-medium text-teal-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data do Recebimento *
                  </label>
                  <input
                    id="input-income-date"
                    type="date"
                    required
                    value={incomeDate}
                    onChange={e => setIncomeDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo de Receita
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIncomeIsFixed(true)}
                      className={`py-2 px-2 rounded-lg text-xs font-medium border text-center transition cursor-pointer ${
                        incomeIsFixed
                          ? 'bg-teal-50 border-teal-500 text-teal-800 font-semibold'
                          : 'border-stone-200 text-slate-600 hover:bg-stone-50'
                      }`}
                    >
                      Fixa (Recorrente)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIncomeIsFixed(false)}
                      className={`py-2 px-2 rounded-lg text-xs font-medium border text-center transition cursor-pointer ${
                        !incomeIsFixed
                          ? 'bg-teal-50 border-teal-500 text-teal-800 font-semibold'
                          : 'border-stone-200 text-slate-600 hover:bg-stone-50'
                      }`}
                    >
                      Eventual / Extra
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observação (opcional)
                </label>
                <textarea
                  rows={2}
                  value={incomeNotes}
                  onChange={e => setIncomeNotes(e.target.value)}
                  placeholder="Informações sobre a fonte pagadora, descontos, etc."
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition"
                />
              </div>
            </>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              id="btn-save-transaction"
              type="submit"
              className={`px-5 py-2 text-sm font-medium text-white rounded-xl shadow-xs transition active:scale-98 cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-teal-600 hover:bg-teal-700'
              }`}
            >
              Salvar {type === 'expense' ? 'Despesa' : 'Receita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
