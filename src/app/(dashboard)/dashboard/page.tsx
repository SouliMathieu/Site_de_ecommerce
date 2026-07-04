import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getDashboardStats } from '@/lib/dashboard-stats'
import { StatCard } from '@/components/dashboard/StatCard'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const stats = await getDashboardStats(user.id)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Vue d&apos;ensemble</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Chiffre d'affaires"
          value={`${stats.chiffreAffaires.toFixed(2)} MAD`}
          hint="Commandes livrées"
        />
        <StatCard
          label="Commandes"
          value={String(stats.nombreCommandes)}
        />
        <StatCard
          label="Taux de conversion"
          value={`${stats.tauxConversion}%`}
          hint="Disponible dès la Phase 3"
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-medium text-gray-700">Top produits</h2>
        {stats.topProduits.length === 0 ? (
          <p className="mt-3 text-sm text-gray-400">
            Aucune vente pour l&apos;instant. Ajoutez des produits dans le Catalogue pour commencer.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {stats.topProduits.map((p) => (
              <li key={p.nom} className="flex justify-between text-sm">
                <span className="text-gray-700">{p.nom}</span>
                <span className="font-medium text-gray-900">{p.ventes} ventes</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}