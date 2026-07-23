import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { getDashboardStats } from '@/lib/dashboard-stats'
import { formatCurrency } from '@/lib/format'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: profil }, stats] = await Promise.all([
    supabase.from('profils_vendeurs').select('devise').eq('id', user.id).single(),
    getDashboardStats(user.id),
  ])
  const devise = profil?.devise ?? 'USD'

  return (
    <div>
      <PageHeader title="Vue d'ensemble" description="Aperçu de l'activité de votre boutique." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Chiffre d'affaires"
          value={formatCurrency(stats.chiffreAffaires, devise)}
          hint="Commandes livrées"
        />
        <StatCard label="Commandes" value={String(stats.nombreCommandes)} />
        <StatCard
          label="Taux de conversion"
          value={stats.tauxConversion > 0 ? `${stats.tauxConversion}%` : '—'}
          hint="Disponible en Phase 3 (tracking UTM)"
        />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 font-display text-base font-semibold text-ink">Top produits</h2>
        {stats.topProduits.length === 0 ? (
          <EmptyState
            icon="📈"
            title="Pas encore de ventes"
            description="Vos produits les plus vendus apparaîtront ici une fois des commandes livrées."
          />
        ) : (
          <div className="space-y-2">
            {stats.topProduits.map((p, i) => (
              <div
                key={p.nom}
                className="flex items-center justify-between rounded-md border border-border bg-surface p-3 text-sm"
              >
                <span className="font-medium text-ink">
                  {i + 1}. {p.nom}
                </span>
                <span className="text-muted">
                  {p.ventes} vendu{p.ventes > 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}