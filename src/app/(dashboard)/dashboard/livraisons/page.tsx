'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { LivreurFormDialog } from '@/components/dashboard/LivreurFormDialog'
import { DeliveryTimeline } from '@/components/dashboard/DeliveryTimeline'
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { StatutBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonTable } from '@/components/ui/Skeleton'
import { Table, TableHead, Th, TableBody, Tr, Td } from '@/components/ui/Table'
import { useToast } from '@/components/ui/Toaster'
import { formatCurrency } from '@/lib/format'
import type { CommandeAvecRelations, Livreur, StatutCommande } from '@/types/commande'

const SELECT_COMMANDE = '*, produits!inner(id, nom, vendeur_id), clients(*), livreurs(*)'

const PROCHAIN_STATUT: Partial<Record<StatutCommande, StatutCommande>> = {
  dispatchee: 'recuperee',
  recuperee: 'livree',
}

const LABEL_ACTION: Partial<Record<StatutCommande, string>> = {
  dispatchee: 'Marquer récupérée',
  recuperee: 'Marquer livrée',
}

export default function LivraisonsPage() {
  const supabase = createClient()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [livreurs, setLivreurs] = useState<Livreur[]>([])
  const [livraisons, setLivraisons] = useState<CommandeAvecRelations[]>([])
  const [devise, setDevise] = useState('USD')

  const [livreurDialogOpen, setLivreurDialogOpen] = useState(false)
  const [editingLivreur, setEditingLivreur] = useState<Livreur | null>(null)
  const [echecCible, setEchecCible] = useState<CommandeAvecRelations | null>(null)

  useEffect(() => {
    async function loadAll() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const [{ data: profil }, { data: livreursData }, { data: livraisonsData, error }] = await Promise.all([
        supabase.from('profils_vendeurs').select('devise').eq('id', user.id).single(),
        supabase.from('livreurs').select('*').order('score_performance', { ascending: false }),
        supabase
          .from('commandes')
          .select(SELECT_COMMANDE)
          .eq('produits.vendeur_id', user.id)
          .not('livreur_id', 'is', null)
          .in('statut', ['dispatchee', 'recuperee'])
          .order('created_at', { ascending: false }),
      ])

      if (profil?.devise) setDevise(profil.devise)
      setLivreurs((livreursData as Livreur[]) ?? [])
      if (error) {
        toast(`Impossible de charger les livraisons : ${error.message}`, 'error')
      } else {
        setLivraisons((livraisonsData as unknown as CommandeAvecRelations[]) ?? [])
      }
      setLoading(false)
    }
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const livreursDisponibles = useMemo(() => livreurs.filter((l) => l.disponible), [livreurs])

  async function handleAvancerStatut(commande: CommandeAvecRelations) {
    const suivant = PROCHAIN_STATUT[commande.statut]
    if (!suivant) return
    const { error } = await supabase.from('commandes').update({ statut: suivant }).eq('id', commande.id)
    if (error) {
      toast(`Échec mise à jour : ${error.message}`, 'error')
      return
    }
    toast(suivant === 'livree' ? 'Commande livrée 🎉' : 'Statut mis à jour.')
    if (suivant === 'livree') {
      setLivraisons((prev) => prev.filter((c) => c.id !== commande.id))
    } else {
      setLivraisons((prev) => prev.map((c) => (c.id === commande.id ? { ...c, statut: suivant } : c)))
    }
  }

  async function handleMarquerEchouee() {
    if (!echecCible) return
    const { error } = await supabase
      .from('commandes')
      .update({ statut: 'echouee' })
      .eq('id', echecCible.id)
    if (error) {
      toast(`Échec mise à jour : ${error.message}`, 'error')
      return
    }
    toast('Livraison marquée comme échouée.')
    setLivraisons((prev) => prev.filter((c) => c.id !== echecCible.id))
    setEchecCible(null)
  }

  async function handleToggleDisponible(livreur: Livreur) {
    const { data, error } = await supabase
      .from('livreurs')
      .update({ disponible: !livreur.disponible })
      .eq('id', livreur.id)
      .select()
      .single()
    if (error) {
      toast(`Échec mise à jour : ${error.message}`, 'error')
      return
    }
    setLivreurs((prev) => prev.map((l) => (l.id === livreur.id ? (data as Livreur) : l)))
  }

  function handleLivreurSaved(livreur: Livreur) {
    setLivreurs((prev) => {
      const exists = prev.some((l) => l.id === livreur.id)
      return exists ? prev.map((l) => (l.id === livreur.id ? livreur : l)) : [livreur, ...prev]
    })
  }

  return (
    <div>
      <PageHeader
        title="Livraisons"
        description="Répertoire des livreurs et suivi des livraisons en cours."
      />

      {/* Livraisons en cours */}
      <div className="mb-8">
        <h2 className="mb-3 font-display text-base font-semibold text-ink">Livraisons en cours</h2>
        {loading ? (
          <SkeletonTable rows={3} cols={4} />
        ) : livraisons.length === 0 ? (
          <EmptyState
            icon="🚚"
            title="Aucune livraison en cours"
            description="Les commandes dispatchées à un livreur apparaîtront ici."
          />
        ) : (
          <div className="space-y-3">
            {livraisons.map((commande) => (
              <div
                key={commande.id}
                className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-ink">
                    {commande.produits?.nom} — {formatCurrency(commande.prix_final, devise)}
                  </p>
                  <p className="text-sm text-muted">
                    {commande.clients?.nom} · {commande.clients?.telephone} · Livreur :{' '}
                    {commande.livreurs?.nom ?? '—'}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <DeliveryTimeline statut={commande.statut} />
                  <div className="flex gap-2">
                    {PROCHAIN_STATUT[commande.statut] && (
                      <Button size="sm" onClick={() => handleAvancerStatut(commande)}>
                        {LABEL_ACTION[commande.statut]}
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setEchecCible(commande)}>
                      Échec
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Répertoire livreurs */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-ink">
            Répertoire des livreurs{' '}
            <span className="font-body text-sm font-normal text-muted">
              ({livreursDisponibles.length} disponible{livreursDisponibles.length > 1 ? 's' : ''} sur{' '}
              {livreurs.length})
            </span>
          </h2>
          <Button
            size="sm"
            onClick={() => {
              setEditingLivreur(null)
              setLivreurDialogOpen(true)
            }}
          >
            + Nouveau livreur
          </Button>
        </div>

        {loading ? (
          <SkeletonTable rows={3} cols={5} />
        ) : livreurs.length === 0 ? (
          <EmptyState
            icon="🛵"
            title="Aucun livreur enregistré"
            description="Ajoutez un livreur pour pouvoir dispatcher vos commandes."
            actionLabel="Ajouter un livreur"
            onAction={() => setLivreurDialogOpen(true)}
          />
        ) : (
          <Table>
            <TableHead>
              <Th>Nom</Th>
              <Th>Téléphone</Th>
              <Th>Zones</Th>
              <Th>Score</Th>
              <Th>Disponibilité</Th>
              <Th />
            </TableHead>
            <TableBody>
              {livreurs.map((livreur) => (
                <Tr key={livreur.id}>
                  <Td className="font-medium">{livreur.nom}</Td>
                  <Td className="text-muted">{livreur.telephone}</Td>
                  <Td className="text-muted">
                    {Array.isArray(livreur.zones_couverture) && livreur.zones_couverture.length > 0
                      ? (livreur.zones_couverture as string[]).join(', ')
                      : '—'}
                  </Td>
                  <Td className="text-muted">{livreur.score_performance ?? '—'}</Td>
                  <Td>
                    <button onClick={() => handleToggleDisponible(livreur)}>
                      <StatutBadge
                        statut={livreur.disponible ? 'disponible' : 'occupe'}
                        label={livreur.disponible ? 'Disponible' : 'Indisponible'}
                      />
                    </button>
                  </Td>
                  <Td>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingLivreur(livreur)
                        setLivreurDialogOpen(true)
                      }}
                    >
                      Modifier
                    </Button>
                  </Td>
                </Tr>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <LivreurFormDialog
        open={livreurDialogOpen}
        onClose={() => setLivreurDialogOpen(false)}
        livreur={editingLivreur}
        onSaved={handleLivreurSaved}
      />

      <ConfirmDialog
        open={!!echecCible}
        onClose={() => setEchecCible(null)}
        onConfirm={handleMarquerEchouee}
        title="Marquer cette livraison comme échouée ?"
        description="Le client sera considéré comme non livré (absent, refus...). Cette action déclenchera le workflow de re-livraison plus tard."
        confirmLabel="Marquer échouée"
      />
    </div>
  )
}