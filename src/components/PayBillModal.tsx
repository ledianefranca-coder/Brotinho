import React, { useState } from 'react';
import { X, CheckCircle, Calendar, DollarSign } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Expense } from '../types.ts';
import { formatCurrency } from '../utils/formatters.ts';

interface PayBillModalProps {
  bill: Expense | null;
  onClose: () => void;
  onConfirm: (billId: string, paidDate: string, paidAmount: number) => void;
}

export function PayBillModal({ bill, onClose, onConfirm }: PayBillModalProps) {
  if (!bill) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const [paidDate, setPaidDate] = useState(todayStr);
  const [paidAmount, setPaidAmount] = useState(bill.amount.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(paidAmount.replace(',', '.')) || bill.amount;
    
    // Trigger festive micro-confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#facc15']
      });
    } catch {
      // ignore in test environments
    }

    onConfirm(bill.id, paidDate, parsedAmount);
    onClose();
  };

  return (
    <div id="modal-pay-bill-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div 
        id="modal-pay-bill-content"
        className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-stone-200/80 overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-stone-100 bg-emerald-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-slate-900">Registrar Pagamento</h3>
              <p className="text-xs text-slate-500">Marcar despesa como quitada</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-stone-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100">
            <p className="text-xs text-slate-500">Despesa selecionada</p>
            <p className="font-medium text-slate-800 text-sm mt-0.5">{bill.name}</p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-200/60 text-xs text-slate-600">
              <span>Vencimento original:</span>
              <span className="font-semibold text-slate-700">{bill.dueDate}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600 mt-1">
              <span>Valor original:</span>
              <span className="font-semibold text-slate-800">{formatCurrency(bill.amount)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Data do Pagamento
            </label>
            <input
              id="input-payment-date"
              type="date"
              required
              value={paidDate}
              onChange={e => setPaidDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-500" />
              Valor Efetivamente Pago (R$)
            </label>
            <input
              id="input-payment-amount"
              type="number"
              step="0.01"
              required
              value={paidAmount}
              onChange={e => setPaidAmount(e.target.value)}
              placeholder="0,00"
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Caso tenha tido desconto ou acréscimo de juros, ajuste o valor real pago.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              id="btn-confirm-payment"
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              Confirmar Pagamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
