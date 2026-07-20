export type StatutCommande =
  | 'nouvelle'
  | 'confirmee'
  | 'dispatchee'
  | 'recuperee'
  | 'livree'
  | 'echouee'
  | 'annulee'

export const STATUT_COMMANDE_LABELS: Record<StatutCommande, string> = {
  nouvelle: 'Nouvelle',
  confirmee: 'Confirmée',
  dispatchee: 'Dispatchée',
  recuperee: 'Récupérée',
  livree: 'Livrée',
  echouee: 'Échouée',
  annulee: 'Annulée',
}

export const STATUT_COMMANDE_ORDRE: StatutCommande[] = [
  'nouvelle',
  'confirmee',
  'dispatchee',
  'recuperee',
  'livree',
]

export type CanalOrigine = 'whatsapp' | 'boutique' | 'autre'

export const CANAL_ORIGINE_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  boutique: 'Boutique',
  autre: 'Autre',
}

export interface Client {
  id: string
  nom: string
  telephone: string
  ville: string | null
  quartier: string | null
  created_at: string
}
/** Client enrichi des statistiques de commandes calculées pour CE vendeur. */
export interface ClientAvecStats extends Client {
  nombreCommandes: number
  totalDepense: number
  derniereCommande: string | null
}
export interface Livreur {
  id: string
  nom: string
  telephone: string
  zones_couverture: unknown | null
  tarif_base: number | null
  score_performance: number | null
  disponible: boolean
  created_at: string
}

export interface Commande {
  id: string
  produit_id: string
  client_id: string
  livreur_id: string | null
  quantite: number
  prix_final: number
  statut: StatutCommande
  canal_origine: string | null
  created_at: string
  updated_at: string
}

export interface CommandeAvecRelations extends Commande {
  produits: { id: string; nom: string; vendeur_id: string } | null
  clients: Client | null
  livreurs: Livreur | null
}