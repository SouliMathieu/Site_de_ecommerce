'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  customer: { name: string; phone: string };
  createdAt: string;
}

const statusFilters = [
  { value: '', label: 'Toutes' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'CONFIRMED', label: 'Confirmée' },
  { value: 'PREPARING', label: 'Préparation' },
  { value: 'DELIVERED', label: 'Livrée' },
  { value: 'CANCELLED', label: 'Annulée' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { loadOrders(); }, [statusFilter]);

  const loadOrders = async () => {
    try {
      const params: Record<string, string | number> = { limit: 50 };
      if (statusFilter) params.status = statusFilter;
      const response = await api.getOrders(params);
      setOrders(response.data as Order[]);
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING: 'status-badge status-badge-pending',
      CONFIRMED: 'status-badge status-badge-confirmed',
      PREPARING: 'status-badge bg-indigo-50 text-indigo-700',
      DELIVERED: 'status-badge status-badge-delivered',
      CANCELLED: 'status-badge status-badge-cancelled',
      FAILED: 'status-badge bg-red-50 text-red-600',
    };
    return map[status] || 'status-badge bg-gray-50 text-gray-600';
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
        <h1 className="text-2xl font-bold text-forest tracking-tight">📋 Commandes</h1>
        <p className="text-forest/50 text-sm mt-1">Suivez et gérez vos commandes</p>
      </div>

      <div className="flex gap-2 flex-wrap animate-fade-in">
        {statusFilters.map((f) => (
          <button key={f.value} onClick={() => setStatusFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              statusFilter === f.value
                ? 'bg-emerald text-white shadow-md'
                : 'bg-white text-forest/50 border border-sage/20 hover:border-emerald/30 hover:text-forest'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="card p-0 overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-forest/40 uppercase tracking-wider">N° Commande</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-forest/40 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-forest/40 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-forest/40 uppercase tracking-wider">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-forest/40 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-forest/40 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage/10">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-sage-light/20 transition-colors duration-150">
                  <td className="px-6 py-4 text-sm font-semibold text-forest">#{order.orderNumber}</td>
                  <td className="px-6 py-4 text-sm text-forest/80">{order.customer.name}</td>
                  <td className="px-6 py-4 text-sm text-forest/50">{order.customer.phone}</td>
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