import React, { useState } from 'react';
import { Settings, KeyRound, Tag, Download, Upload, RotateCcw, CheckCircle2, AlertCircle, Plus, Trash2, FileSpreadsheet } from 'lucide-react';
import { Category, Expense, Income, Debt, Goal, FixedExpenseTemplate } from '../types.ts';
import { supabase } from '../lib/supabase.ts';
import { DEFAULT_EXPENSE_CATEGORIES } from '../utils/categories.ts';

interface SettingsViewProps {
  categories: Category[];
  onSaveCategories: (cats: Category[]) => void;
  allExpenses: Expense[];
  allIncomes: Income[];
  debts: Debt[];
  goals: Goal[];
  fixedTemplates: FixedExpenseTemplate[];
  onRestoreAllData: (data: any) => void;
}

export function SettingsView({ categories, onSaveCategories, allExpenses, allIncomes, debts, goals, fixedTemplates, onRestoreAllData }: SettingsViewProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366f1');
  const [backupMessage, setBackupMessage] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);
    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'A nova senha deve ter no mínimo 6 caracteres.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'A nova senha e a confirmação não coincidem.' });
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      setPasswordStatus({ type: 'error', message: 'Não foi possível identificar sua conta.' });
      return;
    }
    const { error: verifyError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword });
    if (verifyError) {
      setPasswordStatus({ type: 'error', message: 'A senha atual informada está incorreta.' });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordStatus({ type: 'error', message: error.message });
      return;
    }
    setPasswordStatus({ type: 'success', message: 'Senha atualizada com segurança no Supabase!' });
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    if (categories.some(c => c.name.toLowerCase() === newCatName.trim().toLowerCase())) {
      alert('Esta categoria já existe!'); return;
    }
    onSaveCategories([...categories, { id: `cat-${Date.now()}`, name: newCatName.trim(), color: newCatColor, icon: 'Tag' }]);
    setNewCatName('');
  };

  const handleDeleteCategory = (catId: string) => {
    if (categories.length <= 1) { alert('Você deve manter pelo menos uma categoria.'); return; }
    onSaveCategories(categories.filter(c => c.id !== catId));
  };

  const handleExportJSON = () => {
    const backupData = { version: '1.0', exportedAt: new Date().toISOString(), expenses: allExpenses, incomes: allIncomes, debts, goals, fixedTemplates, categories };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `meu-controle-financeiro-backup-${new Date().toISOString().split('T')[0]}.json`; link.click(); URL.revokeObjectURL(url);
    setBackupMessage('Backup JSON baixado com sucesso!'); setTimeout(() => setBackupMessage(null), 3000);
  };

  const handleExportCSV = () => {
    let csv = 'Tipo;Descrição;Categoria;Valor;Vencimento/Data;Status;Forma de Pagamento\n';
    allIncomes.forEach(inc => { csv += `Receita;"${inc.description}";"${inc.category}";${inc.amount.toFixed(2)};${inc.date};Recebido;-\n`; });
    allExpenses.forEach(exp => { csv += `Despesa;"${exp.name}";"${exp.category}";${exp.amount.toFixed(2)};${exp.dueDate};${exp.status};"${exp.paymentMethod}"\n`; });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.csv`; link.click(); URL.revokeObjectURL(url);
    setBackupMessage('Relatório CSV exportado com sucesso!'); setTimeout(() => setBackupMessage(null), 3000);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.expenses && json.incomes) { onRestoreAllData(json); setBackupMessage('Dados restaurados com sucesso do backup!'); setTimeout(() => setBackupMessage(null), 3000); }
        else alert('Arquivo de backup inválido.');
      } catch { alert('Erro ao processar o arquivo JSON.'); }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    if (confirm('Deseja limpar seus dados financeiros e recomeçar? Esta ação substitui os registros atuais.')) {
      onRestoreAllData({ expenses: [], incomes: [], debts: [], goals: [], fixedTemplates: [], categories: DEFAULT_EXPENSE_CATEGORIES });
      setBackupMessage('Dados limpos. O Brotinho está pronto para um novo começo.');
    }
  };

  return <div id="settings-view" className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
    <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs"><div className="flex items-center gap-2"><Settings className="w-4 h-4"/><div><h2 className="font-display font-bold text-slate-900 text-lg sm:text-xl">Configurações & Segurança</h2><p className="text-xs text-slate-500">Segurança da conta, categorias personalizadas e backup de dados</p></div></div></div>
    {backupMessage && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/><span>{backupMessage}</span></div>}
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-2xs"><div className="flex items-center gap-2 mb-1"><KeyRound className="w-4 h-4 text-emerald-700"/><h3 className="font-display font-semibold text-slate-900 text-base">Alterar Senha de Acesso</h3></div><p className="text-xs text-slate-500 mb-4">Mantenha sua proteção pessoal sempre atualizada</p>
      {passwordStatus && <div className={`p-3 rounded-xl text-xs font-semibold mb-4 flex items-center gap-2 ${passwordStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>{passwordStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4"/> : <AlertCircle className="w-4 h-4"/>}<span>{passwordStatus.message}</span></div>}
      <form onSubmit={handlePasswordChange} className="space-y-3 max-w-md"><input type="password" required placeholder="Senha atual" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"/><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><input type="password" required placeholder="Nova senha (mínimo 6 caracteres)" value={newPassword} onChange={e=>setNewPassword(e.target.value)} className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"/><input type="password" required placeholder="Confirmar nova senha" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"/></div><button type="submit" className="px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-xl">Atualizar Senha</button></form>
    </div>
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-2xs"><div className="flex items-center gap-2 mb-1"><Tag className="w-4 h-4 text-emerald-700"/><h3 className="font-display font-semibold text-slate-900 text-base">Categorias de Gastos</h3></div><div className="flex flex-wrap gap-2 mb-4">{categories.map(cat=><div key={cat.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 text-xs"><span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:cat.color}}/><span>{cat.name}</span><button onClick={()=>handleDeleteCategory(cat.id)}><Trash2 className="w-3 h-3"/></button></div>)}</div><form onSubmit={handleAddCategory} className="flex flex-wrap items-center gap-2"><input type="text" placeholder="Nova categoria" value={newCatName} onChange={e=>setNewCatName(e.target.value)} className="px-3 py-2 text-xs border rounded-xl"/><input type="color" value={newCatColor} onChange={e=>setNewCatColor(e.target.value)} className="w-9 h-9"/><button type="submit" className="flex items-center gap-1 px-3 py-2 bg-stone-800 text-white text-xs rounded-xl"><Plus className="w-3.5 h-3.5"/>Adicionar Categoria</button></form></div>
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-2xs"><div className="flex items-center gap-2 mb-4"><Download className="w-4 h-4 text-emerald-700"/><h3 className="font-display font-semibold text-slate-900 text-base">Backup, Importação e Exportação</h3></div><div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><button type="button" onClick={handleExportJSON} className="p-4 rounded-xl border text-left"><Download className="w-4 h-4"/> Exportar Backup JSON</button><label className="p-4 rounded-xl border text-left cursor-pointer"><Upload className="w-4 h-4"/> Restaurar Backup JSON<input type="file" accept=".json" onChange={handleImportJSON} className="hidden"/></label><button type="button" onClick={handleExportCSV} className="p-4 rounded-xl border text-left"><FileSpreadsheet className="w-4 h-4"/> Exportar CSV</button></div><div className="mt-6 pt-4 border-t"><button type="button" onClick={handleResetDemo} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl"><RotateCcw className="w-3.5 h-3.5"/>Limpar dados</button></div></div>
  </div>;
}
