import { Category } from '../types.ts';

export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { id: 'moradia', name: 'Moradia', color: '#6366f1', icon: 'Home' },
  { id: 'aluguel', name: 'Aluguel', color: '#8b5cf6', icon: 'Building' },
  { id: 'agua', name: 'Água', color: '#0ea5e9', icon: 'Droplets' },
  { id: 'energia', name: 'Energia', color: '#eab308', icon: 'Zap' },
  { id: 'internet', name: 'Internet', color: '#3b82f6', icon: 'Wifi' },
  { id: 'telefone', name: 'Telefone', color: '#06b6d4', icon: 'Phone' },
  { id: 'alimentacao', name: 'Alimentação', color: '#f97316', icon: 'Utensils' },
  { id: 'mercado', name: 'Mercado', color: '#10b981', icon: 'ShoppingCart' },
  { id: 'transporte', name: 'Transporte', color: '#64748b', icon: 'Bus' },
  { id: 'combustivel', name: 'Combustível', color: '#ef4444', icon: 'Fuel' },
  { id: 'pets', name: 'Pets', color: '#ec4899', icon: 'Heart' },
  { id: 'saude', name: 'Saúde', color: '#14b8a6', icon: 'Activity' },
  { id: 'beleza', name: 'Beleza', color: '#f43f5e', icon: 'Sparkles' },
  { id: 'cursos', name: 'Cursos', color: '#8b5cf6', icon: 'GraduationCap' },
  { id: 'lazer', name: 'Lazer', color: '#a855f7', icon: 'Smile' },
  { id: 'cartao_credito', name: 'Cartão de crédito', color: '#dc2626', icon: 'CreditCard' },
  { id: 'emprestimos', name: 'Empréstimos', color: '#b45309', icon: 'FileText' },
  { id: 'dividas', name: 'Dívidas', color: '#991b1b', icon: 'AlertTriangle' },
  { id: 'assinaturas', name: 'Assinaturas', color: '#7c3aed', icon: 'Repeat' },
  { id: 'outros', name: 'Outros', color: '#94a3b8', icon: 'Tag' },
];

export const DEFAULT_INCOME_CATEGORIES: string[] = [
  'Salário',
  '13º salário',
  'Férias',
  'Renda extra',
  'Freelance',
  'Venda',
  'Investimentos',
  'Outros'
];
