'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = api.getToken();
    if (token) {
      router.push('/dashboard');
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ice">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-emerald border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-forest/40 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ice overflow-hidden relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md stagger-children">
          {/* Logo / Brand */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald to-forest-light shadow-lg shadow-emerald/20 mb-5">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-forest tracking-tight">
              Plateforme de Vente
            </h1>
            <p className="text-forest/50 mt-2 text-sm font-medium tracking-wide uppercase">
              Social Commerce · WhatsApp · Logistique
            </p>
          </div>

          {/* Main card */}
          <div className="glass-card rounded-2xl p-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3 px-5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald to-emerald-light hover:from-emerald-light hover:to-emerald shadow-lg shadow-emerald/20 hover:shadow-xl hover:shadow-emerald/25 transition-all duration-200 active:scale-[0.98]"
              >
                Se connecter
              </button>
              <button
                onClick={() => router.push('/register')}
                className="w-full py-3 px-5 rounded-xl font-semibold text-sm text-emerald bg-white border-2 border-emerald/20 hover:border-emerald/40 hover:bg-emerald/5 transition-all duration-200 active:scale-[0.98]"
              >
                Créer un compte
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center mt-8 text-xs text-forest/30 font-medium animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Gérez votre boutique, vos commandes et vos livraisons
          </p>
        </div>
      </div>
    </div>
  );
}