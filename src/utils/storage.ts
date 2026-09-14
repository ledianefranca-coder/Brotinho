import { 
  Expense, 
  Income, 
  Debt, 
  Goal, 
  Category, 
  FixedExpenseTemplate 
} from '../types.ts';
import { DEFAULT_EXPENSE_CATEGORIES } from './categories.ts';

const STORAGE_KEYS = {
  PASSWORD_HASH: 'mcf_password_hash',
  AUTH_SESSION: 'mcf_auth_session',
  EXPENSES: 'mcf_expenses',
  INCOMES: 'mcf_incomes',
  DEBTS: 'mcf_debts',
  GOALS: 'mcf_goals',
  CATEGORIES: 'mcf_categories',
  FIXED_TEMPLATES: 'mcf_fixed_templates',
  SEEDED: 'mcf_is_seeded_v1',
};

// SHA-256 for default demo password "123456"
export const DEFAULT_PASSWORD_HASH = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92';

export function getStoredPasswordHash(): string {
  return localStorage.getItem(STORAGE_KEYS.PASSWORD_HASH) || DEFAULT_PASSWORD_HASH;
}

export function setStoredPasswordHash(newHash: string): void {
  localStorage.setItem(STORAGE_KEYS.PASSWORD_HASH, newHash);
}

export function isAuthenticated(): boolean {
  return sessionStorage.getItem(STORAGE_KEYS.AUTH_SESSION) === 'true';
}

export function setAuthenticated(val: boolean): void {
  if (val) {
    sessionStorage.setItem(STORAGE_KEYS.AUTH_SESSION, 'true');
  } else {
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  }
}

export function getCategories(): Category[] {
  const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  if (!data) return DEFAULT_EXPENSE_CATEGORIES;
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_EXPENSE_CATEGORIES;
  }
}

export function saveCategories(categories: Category[]): void {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
}

export function getExpenses(): Expense[] {
  const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveExpenses(expenses: Expense[]): void {
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
}

export function getIncomes(): Income[] {
  const data = localStorage.getItem(STORAGE_KEYS.INCOMES);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveIncomes(incomes: Income[]): void {
  localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(incomes));
}

export function getDebts(): Debt[] {
  const data = localStorage.getItem(STORAGE_KEYS.DEBTS);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveDebts(debts: Debt[]): void {
  localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
}

export function getGoals(): Goal[] {
  const data = localStorage.getItem(STORAGE_KEYS.GOALS);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveGoals(goals: Goal[]): void {
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
}

export function getFixedTemplates(): FixedExpenseTemplate[] {
  const data = localStorage.getItem(STORAGE_KEYS.FIXED_TEMPLATES);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveFixedTemplates(templates: FixedExpenseTemplate[]): void {
  localStorage.setItem(STORAGE_KEYS.FIXED_TEMPLATES, JSON.stringify(templates));
}

export function resetAllDataToDefault(): void {
  localStorage.clear();
  initializeSeedData(true);
}

export function exportAllData(): string {
  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    expenses: getExpenses(),
    incomes: getIncomes(),
    debts: getDebts(),
    goals: getGoals(),
    categories: getCategories(),
    fixedTemplates: getFixedTemplates(),
  };
  return JSON.stringify(backup, null, 2);
}

export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.expenses && Array.isArray(data.expenses)) saveExpenses(data.expenses);
    if (data.incomes && Array.isArray(data.incomes)) saveIncomes(data.incomes);
    if (data.debts && Array.isArray(data.debts)) saveDebts(data.debts);
    if (data.goals && Array.isArray(data.goals)) saveGoals(data.goals);
    if (data.categories && Array.isArray(data.categories)) saveCategories(data.categories);
    if (data.fixedTemplates && Array.isArray(data.fixedTemplates)) saveFixedTemplates(data.fixedTemplates);
    return true;
  } catch {
    return false;
  }
}

/**
 * Initializes realistic demo data centered on September 2026
 */
