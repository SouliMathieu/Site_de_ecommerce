'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Customer {
  id: string;
  name: string;
  phone: string;
  city: string | null;
  district: string | null;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loadCustomers(); }, []);

  const loadCustomers = async () => {
    try {
      const res = await api.getCustomers({ search, limit: 50 });
      setCustomers(res.data as Customer[]);
    } catch (error) {
      console.error('Erreur chargement clients:', error);
    } finally {
      setLoading(false);
    }
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
    <div className="space-y-6 stagger-children">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-forest tracking-tight">👥 Clients</h1>
        <p className="text-forest/50 text-sm mt-1">Gérez votre carnet de clients</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
        <div className="card">
          <p className="text-xs font-semibold text-forest/40 uppercase tracking-wider">Total clients</p>
          <p className="text-2xl font-bold text-forest tracking-tight mt-1">{customers.length}</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-forest/40 uppercase tracking-wider">Avec commandes</p>
          <p className="text-2xl font-bold text-forest tracking-tight mt-1">{customers.filter(c => c.totalOrders > 0).length}</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-forest/40 uppercase tracking-wider">Villes couvertes</p>
          <p className="text-2xl font-bold text-forest tracking-tight mt-1">{new Set(customers.map(c => c.city).filter(Boolean)).size}</p>
        </div>
      </div>

      <div className="flex gap-3 animate-fade-in">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-forest/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Rechercher par nom, téléphone ou ville..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadCustomers()}
            className="input pl-10" />
        </div>
        <button onClick={loadCustomers} className="btn-secondary">Rechercher</button>
      </div>

      <div className="space-y-3 animate-fade-in">
        {customers.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-forest/50 font-medium">Aucun client trouvé</p>
            <p className="text-forest/30 text-sm mt-1">Les clients apparaîtront après les premières commandes</p>
          </div>
        ) : (
          customers.map((customer, i) => (
            <div key={customer.id} className="card cursor-pointer hover:shadow-elevated transition-all duration-200 group"
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => router.push(`/customers/${customer.id}`)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald/10 to-sage-light/50 flex items-center justify-center text-lg font-bold text-emerald shrink-0">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-forest group-hover:text-emerald transition-colors">{customer.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-forest/40 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {customer.phone}
                      </span>
                      {customer.city && (
                        <span className="text-xs text-forest/40 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {customer.city}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-forest">{customer.totalSpent.toLocaleString()} FCFA</p>
                  <p className="text-xs text-forest/40">{customer.totalOrders} commande{customer.totalOrders > 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}