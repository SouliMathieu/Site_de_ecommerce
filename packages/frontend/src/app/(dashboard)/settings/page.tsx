'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Profile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  storeName?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', storeName: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getProfile().then((res) => {
      const p = res.data as Profile;
      setProfile(p);
      setForm({ name: p.name || '', phone: p.phone || '', storeName: p.storeName || '' });
    }).catch(() => router.push('/login'))
    .finally(() => setLoading(false));
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.updateProfile(form);
      setProfile(res.data as Profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-forest/40 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6 stagger-children">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-forest tracking-tight">⚙️ Paramètres</h1>
        <p className="text-forest/50 text-sm mt-1">Gérez votre profil et votre boutique</p>
      </div>

      <div className="card animate-fade-in">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-sage/10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald to-forest-light flex items-center justify-center text-2xl font-bold text-white shadow-lg shrink-0">
            {form.name.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-forest">{profile?.email}</h2>
            <p className="text-sm text-forest/40">Modifiez vos informations personnelles</p>
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-forest/70 mb-1.5">Nom complet</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="Votre nom" />
          </div>
          <div>
            <label className="block text-sm font-medium text-forest/70 mb-1.5">Téléphone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" placeholder="+221 77 000 00 00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-forest/70 mb-1.5">Nom de la boutique</label>
            <input value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} className="input" placeholder="Ma Boutique" />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
            </button>
            {saved && (
              <span className="text-sm font-medium text-emerald animate-fade-in flex items-center gap-1.5">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Modifications enregistrées
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="card animate-fade-in">
        <h2 className="text-lg font-bold text-forest mb-4">Sécurité</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-ice/50">
            <div>
              <p className="font-medium text-forest text-sm">Email</p>
              <p className="text-xs text-forest/40 mt-0.5">{profile?.email}</p>
            </div>
            <span className="status-badge status-badge-active">Vérifié</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-ice/50">
            <div>
              <p className="font-medium text-forest text-sm">Mot de passe</p>
              <p className="text-xs text-forest/40 mt-0.5">Dernière modification il y a 30 jours</p>
            </div>
            <button className="btn-ghost text-sm">Modifier</button>
          </div>
        </div>
      </div>

      <div className="card animate-fade-in">
        <h2 className="text-lg font-bold text-forest mb-4">API & Intégrations</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-xl bg-ice/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald/10 flex items-center justify-center"><span className="text-sm">💬</span></div>
              <div><p className="font-medium text-forest text-sm">WhatsApp Business</p><p className="text-xs text-forest/40">Connectez votre numéro WhatsApp</p></div>
            </div>
            <span className="text-xs text-forest/30 bg-forest/5 px-3 py-1 rounded-lg">Bientôt</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-ice/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald/10 flex items-center justify-center"><span className="text-sm">🎨</span></div>
              <div><p className="font-medium text-forest text-sm">Studio IA (Module A)</p><p className="text-xs text-forest/40">Génération de visuels et textes</p></div>
            </div>
            <span className="text-xs text-forest/30 bg-forest/5 px-3 py-1 rounded-lg">Phase 2</span>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-forest/30 animate-fade-in">
        <p>Plateforme de Vente Intelligente v1.0.0</p>
        <p className="mt-0.5">Social Commerce · WhatsApp Bot · Logistique Automatisée</p>
      </div>
    </div>
  );
}