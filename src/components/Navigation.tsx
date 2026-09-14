import { useState } from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  CalendarDays, 
  TrendingUp, 
  CreditCard, 
  Target, 
  Calendar, 
  BarChart3, 
  FileText, 
  Settings, 
  LogOut, 
  Plus, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';
import { ActiveTab, MascotStatus } from '../types.ts';
import { MonthSelector } from './MonthSelector.tsx';
import { MascotSvg } from './Mascot.tsx';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  currentYearMonth: string;
  onMonthChange: (ym: string) => void;
  onOpenNewTransaction: (type?: 'expense' | 'income') => void;
  onLogout: () => void;
  mascotStatus: MascotStatus;
  overdueCount: number;
  pendingCount: number;
}

export function Navigation({
  activeTab,
  onSelectTab,
  currentYearMonth,
  onMonthChange,
  onOpenNewTransaction,
  onLogout,
  mascotStatus,
  overdueCount,
  pendingCount
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions' as ActiveTab, label: 'Movimentações', icon: ArrowLeftRight },
    { 
      id: 'bills_to_pay' as ActiveTab, 
      label: 'Contas a pagar', 
      icon: Clock, 
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: 'bg-sky-100 text-sky-800' 
    },
    { id: 'paid_bills' as ActiveTab, label: 'Pagas', icon: CheckCircle2 },
    { 
      id: 'overdue' as ActiveTab, 
      label: 'Atrasadas', 
      icon: AlertCircle, 
      badge: overdueCount > 0 ? overdueCount : null,
      badgeColor: 'bg-rose-100 text-rose-700 animate-pulse'
    },
    { id: 'fixed_expenses' as ActiveTab, label: 'Despesas fixas', icon: CalendarDays },
    { id: 'incomes' as ActiveTab, label: 'Receitas', icon: TrendingUp },
    { id: 'debts' as ActiveTab, label: 'Dívidas e Parcelas', icon: CreditCard },
    { id: 'goals' as ActiveTab, label: 'Metas', icon: Target },
    { id: 'calendar' as ActiveTab, label: 'Calendário', icon: Calendar },
    { id: 'reports' as ActiveTab, label: 'Relatórios', icon: BarChart3 },
    { id: 'monthly_summary' as ActiveTab, label: 'Resumo Mensal', icon: FileText },
    { id: 'settings' as ActiveTab, label: 'Configurações', icon: Settings },
  ];

  const handleTabClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Header Bar */}
      <header id="app-top-header" className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand: Mascote + Meu Controle Financeiro */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-stone-100 cursor-pointer"
              title="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div 
              onClick={() => handleTabClick('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group select-none"
              title="Meu Controle Financeiro - Ir para Início"
            >
              <div 
                id="header-brand-mascot"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-50 border border-emerald-200/90 flex items-center justify-center shadow-2xs group-hover:scale-105 group-hover:bg-emerald-100/70 transition p-0.5 relative shrink-0"
                title={`Brotinho - Mascote: ${mascotStatus.title}`}
              >
                <MascotSvg status={mascotStatus} className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow-xs" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-slate-900 text-sm sm:text-base lg:text-lg tracking-tight block leading-tight whitespace-nowrap">
                  Meu Controle Financeiro
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium text-emerald-700 hidden sm:block leading-none mt-0.5">
                  Mascote Brotinho • Gestão Inteligente
                </span>
              </div>
            </div>
          </div>

          {/* Calendário & Ano Selecionáveis no Cabeçalho */}
          <div className="hidden sm:flex flex-1 justify-center max-w-md mx-2">
            <MonthSelector
              currentYearMonth={currentYearMonth}
              onChange={onMonthChange}
            />
          </div>

          {/* Actions: Logout */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Logout button */}
            <button
              id="btn-logout"
              type="button"
              onClick={onLogout}
              className="p-2 text-slate-500 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition cursor-pointer"
              title="Sair com segurança"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile month selector bar below header */}
        <div className="sm:hidden px-3 pb-2 pt-1 border-t border-stone-100">
          <MonthSelector
            currentYearMonth={currentYearMonth}
            onChange={onMonthChange}
          />
        </div>
      </header>

      {/* Mobile Drawer Navigation Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Navigation Sidebar: Desktop fixed & Mobile slide-over */}
      <aside
        id="app-sidebar"
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-stone-200/80 p-3 overflow-y-auto transition-transform duration-200 lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-item-${item.id}`}
                type="button"
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:bg-stone-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-stone-100 text-slate-600'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Motivational Footer in Sidebar */}
        <div className="mt-8 p-3.5 rounded-xl bg-gradient-to-br from-emerald-50/70 to-teal-50/50 border border-emerald-100/80 text-xs text-slate-600">
          <p className="font-semibold text-emerald-950 flex items-center gap-1.5">
            <span>✨</span> Serenidade
          </p>
          <p className="mt-1 text-[11px] text-slate-500 leading-relaxed italic">
            “Eu sei exatamente para onde meu dinheiro está indo.”
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar for quick access to most used tabs */}
      <nav id="mobile-bottom-nav" className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          type="button"
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition cursor-pointer ${
            activeTab === 'dashboard' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          Dashboard
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('transactions')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition cursor-pointer ${
            activeTab === 'transactions' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <ArrowLeftRight className="w-5 h-5 mb-0.5" />
          Movimentos
        </button>

        <button
          type="button"
          onClick={() => onOpenNewTransaction()}
          className="flex flex-col items-center -mt-5 bg-emerald-600 hover:bg-emerald-700 text-white w-11 h-11 rounded-full items-center justify-center shadow-md active:scale-95 transition cursor-pointer"
          title="Nova movimentação"
        >
          <Plus className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('bills_to_pay')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition relative cursor-pointer ${
            activeTab === 'bills_to_pay' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Clock className="w-5 h-5 mb-0.5" />
          A pagar
          {pendingCount > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-sky-500" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium text-slate-500 cursor-pointer"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          Mais
        </button>
      </nav>
    </>
  );
}
