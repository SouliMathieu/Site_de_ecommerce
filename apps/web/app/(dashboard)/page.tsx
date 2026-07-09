'use client';

import { useQuery } from '@tanstack/react-query';
import { Package, PackageCheck, ShoppingCart, TrendingUp } from 'lucide-react';
import type { StatsOverviewDto } from '@vente/shared';
import { StatCard } from '@/components/dashboard/stat-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { apiFetch } from '@/lib/api-client';
import { formatMoney } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

export default function OverviewPage() {
  const { user } = useAuth();
  const currency = user?.currency ?? 'XOF';
  const { data, isLoading } = useQuery({
    queryKey: ['stats-overview'],
    queryFn: () => apiFetch<StatsOverviewDto>('/stats/overview'),
  });

  const maxSales = Math.max(1, ...(data?.topProducts.map((p) => p.sales) ?? [1]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Vue d&apos;ensemble</h1>
        <p className="text-sm text-muted-foreground">Aperçu de l&apos;activité de votre boutique.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[86px] w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Chiffre d'affaires" value={formatMoney(data?.revenue ?? 0, currency)} icon={TrendingUp} accent="success" />
          <StatCard label="Commandes" value={String(data?.ordersCount ?? 0)} icon={ShoppingCart} accent="primary" />
          <StatCard
            label="Taux de conversion"
            value={`${Math.round((data?.conversionRate ?? 0) * 100)}%`}
            icon={PackageCheck}
            accent="warning"
          />
          <StatCard label="Produits au catalogue" value={String(data?.productsCount ?? 0)} icon={Package} accent="primary" />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Produits les plus vendus</CardTitle>
          <CardDescription>Basé sur les commandes confirmées.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <Skeleton className="h-32 w-full" />}
          {!isLoading && (data?.topProducts.length ?? 0) === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aucune vente confirmée pour le moment.
            </p>
          )}
          {data?.topProducts.map((product) => (
            <div key={product.productId} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{product.name}</span>
                <span className="text-muted-foreground">{product.sales} vendu(s)</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(product.sales / maxSales) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
