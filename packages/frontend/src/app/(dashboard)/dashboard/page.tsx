'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface IDashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  conversionRate: number;
  averageOrderValue: number;
  topProducts: Array<{ id: string; name: string; salesCount: number; price: number }>;
  ordersByStatus: Record<string, number>;
  revenueByDay: Array<{ date: string; amount: number }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    customer: { name: string };
    createdAt: string;
  }>;
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: string }) {
  return (
    <div className="card card-glow">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-forest/40 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-forest tracking-tight">
            {typeof value === 'number' && (title.includes('Revenu') || title.includes('Panier'))
              ? `${value.toLocaleString()} FCFA`
              : typeof value === 'number' && title.includes('Taux')
                ? `${value}%`
                : value}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald/10 to-sage-light/50 flex items-center justify-center text-xl shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const response = await api.getDashboardStats();
      setStats(response.data as unknown as IDashboardStats);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
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

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-2xl">⚠️</div>
        <p className="text-forest/50 font-medium">Impossible de charger les statistiques</p>
        <button onClick={loadStats} className="btn-primary">Réessayer</button>
      </div>
    );
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING: 'status-badge status-badge-pending',
      CONFIRMED: 'status-badge status-badge-confirmed',
      DELIVERED: 'status-badge status-badge-delivered',
      CANCELLED: 'status-badge status-badge-cancelled',
    };
    return map[status] || 'status-badge bg-gray-50 text-gray-600';
  };

  return (
    <div className="space-y-6 stagger-children">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-forest tracking-tight">Tableau de bord</h1>
        <p className="text-forest/50 text-sm mt-1">Vue d'ensemble de votre activité</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Produits" value={stats.totalProducts} icon="📦" />
        <StatCard title="Commandes" value={stats.totalOrders} icon="📋" />
        <StatCard title="Revenu total" value={stats.totalRevenue} icon="💰" />
        <StatCard title="Clients" value={stats.totalCustomers} icon="👥" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-xs font-semibold text-forest/40 uppercase tracking-wider mb-1">Taux de conversion</p>
          <p className="text-2xl font-bold text-forest tracking-tight">{stats.conversionRate}%</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-forest/40 uppercase tracking-wider mb-1">Panier moyen</p>
          <p className="text-2xl font-bold text-forest tracking-tight">{stats.averageOrderValue.toLocaleString()} FCFA</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-forest/40 uppercase tracking-wider mb-3">Commandes par statut</p>
          <div className="space-y-2">
            {Object.entries(stats.ordersByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <span className={statusBadge(status)}>{status}</span>
                <span className="font-semibold text-forest">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-sage/10">
          <h2 className="text-sm font-bold text-forest tracking-tight">Top produits</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {stats.topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-gold/20 text-gold' :
                    index === 1 ? 'bg-gray-100 text-gray-400' :
                    index === 2 ? 'bg-amber-50 text-amber-600' :
                    'bg-forest/5 text-forest/30'
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-forest group-hover:text-emerald transition-colors">{product.name}</p>
                    <p className="text-xs text-forest/40">{product.salesCount} vendus</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-forest">{product.price.toLocaleString()} FCFA</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-sage/10">
          <h2 className="text-sm font-bold text-forest tracking-tight">Dernières commandes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-forest/40 uppercase tracking-wider">N°</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-forest/40 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-forest/40 uppercase tracking-wider">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-forest/40 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-forest/40 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage/10">
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-sage-light/20 transition-colors duration-150">
                  <td className="px-6 py-4 text-sm font-semibold text-forest">#{order.orderNumber}</td>
                  <td className="px-6 py-4 text-sm text-forest/70">{order.customer.name}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-forest">{order.totalAmount.toLocaleString()} FCFA</td>
                  <td className="px-6 py-4"><span className={statusBadge(order.status)}>{order.status}</span></td>
                  <td className="px-6 py-4 text-sm text-forest/40">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}