export function initializeSeedData(force: boolean = false): void {
  if (!force && localStorage.getItem(STORAGE_KEYS.SEEDED)) {
    return;
  }

  const seedExpenses: Expense[] = [
    // --- Setembro 2026 ---
    {
      id: 'exp-sep-1',
      name: 'Aluguel do Apartamento',
      category: 'Aluguel',
      amount: 1850.00,
      dueDate: '2026-09-05',
      status: 'paid',
      paymentMethod: 'Pix',
      notes: 'Pago pontualmente com comprovante enviado para imobiliária',
      isFixed: true,
      repeatMonthly: true,
      paidAt: '2026-09-05',
      paidAmount: 1850.00,
      yearMonth: '2026-09',
    },
    {
      id: 'exp-sep-2',
      name: 'Internet Fibra Óptica 600MB',
      category: 'Internet',
      amount: 129.90,
      dueDate: '2026-09-08',
      status: 'paid',
      paymentMethod: 'Débito',
      notes: 'Débito em conta corrente',
      isFixed: true,
      repeatMonthly: true,
      paidAt: '2026-09-08',
      paidAmount: 129.90,
      yearMonth: '2026-09',
    },
    {
      id: 'exp-sep-3',
      name: 'Feira & Supermercado da Semana',
      category: 'Mercado',
      amount: 540.00,
      dueDate: '2026-09-07',
      status: 'paid',
      paymentMethod: 'Cartão de Crédito',
      notes: 'Compras de hortifruti e despensa',
      isFixed: false,
      repeatMonthly: false,
      paidAt: '2026-09-07',
      paidAmount: 540.00,
      yearMonth: '2026-09',
    },
    {
      id: 'exp-sep-4',
      name: 'Água e Saneamento',
      category: 'Água',
      amount: 78.50,
      dueDate: '2026-09-10',
      status: 'overdue',
      paymentMethod: 'Pix',
      notes: 'Conta atrasada há 4 dias! Lembrar de pagar hoje.',
      isFixed: true,
      repeatMonthly: true,
      yearMonth: '2026-09',
    },
    {
      id: 'exp-sep-5',
      name: 'Energia Elétrica (Enel)',
      category: 'Energia',
      amount: 184.20,
      dueDate: '2026-09-14',
      status: 'pending',
      paymentMethod: 'Boleto',
      notes: 'Vence hoje! Boleto disponível no app do banco.',
      isFixed: true,
      repeatMonthly: true,
      yearMonth: '2026-09',
    },
    {
      id: 'exp-sep-6',
      name: 'Fatura Cartão de Crédito Nubank',
      category: 'Cartão de crédito',
      amount: 1120.00,
      dueDate: '2026-09-18',
      status: 'pending',
      paymentMethod: 'Pix',
      notes: 'Vence em 4 dias. Inclui parcelas de eletrodoméstico e farmácia.',
      isFixed: false,
      repeatMonthly: false,
      yearMonth: '2026-09',
    },
    {
      id: 'exp-sep-7',
      name: 'Assinaturas Streaming (Netflix & Spotify)',
      category: 'Assinaturas',
      amount: 85.80,
      dueDate: '2026-09-20',
      status: 'pending',
      paymentMethod: 'Cartão de Crédito',
      notes: 'Cobrança automática agendada',
      isFixed: true,
      repeatMonthly: true,
      yearMonth: '2026-09',
    },
    {
      id: 'exp-sep-8',
      name: 'Plano Celular Pessoal',
      category: 'Telefone',
      amount: 65.00,
      dueDate: '2026-09-22',
      status: 'pending',
      paymentMethod: 'Pix',
      notes: 'Controle 30GB',
      isFixed: true,
      repeatMonthly: true,
      yearMonth: '2026-09',
    },
    {
      id: 'exp-sep-9',
      name: 'Ração e Cuidados Pet (Veterinário)',
      category: 'Pets',
      amount: 195.00,
      dueDate: '2026-09-25',
      status: 'pending',
      paymentMethod: 'Pix',
      notes: 'Ração especial 10kg + antipulgas',
      isFixed: false,
      repeatMonthly: false,
      yearMonth: '2026-09',
    },
    {
      id: 'exp-sep-10',
      name: 'Academia & Pilates',
      category: 'Saúde',
      amount: 160.00,
      dueDate: '2026-09-28',
      status: 'pending',
      paymentMethod: 'Débito',
      notes: 'Mensalidade bem-estar e saúde',
      isFixed: true,
      repeatMonthly: true,
      yearMonth: '2026-09',
    },

    // --- Agosto 2026 (Mês anterior para histórico) ---
    {
      id: 'exp-aug-1',
      name: 'Aluguel do Apartamento',
      category: 'Aluguel',
      amount: 1850.00,
      dueDate: '2026-08-05',
      status: 'paid',
      paymentMethod: 'Pix',
      isFixed: true,
      repeatMonthly: true,
      paidAt: '2026-08-05',
      paidAmount: 1850.00,
      yearMonth: '2026-08',
    },
    {
      id: 'exp-aug-2',
      name: 'Internet Fibra Óptica 600MB',
      category: 'Internet',
      amount: 129.90,
      dueDate: '2026-08-08',
      status: 'paid',
      paymentMethod: 'Débito',
      isFixed: true,
      repeatMonthly: true,
      paidAt: '2026-08-08',
      paidAmount: 129.90,
      yearMonth: '2026-08',
    },
    {
      id: 'exp-aug-3',
      name: 'Energia Elétrica',
      category: 'Energia',
      amount: 172.40,
      dueDate: '2026-08-14',
      status: 'paid',
      paymentMethod: 'Boleto',
      isFixed: true,
      repeatMonthly: true,
      paidAt: '2026-08-14',
      paidAmount: 172.40,
      yearMonth: '2026-08',
    },
    {
      id: 'exp-aug-4',
      name: 'Fatura Cartão de Crédito',
      category: 'Cartão de crédito',
      amount: 980.00,
      dueDate: '2026-08-18',
      status: 'paid',
      paymentMethod: 'Pix',
      isFixed: false,
      repeatMonthly: false,
      paidAt: '2026-08-18',
      paidAmount: 980.00,
      yearMonth: '2026-08',
    },
    {
      id: 'exp-aug-5',
      name: 'Supermercado Mensal',
      category: 'Mercado',
      amount: 820.00,
      dueDate: '2026-08-20',
      status: 'paid',
      paymentMethod: 'Cartão de Crédito',
      isFixed: false,
      repeatMonthly: false,
      paidAt: '2026-08-20',
      paidAmount: 820.00,
      yearMonth: '2026-08',
    },

    // --- Outubro 2026 (Próximo mês planejado) ---
    {
      id: 'exp-oct-1',
      name: 'Aluguel do Apartamento',
      category: 'Aluguel',
      amount: 1850.00,
      dueDate: '2026-10-05',
      status: 'pending',
      paymentMethod: 'Pix',
      isFixed: true,
      repeatMonthly: true,
      yearMonth: '2026-10',
    },
    {
      id: 'exp-oct-2',
      name: 'Internet Fibra Óptica 600MB',
      category: 'Internet',
      amount: 129.90,
      dueDate: '2026-10-08',
      status: 'pending',
      paymentMethod: 'Débito',
      isFixed: true,
      repeatMonthly: true,
      yearMonth: '2026-10',
    }
  ];

  const seedIncomes: Income[] = [
    // --- Setembro 2026 ---
    {
      id: 'inc-sep-1',
      description: 'Salário Mensal Líquido',
      amount: 6200.00,
      date: '2026-09-05',
      category: 'Salário',
      isFixed: true,
      notes: 'Depósito em conta corrente Bradesco',
      yearMonth: '2026-09',
    },
    {
      id: 'inc-sep-2',
      description: 'Consultoria / Freelance Design UI',
      amount: 1450.00,
      date: '2026-09-12',
      category: 'Freelance',
      isFixed: false,
      notes: 'Projeto entregue e aprovado com cliente',
      yearMonth: '2026-09',
    },
    {
      id: 'inc-sep-3',
      description: 'Rendimento de Dividendos & FIIs',
      amount: 210.00,
      date: '2026-09-15',
      category: 'Investimentos',
      isFixed: false,
      notes: 'Proventos recebidos na corretora',
      yearMonth: '2026-09',
    },

    // --- Agosto 2026 ---
    {
      id: 'inc-aug-1',
      description: 'Salário Mensal Líquido',
      amount: 6200.00,
      date: '2026-08-05',
      category: 'Salário',
      isFixed: true,
      yearMonth: '2026-08',
    },
    {
      id: 'inc-aug-2',
      description: 'Renda Extra - Venda de Peças Usadas',
      amount: 450.00,
      date: '2026-08-16',
      category: 'Venda',
      isFixed: false,
      yearMonth: '2026-08',
    },

    // --- Outubro 2026 ---
    {
      id: 'inc-oct-1',
      description: 'Salário Mensal Líquido',
      amount: 6200.00,
      date: '2026-10-05',
      category: 'Salário',
      isFixed: true,
      yearMonth: '2026-10',
    }
  ];

  const seedDebts: Debt[] = [
    {
      id: 'debt-1',
      name: 'Financiamento Veículo Hatch',
      initialAmount: 42000.00,
      totalInstallments: 48,
      paidInstallments: 24,
      installmentAmount: 875.00,
      institution: 'Banco Santander Financiamentos',
      interestRate: '1.45% a.m.',
      canAnticipate: true,
      notes: 'Opção de amortização de parcelas pelo saldo devedor com desconto de juros futuros.',
      dueDay: 15,
      startDate: '2024-09-15',
    },
    {
      id: 'debt-2',
      name: 'Empréstimo Pessoal Reforma Apê',
      initialAmount: 12000.00,
      totalInstallments: 24,
      paidInstallments: 14,
      installmentAmount: 620.00,
      institution: 'Nubank Empréstimos',
      interestRate: '2.1% a.m.',
      canAnticipate: true,
      notes: 'Planejando quitar antecipadamente as últimas 5 parcelas no final do ano.',
      dueDay: 20,
      startDate: '2025-07-20',
    },
    {
      id: 'debt-3',
      name: 'Parcelamento Notebook Trabalho',
      initialAmount: 4800.00,
      totalInstallments: 10,
      paidInstallments: 7,
      installmentAmount: 480.00,
      institution: 'Cartão Itaú',
      interestRate: 'Sem juros',
      canAnticipate: true,
      notes: 'Faltam apenas 3 parcelas para quitar o equipamento.',
      dueDay: 10,
      startDate: '2026-02-10',
    }
  ];

  const seedGoals: Goal[] = [
    {
      id: 'goal-1',
      name: 'Reserva de Emergência (6 Meses)',
      targetAmount: 25000.00,
      currentAmount: 16500.00,
      deadline: '2026-12-31',
      category: 'Reserva financeira',
      icon: 'ShieldCheck',
      color: '#10b981',
    },
    {
      id: 'goal-2',
      name: 'Viagem de Férias Praia do Rosa',
      targetAmount: 5000.00,
      currentAmount: 3450.00,
      deadline: '2027-01-15',
      category: 'Viagem',
      icon: 'Palmtree',
      color: '#06b6d4',
    },
    {
      id: 'goal-3',
      name: 'Quitar Empréstimo Reforma',
      targetAmount: 6200.00,
      currentAmount: 4100.00,
      deadline: '2026-11-30',
      category: 'Quitar uma dívida',
      icon: 'CheckCircle2',
      color: '#8b5cf6',
    },
    {
      id: 'goal-4',
      name: 'Fundo Novo Projeto Pessoal',
      targetAmount: 8000.00,
      currentAmount: 2200.00,
      deadline: '2027-06-30',
      category: 'Projeto pessoal',
      icon: 'Sparkles',
      color: '#f59e0b',
    }
  ];

  const seedFixedTemplates: FixedExpenseTemplate[] = [
    {
      id: 'fix-1',
      name: 'Aluguel do Apartamento',
      category: 'Aluguel',
      amount: 1850.00,
      dueDay: 5,
      paymentMethod: 'Pix',
      notes: 'Vencimento todo dia 05',
      active: true,
    },
    {
      id: 'fix-2',
      name: 'Internet Fibra Óptica 600MB',
      category: 'Internet',
      amount: 129.90,
      dueDay: 8,
      paymentMethod: 'Débito',
      notes: 'Débito automático no banco',
      active: true,
    },
    {
      id: 'fix-3',
      name: 'Água e Saneamento',
      category: 'Água',
      amount: 80.00,
      dueDay: 10,
      paymentMethod: 'Pix',
      notes: 'Valor médio mensal',
      active: true,
    },
    {
      id: 'fix-4',
      name: 'Energia Elétrica',
      category: 'Energia',
      amount: 180.00,
      dueDay: 14,
      paymentMethod: 'Boleto',
      notes: 'Vencimento dia 14',
      active: true,
    },
    {
      id: 'fix-5',
      name: 'Assinaturas Streaming',
      category: 'Assinaturas',
      amount: 85.80,
      dueDay: 20,
      paymentMethod: 'Cartão de Crédito',
      notes: 'Netflix + Spotify Duo',
      active: true,
    },
    {
      id: 'fix-6',
      name: 'Plano Celular Pessoal',
      category: 'Telefone',
      amount: 65.00,
      dueDay: 22,
      paymentMethod: 'Pix',
      notes: 'Plano celular mensal',
      active: true,
    },
    {
      id: 'fix-7',
      name: 'Academia & Pilates',
      category: 'Saúde',
      amount: 160.00,
      dueDay: 28,
      paymentMethod: 'Débito',
      notes: 'Saúde e treino regular',
      active: true,
    }
  ];

  saveExpenses(seedExpenses);
  saveIncomes(seedIncomes);
  saveDebts(seedDebts);
  saveGoals(seedGoals);
  saveFixedTemplates(seedFixedTemplates);
  saveCategories(DEFAULT_EXPENSE_CATEGORIES);
  localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
}
