import React, { useState } from 'react';
import { 
  Settings, 
  KeyRound, 
  Tag, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Trash2,
  FileSpreadsheet
} from 'lucide-react';
import { Category, Expense, Income, Debt, Goal, FixedExpenseTemplate } from '../types.ts';
import { hashPassword, verifyPassword } from '../utils/crypto.ts';
import { setStoredPasswordHash, getStoredPasswordHash, resetAllDataToDefault } from '../utils/storage.ts';

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

export function SettingsView({
  categories,
  onSaveCategories,
  allExpenses,
  allIncomes,
  debts,
  goals,
  fixedTemplates,
  onRestoreAllData,
}: SettingsViewProps) {
  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New category state
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366f1');

  // General messages
  const [backupMessage, setBackupMessage] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (newPassword.length < 4) {
      setPasswordStatus({ type: 'error', message: 'A nova senha deve ter no mínimo 4 caracteres.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'A nova senha e a confirmação não coincidem.' });
      return;
    }

    const isValid = await verifyPassword(currentPassword, getStoredPasswordHash());
    if (!isValid) {
      setPasswordStatus({ type: 'error', message: 'A senha atual informada está incorreta.' });
      return;
    }

    const newHash = await hashPassword(newPassword);
    setStoredPasswordHash(newHash);
    setPasswordStatus({ type: 'success', message: 'Senha atualizada com sucesso!' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    if (categories.some(c => c.name.toLowerCase() === newCatName.trim().toLowerCase())) {
      alert('Esta categoria já existe!');
      return;
    }

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      color: newCatColor,
      icon: 'Tag',
    };

    onSaveCategories([...categories, newCat]);
    setNewCatName('');
  };

  const handleDeleteCategory = (catId: string) => {
    if (categories.length <= 1) {
      alert('Você deve manter pelo menos uma categoria.');
      return;
    }
    onSaveCategories(categories.filter(c => c.id !== catId));
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      expenses: allExpenses,
      incomes: allIncomes,
      debts,
      goals,
      fixedTemplates,
      categories,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meu-controle-financeiro-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setBackupMessage('Backup JSON baixado com sucesso!');
    setTimeout(() => setBackupMessage(null), 3000);
  };

  // Export CSV
  const handleExportCSV = () => {
    let csv = 'Tipo;Descrição;Categoria;Valor;Vencimento/Data;Status;Forma de Pagamento\n';

    allIncomes.forEach(inc => {
      csv += `Receita;"${inc.description}";"${inc.category}";${inc.amount.toFixed(2)};${inc.date};Recebido;-\n`;
    });

    allExpenses.forEach(exp => {
      csv += `Despesa;"${exp.name}";"${exp.category}";${exp.amount.toFixed(2)};${exp.dueDate};${exp.status};"${exp.paymentMethod}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setBackupMessage('Relatório CSV exportado com sucesso!');
    setTimeout(() => setBackupMessage(null), 3000);
  };

  // Import JSON Backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.expenses && json.incomes) {
          onRestoreAllData(json);
          setBackupMessage('Dados restaurados com sucesso do backup!');
          setTimeout(() => setBackupMessage(null), 3000);
        } else {
          alert('Arquivo de backup inválido.');
        }
      } catch (err) {
        alert('Erro ao processar o arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    if (confirm('Deseja recarregar os dados de exemplo padrão? Todas as alterações manuais serão substituídas.')) {
      resetAllDataToDefault();
      window.location.reload();
    }
  };

  return (
    <div id="settings-view" className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
      
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-stone-100 text-slate-700 flex items-center justify-center">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-display font-bold text-slate-900 text-lg sm:text-xl">
              Configurações & Segurança
            </h2>
            <p className="text-xs text-slate-500">
              Segurança da conta, categorias personalizadas e backup de dados
            </p>
          </div>
        </div>
      </div>

      {backupMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{backupMessage}</span>
        </div>
      )}

      {/* Password Change Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-2xs">
        <div className="flex items-center gap-2 mb-1">
          <KeyRound className="w-4 h-4 text-emerald-700" />
          <h3 className="font-display font-semibold text-slate-900 text-base">
            Alterar Senha de Acesso
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Mantenha sua proteção pessoal sempre atualizada
        </p>

        {passwordStatus && (
          <div className={`p-3 rounded-xl text-xs font-semibold mb-4 flex items-center gap-2 ${
            passwordStatus.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {passwordStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{passwordStatus.message}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-3 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Senha Atual *
            </label>
            <input
              type="password"
              required
              placeholder="Digite a senha atual"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nova Senha *
              </label>
              <input
                type="password"
                required
                placeholder="Mínimo 4 caracteres"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirmar Nova Senha *
              </label>
              <input
                type="password"
                required
                placeholder="Repita a nova senha"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
          >
            Atualizar Senha
          </button>
        </form>
      </div>

      {/* Category Management */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-2xs">
        <div className="flex items-center gap-2 mb-1">
          <Tag className="w-4 h-4 text-emerald-700" />
          <h3 className="font-display font-semibold text-slate-900 text-base">
            Categorias de Gastos
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Personalize as categorias para classificar suas despesas e receitas
        </p>

        {/* Categories Chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map(cat => (
            <div
              key={cat.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-slate-700 bg-stone-50/50"
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
              <span>{cat.name}</span>
              <button
                type="button"
                onClick={() => handleDeleteCategory(cat.id)}
                className="ml-1 text-slate-400 hover:text-rose-600 transition"
                title="Excluir categoria"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Add new category form */}
        <form onSubmit={handleAddCategory} className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
          <input
            type="text"
            placeholder="Nome da nova categoria..."
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            className="px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none w-56"
          />
          <input
            type="color"
            value={newCatColor}
            onChange={e => setNewCatColor(e.target.value)}
            className="w-9 h-9 p-0.5 rounded-xl border border-stone-200 cursor-pointer"
            title="Escolha a cor da categoria"
          />
          <button
            type="submit"
            className="flex items-center gap-1 px-3 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar Categoria
          </button>
        </form>
      </div>

      {/* Backup & Export Data */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-2xs">
        <div className="flex items-center gap-2 mb-1">
          <Download className="w-4 h-4 text-emerald-700" />
          <h3 className="font-display font-semibold text-slate-900 text-base">
            Backup, Importação e Exportação
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Mantenha seus dados seguros e exporte seus lançamentos para planilhas
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <button
            type="button"
            onClick={handleExportJSON}
            className="p-4 rounded-xl border border-stone-200 hover:border-emerald-500 bg-stone-50/50 hover:bg-emerald-50/30 transition text-left cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center gap-2 text-emerald-700 mb-2">
              <Download className="w-4 h-4" />
              <span className="font-semibold text-xs text-slate-900">Exportar Backup JSON</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Salva cópia completa de despesas, receitas, metas e configurações no seu dispositivo.
            </p>
          </button>

          <label className="p-4 rounded-xl border border-stone-200 hover:border-emerald-500 bg-stone-50/50 hover:bg-emerald-50/30 transition text-left cursor-pointer flex flex-col justify-between">
            <div className="flex items-center gap-2 text-sky-700 mb-2">
              <Upload className="w-4 h-4" />
              <span className="font-semibold text-xs text-slate-900">Restaurar Backup JSON</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Carregue um arquivo JSON exportado anteriormente para recuperar suas informações.
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={handleExportCSV}
            className="p-4 rounded-xl border border-stone-200 hover:border-emerald-500 bg-stone-50/50 hover:bg-emerald-50/30 transition text-left cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center gap-2 text-purple-700 mb-2">
              <FileSpreadsheet className="w-4 h-4" />
              <span className="font-semibold text-xs text-slate-900">Exportar para Excel / CSV</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Gera planilha CSV compatível com Excel, Google Planilhas e Numbers.
            </p>
          </button>

        </div>

        {/* Reset Demo Data */}
        <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-slate-800">Recarregar Dados de Demonstração</h4>
            <p className="text-[11px] text-slate-400">Restaura os exemplos de contas e dívidas predefinidos.</p>
          </div>
          <button
            type="button"
            onClick={handleResetDemo}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Demo
          </button>
        </div>

      </div>

    </div>
  );
}
