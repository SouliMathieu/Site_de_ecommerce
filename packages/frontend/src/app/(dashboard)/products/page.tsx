'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: string;
  category: string;
  images: { url: string }[];
  createdAt: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      const response = await api.getProducts({ search, limit: 50 });
      setProducts(response.data as Product[]);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: 'status-badge status-badge-active',
      DRAFT: 'status-badge status-badge-draft',
      ARCHIVED: 'status-badge bg-red-50 text-red-600',
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
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-forest tracking-tight">📦 Produits</h1>
          <p className="text-forest/50 text-sm mt-1">Gérez votre catalogue</p>
        </div>
        <button onClick={() => router.push('/products/new')} className="btn-primary">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nouveau produit
        </button>
      </div>

      <div className="flex gap-3 animate-fade-in">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-forest/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Rechercher un produit..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadProducts()}
            className="input pl-10" />
        </div>
        <button onClick={loadProducts} className="btn-secondary">Rechercher</button>
      </div>

      <div className="card p-0 overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-forest/40 uppercase tracking-wider">Produit</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-forest/40 uppercase tracking-wider">Prix</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-forest/40 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-forest/40 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-forest/40 uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-forest/40 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage/10">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-sage-light/20 transition-colors duration-150 cursor-pointer"
                  onClick={() => router.push(`/products/${product.id}`)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-light to-sage/30 flex items-center justify-center text-lg shrink-0">
                        {product.images?.[0] ? '🖼' : '📦'}
                      </div>
                      <span className="text-sm font-semibold text-forest">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-forest">{product.price.toLocaleString()} FCFA</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${product.stock > 0 ? 'text-emerald' : 'text-red-500'}`}>{product.stock}</span>
                  </td>
                  <td className="px-6 py-4"><span className={statusBadge(product.status)}>{product.status}</span></td>
                  <td className="px-6 py-4 text-sm text-forest/50">{product.category}</td>
                  <td className="px-6 py-4 text-sm text-forest/40">{new Date(product.createdAt).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}