import { createServerSupabaseClient } from '@/lib/supabase-server'

export interface DashboardStats {
  chiffreAffaires: number
  nombreCommandes: number
  tauxConversion: number
  topProduits: { nom: string; ventes: number }[]
}

/**
 * Récupère les statistiques du vendeur connecté.
 * Phase 1 : retourne des données réelles mais simples (pas encore de calcul
 * de taux de conversion complexe, qui viendra avec le tracking UTM en Phase 3).
 */
export async function getDashboardStats(vendeurId: string): Promise<DashboardStats> {
  const supabase = await createServerSupabaseClient()

  const { data: produits } = await supabase
    .from('produits')
    .select('id, nom')
    .eq('vendeur_id', vendeurId)

  const produitIds = produits?.map((p) => p.id) ?? []

  const { data: commandes } = await supabase
    .from('commandes')
    .select('produit_id, prix_final, quantite, statut')
    .in('produit_id', produitIds.length > 0 ? produitIds : ['00000000-0000-0000-0000-000000000000'])

  const commandesLivrees = commandes?.filter((c) => c.statut === 'livree') ?? []

  const chiffreAffaires = commandesLivrees.reduce(
    (total, c) => total + Number(c.prix_final) * c.quantite,
    0
  )

  const ventesParProduit = new Map<string, number>()
  commandesLivrees.forEach((c) => {
    ventesParProduit.set(c.produit_id, (ventesParProduit.get(c.produit_id) ?? 0) + c.quantite)
  })

  const topProduits = Array.from(ventesParProduit.entries())
    .map(([produitId, ventes]) => ({
      nom: produits?.find((p) => p.id === produitId)?.nom ?? 'Produit inconnu',
      ventes,
    }))
    .sort((a, b) => b.ventes - a.ventes)
    .slice(0, 5)

  return {
    chiffreAffaires,
    nombreCommandes: commandes?.length ?? 0,
    tauxConversion: 0, // Sera calculé en Phase 3 avec le tracking UTM (vues vitrine / commandes)
    topProduits,
  }
}