import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/authContext';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('admin@trakz.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid login credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <img
            src="/images/trackz_logo.png"
            alt="TRAKZ Logo"
            className="mx-auto h-16 w-auto object-contain drop-shadow-md"
          />
          <div className="flex items-center justify-center gap-2 pt-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">TRAKZ</h1>
            <span className="px-2 py-0.5 text-xs font-black uppercase bg-sky-100 text-[#0786C5] dark:bg-sky-950 dark:text-sky-300 rounded border border-sky-200 dark:border-sky-800">
              PRO POS
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Merchant Store POS Terminal Gateway
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800 animate-in fade-in">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Merchant User Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@trakz.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0786C5]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0786C5]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-xs font-extrabold text-white bg-[#0786C5] hover:bg-sky-600 shadow-md transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating Terminal...' : 'Sign In To Store POS'}</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
          <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#0786C5]" />
            Merchant POS Credentials:
          </p>
          <p>Store Admin: <code className="text-[#0786C5] font-mono">admin@trakz.com</code> / <code className="text-[#0786C5] font-mono">admin123</code></p>
          <p>Cashier User: <code className="text-[#0786C5] font-mono">cashier@trakz.com</code> / <code className="text-[#0786C5] font-mono">admin123</code></p>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-slate-400 space-y-0.5 pt-2">
          <p>TrakZ Software Dev Corp</p>
          <p>SEC: 2026080265253-03 | BIR TIN: 011-019-610</p>
        </div>
      </div>
    </div>
  );
};
