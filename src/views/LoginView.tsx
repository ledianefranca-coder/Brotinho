import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, UserPlus } from 'lucide-react';
import { MascotSvg } from '../components/Mascot';
import { supabase } from '../lib/supabase';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState(() => localStorage.getItem('brotinho_login_email') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        localStorage.setItem('brotinho_login_email', email);
        if (data.session) {
          onLoginSuccess();
        } else {
          setInfoMsg('Conta criada. Confira seu e-mail para confirmar o cadastro e depois entre normalmente.');
          setMode('login');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        localStorage.setItem('brotinho_login_email', email);
        onLoginSuccess();
      }
    } catch (error: any) {
      setErrorMsg(error?.message || 'Não foi possível acessar sua conta.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setErrorMsg('');
    setInfoMsg('');
    if (!email) {
      setErrorMsg('Digite seu e-mail primeiro.');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) setErrorMsg(error.message);
    else setInfoMsg('Enviamos um link de recuperação para o seu e-mail.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50/80 via-amber-50/40 to-orange-100/40 p-4">
      <div className="w-full max-w-md">
        <div className="bg-sky-50/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-sky-200/80 shadow-xl shadow-sky-900/5">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-100 to-teal-50 border border-emerald-200/90 p-2 shadow-md shadow-emerald-900/5 mb-3.5">
              <MascotSvg status={{ mood: 'all_good', title: 'Olá!', emoji: '🌱', message: 'Tudo pronto para cuidar das suas finanças!' }} className="w-16 h-16 drop-shadow-sm" />
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">Meu Controle Financeiro</h1>
            <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">“Eu sei exatamente para onde meu dinheiro está indo.”</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full pl-10 pr-4 py-3 text-sm bg-white/90 border border-sky-200 rounded-2xl outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Senha</label>
                {mode === 'login' && <button type="button" onClick={handleForgotPassword} className="text-xs font-semibold text-emerald-700 hover:underline">Esqueci a senha</button>}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input type={showPassword ? 'text' : 'password'} required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="Digite sua senha" className="w-full pl-10 pr-11 py-3 text-sm bg-white/90 border border-sky-200 rounded-2xl outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && <p className="text-xs font-medium text-rose-600">⚠️ {errorMsg}</p>}
            {infoMsg && <p className="text-xs font-medium text-emerald-700">✓ {infoMsg}</p>}

            <button type="submit" disabled={isLoading} className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-medium text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2">
              <span>{isLoading ? 'Aguarde...' : mode === 'login' ? 'Entrar no Painel' : 'Criar minha conta'}</span>
              {mode === 'login' ? <ArrowRight className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErrorMsg(''); setInfoMsg(''); }} className="text-xs font-semibold text-emerald-700 hover:underline">
              {mode === 'login' ? 'Primeiro acesso? Criar conta' : 'Já tenho conta? Entrar'}
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-sky-100 flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Login protegido pelo Supabase Auth</span>
          </div>
        </div>
        <p className="text-center text-xs text-slate-400 mt-4">Seus dados financeiros ficam vinculados somente à sua conta.</p>
      </div>
    </div>
  );
}
