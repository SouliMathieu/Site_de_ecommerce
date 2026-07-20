'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { ProductFormDialog } from '@/components/dashboard/ProductFormDialog'
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { StatutBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonTable } from '@/components/ui/Skeleton'
import { Table, TableHead, Th, TableBody, Tr, Td } from '@/components/ui/Table'
import { useToast } from '@/components/ui/Toaster'
import { formatCurrency } from '@/lib/format'
import { STATUT_PRODUIT_LABELS } from '@/types/produit'
import type { ProduitAvecMedias, StatutProduit } from '@/types/produit'

export default function CataloguePage() {
  const supabase = createClient()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [produits, setProduits] = useState<ProduitAvecMedias[]>([])
  const [vendeurId, setVendeurId] = useState<string | null>(null)
  const [devise, setDevise] = useState('USD')

  const [search, setSearch] = useState('')
  const [statutFilter, setStatutFilter] = useState<StatutProduit | 'tous'>('tous')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduit, setEditingProduit] = useState<ProduitAvecMedias | null>(null)
  const [deletingProduit, setDeletingProduit] = useState<ProduitAvecMedias | null>(null)

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      setVendeurId(user.id)

      const [{ data: profil }, { data: produitsData, error }] = await Promise.all([
        supabase.from('profils_vendeurs').select('devise').eq('id', user.id).single(),
        supabase
          .from('produits')
          .select('*, medias(*)')
          .eq('vendeur_id', user.id)
          .order('created_at', { ascending: false }),
      ])

      if (profil?.devise) setDevise(profil.devise)
      if (error) {
        toast(`Impossible de charger le catalogue : ${error.message}`, 'error')
      } else {
        setProduits((produitsData as ProduitAvecMedias[]) ?? [])
      }
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const produitsFiltres = useMemo(() => {
    return produits.filter((p) => {
      const matchStatut = statutFilter === 'tous' || p.statut === statutFilter
      const matchSearch = p.nom.toLowerCase().includes(search.trim().toLowerCase())
      return matchStatut && matchSearch
    })
  }, [produits, search, statutFilter])

  function handleSaved(produit: ProduitAvecMedias) {
    setProduits((prev) => {
      const exists = prev.some((p) => p.id === produit.id)
      return exists ? prev.map((p) => (p.id === produit.id ? produit : p)) : [produit, ...prev]
    })
    setEditingProduit(produit)
  }

  async function handleDelete() {
    if (!deletingProduit) return
    const { error } = await supabase.from('produits').delete().eq('id', deletingProduit.id)
    if (error) {
      toast(`Échec suppression : ${error.message}`, 'error')
      return
    }
    setProduits((prev) => prev.filter((p) => p.id !== deletingProduit.id))
    toast('Produit supprimé.')
    setDeletingProduit(null)
  }

  return (
    <div>
      <PageHeader
        title="Catalogue"
        description="Gérez vos produits, visuels et fiches produits générés par l'IA."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-xs"
          />
          <Select
            value={statutFilter}
            onChange={(e) => setStatutFilter(e.target.value as StatutProduit | 'tous')}
            className="sm:max-w-[180px]"
          >
            <option value="tous">Tous les statuts</option>
            {Object.entries(STATUT_PRODUIT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <Button
          onClick={() => {
            setEditingProduit(null)
            setDialogOpen(true)
          }}
        >
          + Nouveau produit
        </Button>
      </div>

      {loading ? (
        <SkeletonTable rows={5} cols={5} />
      ) : produitsFiltres.length === 0 ? (
        <EmptyState
          icon="🛍️"
          title={produits.length === 0 ? 'Aucun produit pour l\'instant' : 'Aucun résultat'}
          description={
            produits.length === 0
              ? 'Ajoutez votre premier produit pour commencer à vendre.'
              : 'Essayez une autre recherche ou un autre statut.'
          }
          actionLabel={produits.length === 0 ? 'Ajouter un produit' : undefined}
          onAction={produits.length === 0 ? () => setDialogOpen(true) : undefined}
        />
      ) : (
        <Table>
          <TableHead>
            <Th>Produit</Th>
            <Th>Catégorie</Th>
            <Th>Prix</Th>
            <Th>Stock</Th>
            <Th>Statut</Th>
            <Th />
          </TableHead>
          <TableBody>
            {produitsFiltres.map((produit) => (
              <Tr key={produit.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border bg-paper">
                      {produit.medias[0] && (
                        // eslint-disable-next-line @next/next/no-img-element -- URL Supabase Storage dynamique
                        <img
                          src={produit.medias[0].url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <span className="font-medium">{produit.nom}</span>
                  </div>
                </Td>
                <Td className="text-muted">{produit.categorie ?? '—'}</Td>
                <Td>{formatCurrency(produit.prix, devise)}</Td>
                <Td className={produit.stock === 0 ? 'text-danger' : ''}>{produit.stock}</Td>
                <Td>
                  <StatutBadge statut={produit.statut} label={STATUT_PRODUIT_LABELS[produit.statut]} />
                </Td>
                <Td>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingProduit(produit)
                        setDialogOpen(true)
                      }}
                    >
                      Modifier
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeletingProduit(produit)}>
                      Supprimer
                    </Button>
                  </div>
                </Td>
              </Tr>
            ))}
          </TableBody>
        </Table>
      )}

      {vendeurId && (
        <ProductFormDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          vendeurId={vendeurId}
          produit={editingProduit}
          onSaved={handleSaved}
        />
      )}

      <ConfirmDialog
        open={!!deletingProduit}
        onClose={() => setDeletingProduit(null)}
        onConfirm={handleDelete}
        title="Supprimer ce produit ?"
        description={`"${deletingProduit?.nom}" et ses photos seront définitivement supprimés.`}
        confirmLabel="Supprimer"
      />
    </div>
  )
}