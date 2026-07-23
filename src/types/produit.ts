export type StatutProduit = 'brouillon' | 'publie' | 'archive'

export const STATUT_PRODUIT_LABELS: Record<StatutProduit, string> = {
  brouillon: 'Brouillon',
  publie: 'Publié',
  archive: 'Archivé',
}

export interface Produit {
  id: string
  vendeur_id: string
  nom: string
  description: string | null
  prix: number
  prix_plancher: number | null
  categorie: string | null
  stock: number
  statut: StatutProduit
  created_at: string
  updated_at: string
}

export interface Media {
  id: string
  produit_id: string
  url: string
  type: string
  format: string | null
  est_genere_ia: boolean
  created_at: string
}

export interface ProduitAvecMedias extends Produit {
  medias: Media[]
}