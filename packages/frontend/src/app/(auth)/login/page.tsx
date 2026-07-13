'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.login(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ice overflow-hidden relative flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
      </div>
      <div className="w-full max-w-sm relative stagger-children">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald to-forest-light shadow-lg shadow-emerald/20 mb-4">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-forest tracking-tight">Connexion</h1>
          <p className="text-forest/50 text-sm mt-1.5">Connectez-vous à votre tableau de bord</p>
        </div>
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-7 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {error && <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100"><p className="text-sm font-medium text-red-700">{error}</p></div>}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-forest/70 mb-1.5">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="vendeur@exemple.com" required />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-forest/70 mb-1.5">Mot de passe</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" required />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full mt-6 py-3 px-5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald to-emerald-light hover:from-emerald-light hover:to-emerald shadow-lg shadow-emerald/20 hover:shadow-xl hover:shadow-emerald/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connexion...
              </span>
            ) : 'Se connecter'}
          </button>
          <p className="text-center mt-5 text-sm text-forest/40">
            Pas encore de compte ?{' '}
            <a href="/register" className="text-emerald font-medium hover:text-emerald-light transition-colors">Créer un compte</a>
          </p>
        </form>
      </div>
    </div>
  );
}