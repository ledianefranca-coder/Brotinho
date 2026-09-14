import React, { useState } from 'react';
import { Eye, EyeOff, Lock, ShieldCheck, ArrowRight, KeyRound, CheckCircle2, RotateCcw, X } from 'lucide-react';
import { verifyPassword, hashPassword } from '../utils/crypto.ts';
import { getStoredPasswordHash, setStoredPasswordHash, setAuthenticated, DEFAULT_PASSWORD_HASH } from '../utils/storage.ts';
import { MascotSvg } from '../components/Mascot.tsx';
import { MascotStatus } from '../types.ts';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password & reset modal states
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [newResetPassword, setNewResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetStatus, setResetStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const storedHash = getStoredPasswordHash();
      const isValid = await verifyPassword(password, storedHash);

      if (isValid) {
        setAuthenticated(true);
        onLoginSuccess();
      } else {
        setErrorMsg('Senha incorreta. Verifique e tente novamente.');
      }
    } catch {
      setErrorMsg('Erro ao processar validação de segurança.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetToDefault = () => {
    setStoredPasswordHash(DEFAULT_PASSWORD_HASH);
    setPassword('123456');
    setErrorMsg('');
    setResetStatus({
      type: 'success',
      message: 'Senha restaurada para o padrão inicial (123456). Você já pode entrar!'
    });
  };

  const handleDefineNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus(null);

    if (newResetPassword.length < 4) {
      setResetStatus({ type: 'error', message: 'A nova senha deve ter no mínimo 4 caracteres.' });
      return;
    }

    if (newResetPassword !== confirmResetPassword) {
      setResetStatus({ type: 'error', message: 'As senhas digitadas não coincidem.' });
      return;
    }

    try {
      const newHash = await hashPassword(newResetPassword);
      setStoredPasswordHash(newHash);
      setPassword(newResetPassword);
      setErrorMsg('');
      setResetStatus({
        type: 'success',
        message: 'Nova senha cadastrada com sucesso! Preenchemos o campo para você entrar.'
      });
      setTimeout(() => {
        setIsResetModalOpen(false);
        setResetStatus(null);
        setNewResetPassword('');
        setConfirmResetPassword('');
      }, 1500);
    } catch {
      setResetStatus({ type: 'error', message: 'Erro ao cadastrar a nova senha.' });
    }
  };

  return (
    <div id="login-view-container" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50/80 via-amber-50/40 to-orange-100/40 p-4">
      <div className="w-full max-w-md">
        
        {/* Main Card */}
        <div className="bg-sky-50/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-sky-200/80 shadow-xl shadow-sky-900/5">
          
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-100 to-teal-50 border border-emerald-200/90 p-2 shadow-md shadow-emerald-900/5 mb-3.5">
              <MascotSvg 
                status={{ mood: 'all_good', title: 'Olá! Bem-vindo(a) de volta.', emoji: '🌱', message: 'Tudo pronto para cuidar das suas finanças!' }} 
                className="w-16 h-16 drop-shadow-sm" 
              />
            </div>
            
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Meu Controle Financeiro
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
              “Eu sei exatamente para onde meu dinheiro está indo.”
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label 
                  htmlFor="login-password-input" 
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Senha de Acesso Pessoal
                </label>
                
                {/* Esqueci minha senha link */}
                <button
                  id="btn-forgot-password"
                  type="button"
                  onClick={() => {
                    setResetStatus(null);
                    setIsResetModalOpen(true);
                  }}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline transition cursor-pointer"
                >
                  Esqueci a senha
                </button>
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  placeholder="Digite sua senha..."
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  className={`w-full pl-10 pr-11 py-3 text-sm bg-white/90 border rounded-2xl outline-none transition ${
                    errorMsg 
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-400/20 bg-rose-50/30' 
                      : 'border-sky-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400'
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {errorMsg && (
                <p id="login-error-message" className="text-xs font-medium text-rose-600 mt-2 flex items-center gap-1.5 animate-in fade-in duration-200">
                  <span>⚠️</span> {errorMsg}
                </p>
              )}
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={isLoading || !password}
              className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-98 disabled:opacity-50 disabled:pointer-events-none text-white font-medium text-sm rounded-2xl shadow-md shadow-emerald-700/20 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{isLoading ? 'Verificando...' : 'Entrar no Painel'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Security note & Adjust Password */}
          <div className="mt-6 pt-5 border-t border-sky-100 flex flex-col items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Sessão protegida por criptografia local</span>
            </div>
            
            <button
              id="btn-open-adjust-password"
              type="button"
              onClick={() => {
                setResetStatus(null);
                setIsResetModalOpen(true);
              }}
              className="text-xs font-semibold text-slate-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer transition hover:underline"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Ajustar senha
            </button>
          </div>
        </div>

        {/* Security / Peaceful note */}
        <p className="text-center text-xs text-slate-400 mt-4">
          Seus dados e registros ficam guardados no seu navegador com total privacidade.
        </p>
      </div>

      {/* Modal: Ajustar Senha / Esqueci Senha */}
      {isResetModalOpen && (
        <div 
          id="modal-reset-password"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-stone-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-lg">Ajustar ou Recuperar Senha</h3>
                  <p className="text-xs text-slate-500">Defina uma nova senha ou restaure a padrão</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-stone-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetStatus && (
              <div className={`p-3 rounded-2xl text-xs flex items-start gap-2 ${
                resetStatus.type === 'success' 
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}>
                {resetStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <span className="text-sm shrink-0">⚠️</span>
                )}
                <span>{resetStatus.message}</span>
              </div>
            )}

            {/* Opção 1: Cadastrar nova senha diretamente */}
            <form onSubmit={handleDefineNewPassword} className="space-y-3.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Criar Nova Senha</h4>
              
              <div className="space-y-2.5">
                <div className="relative">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    placeholder="Digite a nova senha (mínimo 4 dígitos)..."
                    value={newResetPassword}
                    onChange={e => setNewResetPassword(e.target.value)}
                    className="w-full px-3.5 pr-10 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700"
                  >
                    {showResetPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <input
                  type={showResetPassword ? 'text' : 'password'}
                  required
                  placeholder="Confirme a nova senha..."
                  value={confirmResetPassword}
                  onChange={e => setConfirmResetPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Salvar e Aplicar Nova Senha
              </button>
            </form>

            {/* Divisória */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-slate-400">ou</span>
              </div>
            </div>

            {/* Opção 2: Restaurar senha padrão 123456 */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-3">
              <div>
                <span className="font-semibold text-slate-800 text-xs block">Restaurar para padrão</span>
                <span className="text-[11px] text-slate-500 block">Volta a senha para <strong className="text-slate-700">123456</strong> mantendo todos os seus dados</span>
              </div>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-3 py-1.5 bg-white hover:bg-stone-100 border border-stone-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer flex items-center gap-1 shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                Restaurar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
