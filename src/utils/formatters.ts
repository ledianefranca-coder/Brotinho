export function formatCurrency(value: number): string {
  if (isNaN(value) || value === null || value === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  // handles YYYY-MM-DD cleanly without timezone offset bugs
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateStr;
}

export function formatDateLong(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }
  return dateStr;
}

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function getMonthName(monthIndex: number): string {
  return MONTH_NAMES[monthIndex] || '';
}

export function formatYearMonth(yearMonth: string): string {
  if (!yearMonth) return '';
  const [year, month] = yearMonth.split('-');
  const mIndex = parseInt(month, 10) - 1;
  return `${MONTH_NAMES[mIndex]} ${year}`;
}

export function getRelativeDueLabel(dueDateStr: string, status: string): { label: string; urgency: 'urgent' | 'warning' | 'normal' | 'done' } {
  if (status === 'paid') {
    return { label: 'Paga', urgency: 'done' };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date(todayStr + 'T00:00:00');
  const due = new Date(dueDateStr + 'T00:00:00');
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const daysAgo = Math.abs(diffDays);
    return {
      label: daysAgo === 1 ? 'Atrasada há 1 dia' : `Atrasada há ${daysAgo} dias`,
      urgency: 'urgent'
    };
  } else if (diffDays === 0) {
    return { label: 'Vence hoje!', urgency: 'urgent' };
  } else if (diffDays === 1) {
    return { label: 'Vence amanhã', urgency: 'warning' };
  } else if (diffDays <= 5) {
    return { label: `Vence em ${diffDays} dias`, urgency: 'warning' };
  } else {
    return { label: `Vence em ${diffDays} dias`, urgency: 'normal' };
  }
}

export function getPreviousMonth(yearMonth: string): string {
  const [yearStr, monthStr] = yearMonth.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);
  month -= 1;
  if (month < 1) {
    month = 12;
    year -= 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function getNextMonth(yearMonth: string): string {
  const [yearStr, monthStr] = yearMonth.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);
  month += 1;
  if (month > 12) {
    month = 1;
    year += 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}
