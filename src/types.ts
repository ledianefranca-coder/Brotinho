export type TransactionStatus = 'paid' | 'pending' | 'overdue';

export type PaymentMethod = 
  | 'Pix' 
  | 'Cartão de Crédito' 
  | 'Boleto' 
  | 'Débito' 
  | 'Dinheiro' 
  | 'Transferência';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  isCustom?: boolean;
}

export interface Expense {
  id: string;
  name: string;
  category: string; // category id or name
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  isFixed: boolean; // Despesa fixa: Sim/Não
  repeatMonthly: boolean; // Repetir mensalmente: Sim/Não
  paidAt?: string; // Data do pagamento
  paidAmount?: number; // Valor efetivamente pago
  yearMonth: string; // YYYY-MM for fast indexing
}

export interface Income {
  id: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category: string;
  isFixed: boolean; // Fixa ou Eventual
  notes?: string;
  yearMonth: string; // YYYY-MM
}

export interface Debt {
  id: string;
  name: string;
  initialAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  installmentAmount: number;
  institution: string;
  interestRate?: string; // e.g. "1.9% a.m."
  canAnticipate: boolean;
  notes?: string;
  dueDay: number;
  startDate: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string; // YYYY-MM-DD
  category?: string;
  icon?: string;
  color?: string;
}

export interface FixedExpenseTemplate {
  id: string;
  name: string;
  category: string;
  amount: number;
  dueDay: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  active: boolean;
}

export type MascotMood = 'all_good' | 'in_control' | 'upcoming_due' | 'overdue' | 'month_completed';

export interface MascotStatus {
  mood: MascotMood;
  emoji: string;
  title: string;
  message: string;
}

export type ActiveTab = 
  | 'dashboard'
  | 'transactions'
  | 'bills_to_pay'
  | 'paid_bills'
  | 'overdue'
  | 'fixed_expenses'
  | 'incomes'
  | 'debts'
  | 'goals'
  | 'calendar'
  | 'reports'
  | 'monthly_summary'
  | 'settings';
