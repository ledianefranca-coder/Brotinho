import { Expense, MascotMood, MascotStatus } from '../types.ts';

export function evaluateMascotStatus(expenses: Expense[]): MascotStatus {
  if (expenses.length === 0) {
    return {
      mood: 'all_good',
      emoji: '🌱',
      title: 'Tudo pronto para começar!',
      message: 'Cadastre suas primeiras receitas e despesas para acompanhar seu mês com tranquilidade.',
    };
  }

  const overdueBills = expenses.filter(e => e.status === 'overdue');
  const paidBills = expenses.filter(e => e.status === 'paid');
  const pendingBills = expenses.filter(e => e.status === 'pending');

  // Check for upcoming due bills (within next 5 days or today)
  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date(todayStr + 'T00:00:00');
  
  const upcomingBills = pendingBills.filter(e => {
    const due = new Date(e.dueDate + 'T00:00:00');
    const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 5;
  });

  // Priority 1: Has overdue bills!
  if (overdueBills.length > 0) {
    const count = overdueBills.length;
    return {
      mood: 'overdue',
      emoji: '😟',
      title: 'Temos contas atrasadas para resolver.',
      message: `${count === 1 ? 'Existe 1 conta atrasada' : `Existem ${count} contas atrasadas`} aguardando seu pagamento. Que tal resolver agora para manter a paz?`,
    };
  }

  // Priority 2: All bills paid!
  if (paidBills.length > 0 && pendingBills.length === 0) {
    return {
      mood: 'month_completed',
      emoji: '🎉',
      title: 'Mês concluído!',
      message: 'Parabéns! Todas as contas deste mês foram pagas. Você cuidou das suas finanças com maestria!',
    };
  }

  // Priority 3: Upcoming bills due in next 5 days
  if (upcomingBills.length > 0) {
    const count = upcomingBills.length;
    const hasToday = upcomingBills.some(e => e.dueDate === todayStr);
    return {
      mood: 'upcoming_due',
      emoji: '👀',
      title: hasToday ? 'Tem conta vencendo hoje!' : 'Tem conta vencendo em breve.',
      message: hasToday 
        ? 'Atenção especial: você tem conta que vence hoje. Dê uma conferida!' 
        : `${count === 1 ? '1 conta vence' : `${count} contas vencem`} nos próximos 5 dias. O planejamento está sob seus olhos.`,
    };
  }

  // Priority 4: Majority paid (> 50%)
  if (paidBills.length >= pendingBills.length && paidBills.length > 0) {
    return {
      mood: 'in_control',
      emoji: '😌',
      title: 'Você está no controle!',
      message: 'Mais da metade das suas contas deste mês já foram quitadas. Mantenha o foco!',
    };
  }

  // Default: All good!
  return {
    mood: 'all_good',
    emoji: '😊',
    title: 'Tudo em dia!',
    message: 'Nenhuma conta atrasada por aqui. Suas finanças estão organizadas e fluindo com tranquilidade.',
  };
}
