import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Loader2, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(email, password);
      nav('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Layered gradient background */}
      <div className="absolute inset-0 bg-[#0D0D0D]" />
      <div className="absolute inset-0 bg-gradient-to-br from-brand-copper/30 via-transparent to-brand-gold/20" />
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-brand-copper/40 rounded-full blur-[120px] animate-glow-pulse" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-brand-gold/30 rounded-full blur-[120px] animate-glow-pulse" style={{ animationDelay: '1.5s' }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <div className="relative z-10 w-full max-w-sm animate-fade-up">
        {/* Logo block */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-brand-copper/50 rounded-3xl blur-2xl animate-glow-pulse" />
            <img
              src="/logo.png"
              alt="The Grease Trappers"
              className="relative h-20 w-auto drop-shadow-2xl"
            />
          </div>
          <div className="flex items-center gap-1.5 text-brand-gold">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-xs uppercase tracking-[0.2em] font-semibold">Field Crew</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Glass card */}
        <div className="glass-strong rounded-3xl p-7 shadow-2xl">
          <h1 className="text-2xl font-bold text-white text-center mb-1">Welcome back</h1>
          <p className="text-sm text-gray-400 text-center mb-6">Sign in to clock in & view jobs</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-11 pr-3 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-copper focus:border-transparent transition-all"
                  placeholder="you@greasetrapers.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-copper focus:border-transparent transition-all"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm animate-fade-up">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 gradient-copper group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <div className="relative px-6 py-3.5 flex items-center justify-center gap-2 text-white">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3 h-3" />
          Secure field crew portal
        </p>
      </div>
    </div>
  );
}