'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { CommandeStatusMenu } from '@/components/dashboard/CommandeStatusMenu'
import { CommandeDetailDialog } from '@/components/dashboard/CommandeDetailDialog'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonTable } from '@/components/ui/Skeleton'
import { Table, TableHead, Th, TableBody, Tr, Td } from '@/components/ui/Table'
import { useToast } from '@/components/ui/Toaster'
import { formatCurrency } from '@/lib/format'
import { CANAL_ORIGINE_LABELS, STATUT_COMMANDE_LABELS } from '@/types/commande'
import type { CommandeAvecRelations, StatutCommande } from '@/types/commande'

const SELECT_COMMANDE = '*, produits!inner(id, nom, vendeur_id), clients(*), livreurs(*)'

export default function CommandesPage() {
  const supabase = createClient()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [commandes, setCommandes] = useState<CommandeAvecRelations[]>([])
  const [devise, setDevise] = useState('USD')

  const [search, setSearch] = useState('')
  const [statutFilter, setStatutFilter] = useState<StatutCommande | 'toutes'>('toutes')
  const [selected, setSelected] = useState<CommandeAvecRelations | null>(null)

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const [{ data: profil }, { data, error }] = await Promise.all([
        supabase.from('profils_vendeurs').select('devise').eq('id', user.id).single(),
        supabase
          .from('commandes')
          .select(SELECT_COMMANDE)
          .eq('produits.vendeur_id', user.id)
          .order('created_at', { ascending: false }),
      ])

      if (profil?.devise) setDevise(profil.devise)
      if (error) {
        toast(`Impossible de charger les commandes : ${error.message}`, 'error')
      } else {
        setCommandes((data as unknown as CommandeAvecRelations[]) ?? [])
      }
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const commandesFiltrees = useMemo(() => {
    const q = search.trim().toLowerCase()
    return commandes.filter((c) => {
      const matchStatut = statutFilter === 'toutes' || c.statut === statutFilter
      const matchSearch =
        !q ||
        c.clients?.nom.toLowerCase().includes(q) ||
        c.produits?.nom.toLowerCase().includes(q)
      return matchStatut && matchSearch
    })
  }, [commandes, search, statutFilter])

  function handleUpdated(updated: CommandeAvecRelations) {
    setCommandes((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
    setSelected((prev) => (prev?.id === updated.id ? updated : prev))
  }

  async function handleStatutChangeInline(commande: CommandeAvecRelations, next: StatutCommande) {
    const { data, error } = await supabase
      .from('commandes')
      .update({ statut: next })
      .eq('id', commande.id)
      .select(SELECT_COMMANDE)
      .single()
    if (error) {
      toast(`Échec mise à jour : ${error.message}`, 'error')
      return
    }
    if (data) handleUpdated(data as unknown as CommandeAvecRelations)
  }

  return (
    <div>
      <PageHeader
        title="Commandes"
        description="Suivez, confirmez et dispatchez les commandes reçues via WhatsApp et la boutique."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Rechercher un client ou un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-xs"
          />
          <Select
            value={statutFilter}
            onChange={(e) => setStatutFilter(e.target.value as StatutCommande | 'toutes')}
            className="sm:max-w-[180px]"
          >
            <option value="toutes">Tous les statuts</option>
            {Object.entries(STATUT_COMMANDE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={5} cols={6} />
      ) : commandesFiltrees.length === 0 ? (
        <EmptyState
          icon="📦"
          title={commandes.length === 0 ? 'Aucune commande pour l\'instant' : 'Aucun résultat'}
          description={
            commandes.length === 0
              ? 'Les commandes passées via WhatsApp ou votre boutique apparaîtront ici.'
              : 'Essayez une autre recherche ou un autre statut.'
          }
        />
      ) : (
        <Table>
          <TableHead>
            <Th>Client</Th>
            <Th>Produit</Th>
            <Th>Prix</Th>
            <Th>Statut</Th>
            <Th>Livreur</Th>
            <Th>Canal</Th>
            <Th>Date</Th>
            <Th />
          </TableHead>
          <TableBody>
            {commandesFiltrees.map((commande) => (
              <Tr key={commande.id}>
                <Td>
                  <span className="font-medium">{commande.clients?.nom ?? '—'}</span>
                  {commande.clients?.telephone && (
                    <span className="block text-xs text-muted">{commande.clients.telephone}</span>
                  )}
                </Td>
                <Td className="text-muted">{commande.produits?.nom ?? '—'}</Td>
                <Td>{formatCurrency(commande.prix_final, devise)}</Td>
                <Td>
                  <CommandeStatusMenu
                    statut={commande.statut}
                    onChange={(next) => handleStatutChangeInline(commande, next)}
                  />
                </Td>
                <Td className="text-muted">{commande.livreurs?.nom ?? '—'}</Td>
                <Td className="text-muted">
                  {CANAL_ORIGINE_LABELS[commande.canal_origine ?? 'autre'] ?? commande.canal_origine}
                </Td>
                <Td className="text-muted">{new Date(commande.created_at).toLocaleDateString('fr-FR')}</Td>
                <Td>
                  <Button variant="ghost" size="sm" onClick={() => setSelected(commande)}>
                    Détails
                  </Button>
                </Td>
              </Tr>
            ))}
          </TableBody>
        </Table>
      )}

      <CommandeDetailDialog
        open={!!selected}
        onClose={() => setSelected(null)}
        commande={selected}
        devise={devise}
        onUpdated={handleUpdated}
      />
    </div>
  )
}