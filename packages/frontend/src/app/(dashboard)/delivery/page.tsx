'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  zones: string[];
  isAvailable: boolean;
  currentLoad: number;
  maxLoad: number;
  successRate: number;
  performanceScore: number;
}

interface Delivery {
  id: string;
  status: string;
  deliveryAddress: string;
  createdAt: string;
  deliveryPerson: DeliveryPerson | null;
  order: { orderNumber: string; customer: { name: string; phone: string } };
}

export default function DeliveryPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [persons, setPersons] = useState<DeliveryPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'deliveries' | 'persons'>('deliveries');
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [newPerson, setNewPerson] = useState({ name: '', phone: '', zones: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [delRes, perRes] = await Promise.all([
        api.getDeliveries({ limit: 50 }),
        api.getDeliveryPersons(),
      ]);
      setDeliveries(delRes.data as Delivery[]);
      setPersons(perRes.data as DeliveryPerson[]);
    } catch (error) {
      console.error('Erreur chargement livraisons:', error);
    } finally { setLoading(false); }
  };

  const addPerson = async () => {
    try {
      await api.addDeliveryPerson({
        name: newPerson.name, phone: newPerson.phone,
        zones: newPerson.zones.split(',').map(z => z.trim()),
      });
      setShowAddPerson(false);
      setNewPerson({ name: '', phone: '', zones: '' });
      loadData();
    } catch (error) { console.error('Erreur ajout livreur:', error); }
  };

  const deletePerson = async (id: string) => {
    if (!confirm('Supprimer ce livreur ?')) return;
    try { await api.deleteDeliveryPerson(id); loadData(); }
    catch (error) { console.error('Erreur suppression:', error); }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      ASSIGNED: 'status-badge bg-blue-50 text-blue-700',
      PICKED_UP: 'status-badge bg-indigo-50 text-indigo-700',
      IN_TRANSIT: 'status-badge bg-amber-50 text-amber-700',
      DELIVERED: 'status-badge status-badge-delivered',
      FAILED: 'status-badge status-badge-cancelled',
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
        <h1 className="text-2xl font-bold text-forest tracking-tight">🚚 Livraisons</h1>
        <p className="text-forest/50 text-sm mt-1">Suivez et gérez vos livraisons</p>
      </div>

      <div className="flex gap-2 animate-fade-in">
        {(['deliveries', 'persons'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === tab ? 'bg-emerald text-white shadow-md' : 'bg-white text-forest/50 border border-sage/20 hover:border-emerald/30'
            }`}>
            {tab === 'deliveries' ? 'Livraisons en cours' : 'Livreurs partenaires'}
          </button>
        ))}
      </div>

      {activeTab === 'deliveries' ? (
        <div className="card p-0 overflow-hidden animate-fade-in">
          {deliveries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🚚</div>
              <p className="text-forest/50 font-medium">Aucune livraison en cours</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-forest/40 uppercase tracking-wider">Commande</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-forest/40 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-forest/40 uppercase tracking-wider">Livreur</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-forest/40 uppercase tracking-wider">Adresse</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-forest/40 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-forest/40 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage/10">
                  {deliveries.map((d) => (
                    <tr key={d.id} className="hover:bg-sage-light/20 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-forest">#{d.order.orderNumber}</td>
                      <td className="px-6 py-4"><p className="text-sm text-forest/80">{d.order.customer.name}</p><p className="text-xs text-forest/40">{d.order.customer.phone}</p></td>
                      <td className="px-6 py-4 text-sm text-forest/70">{d.deliveryPerson?.name || '—'}</td>
                      <td className="px-6 py-4 text-sm text-forest/50 max-w-[200px] truncate">{d.deliveryAddress}</td>
                      <td className="px-6 py-4"><span className={statusBadge(d.status)}>{d.status}</span></td>
                      <td className="px-6 py-4 text-sm text-forest/40">{new Date(d.createdAt).toLocaleDateString('fr-FR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-end">
            <button onClick={() => setShowAddPerson(true)} className="btn-primary">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Ajouter un livreur
            </button>
          </div>
          {showAddPerson && (
            <div className="card space-y-4">
              <h3 className="font-semibold text-forest">Nouveau livreur</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input placeholder="Nom complet" value={newPerson.name} onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })} className="input" />
                <input placeholder="Téléphone" value={newPerson.phone} onChange={(e) => setNewPerson({ ...newPerson, phone: e.target.value })} className="input" />
                <input placeholder="Zones (séparées par des virgules)" value={newPerson.zones} onChange={(e) => setNewPerson({ ...newPerson, zones: e.target.value })} className="input" />
              </div>
              <div className="flex gap-2">
                <button onClick={addPerson} className="btn-primary">Ajouter</button>
                <button onClick={() => setShowAddPerson(false)} className="btn-ghost">Annuler</button>
              </div>
            </div>
          )}
          {persons.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-3">🚚</div>
              <p className="text-forest/50 font-medium">Aucun livreur partenaire</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {persons.map((p) => (
                <div key={p.id} className="card group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald/10 to-sage-light/50 flex items-center justify-center text-lg font-bold text-emerald">{p.name.charAt(0).toUpperCase()}</div>
                      <div><p className="font-semibold text-forest">{p.name}</p><p className="text-xs text-forest/40">{p.phone}</p></div>
                    </div>
                    <button onClick={() => deletePerson(p.id)} className="text-forest/20 hover:text-red-500 transition-colors p-1">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {p.zones.map((zone, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-sage-light/50 text-xs font-medium text-emerald">{zone}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${p.isAvailable ? 'text-emerald' : 'text-red-500'}`}>{p.isAvailable ? 'Disponible' : 'Indisponible'}</span>
                    <span className="text-forest/40">{p.currentLoad}/{p.maxLoad}</span>
                    <span className="text-forest/40">{p.successRate}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}