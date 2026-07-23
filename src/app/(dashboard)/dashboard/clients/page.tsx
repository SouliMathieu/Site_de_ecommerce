'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { ClientFormDialog } from '@/components/dashboard/ClientFormDialog'
import { ClientDetailDialog } from '@/components/dashboard/ClientDetailDialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonTable } from '@/components/ui/Skeleton'
import { Table, TableHead, Th, TableBody, Tr, Td } from '@/components/ui/Table'
import { useToast } from '@/components/ui/Toaster'
import { formatCurrency } from '@/lib/format'
import type { Client, ClientAvecStats } from '@/types/commande'

export default function ClientsPage() {
  const supabase = createClient()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [vendeurId, setVendeurId] = useState<string | null>(null)
  const [devise, setDevise] = useState('USD')
  const [clients, setClients] = useState<ClientAvecStats[]>([])

  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [detailClient, setDetailClient] = useState<ClientAvecStats | null>(null)

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

      const [{ data: profil }, { data: commandes, error }] = await Promise.all([
        supabase.from('profils_vendeurs').select('devise').eq('id', user.id).single(),
        supabase
          .from('commandes')
          .select('client_id, prix_final, created_at, clients(*), produits!inner(vendeur_id)')
          .eq('produits.vendeur_id', user.id),
      ])

      if (profil?.devise) setDevise(profil.devise)
      if (error) {
        toast(`Impossible de charger les clients : ${error.message}`, 'error')
        setLoading(false)
        return
      }

      // Agrège les commandes par client pour obtenir nb commandes / total dépensé / dernière commande.
      const parClient = new Map<string, ClientAvecStats>()
      for (const commande of (commandes as unknown as {
        client_id: string
        prix_final: number
        created_at: string
        clients: Client | null
      }[]) ?? []) {
        if (!commande.clients) continue
        const existant = parClient.get(commande.client_id)
        if (existant) {
          existant.nombreCommandes += 1
          existant.totalDepense += commande.prix_final
          if (commande.created_at > (existant.derniereCommande ?? '')) {
            existant.derniereCommande = commande.created_at
          }
        } else {
          parClient.set(commande.client_id, {
            ...commande.clients,
            nombreCommandes: 1,
            totalDepense: commande.prix_final,
            derniereCommande: commande.created_at,
          })
        }
      }

      setClients(
        Array.from(parClient.values()).sort(
          (a, b) => (b.derniereCommande ?? '').localeCompare(a.derniereCommande ?? '')
        )
      )
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clientsFiltres = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return clients
    return clients.filter((c) => c.nom.toLowerCase().includes(q) || c.telephone.includes(q))
  }, [clients, search])

  function handleClientSaved(client: Client) {
    setClients((prev) => {
      const exists = prev.some((c) => c.id === client.id)
      if (exists) {
        return prev.map((c) => (c.id === client.id ? { ...c, ...client } : c))
      }
      // Nouveau client créé manuellement : pas encore de commande associée.
      return [{ ...client, nombreCommandes: 0, totalDepense: 0, derniereCommande: null }, ...prev]
    })
  }

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Les clients ayant commandé vos produits, avec leur historique."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Rechercher un client par nom ou téléphone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Button
          onClick={() => {
            setEditingClient(null)
            setDialogOpen(true)
          }}
        >
          + Nouveau client
        </Button>
      </div>

      {loading ? (
        <SkeletonTable rows={5} cols={5} />
      ) : clientsFiltres.length === 0 ? (
        <EmptyState
          icon="👥"
          title={clients.length === 0 ? 'Aucun client pour l\'instant' : 'Aucun résultat'}
          description={
            clients.length === 0
              ? 'Vos clients apparaîtront ici dès leur première commande.'
              : 'Essayez une autre recherche.'
          }
        />
      ) : (
        <Table>
          <TableHead>
            <Th>Client</Th>
            <Th>Localisation</Th>
            <Th>Commandes</Th>
            <Th>Total dépensé</Th>
            <Th>Dernière commande</Th>
            <Th />
          </TableHead>
          <TableBody>
            {clientsFiltres.map((client) => (
              <Tr key={client.id}>
                <Td>
                  <span className="font-medium">{client.nom}</span>
                  <span className="block text-xs text-muted">{client.telephone}</span>
                </Td>
                <Td className="text-muted">
                  {[client.quartier, client.ville].filter(Boolean).join(', ') || '—'}
                </Td>
                <Td>{client.nombreCommandes}</Td>
                <Td>{formatCurrency(client.totalDepense, devise)}</Td>
                <Td className="text-muted">
                  {client.derniereCommande
                    ? new Date(client.derniereCommande).toLocaleDateString('fr-FR')
                    : '—'}
                </Td>
                <Td>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setDetailClient(client)}>
                      Détails
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingClient(client)
                        setDialogOpen(true)
                      }}
                    >
                      Modifier
                    </Button>
                  </div>
                </Td>
              </Tr>
            ))}
          </TableBody>
        </Table>
      )}

      <ClientFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        client={editingClient}
        onSaved={handleClientSaved}
      />

      {vendeurId && (
        <ClientDetailDialog
          open={!!detailClient}
          onClose={() => setDetailClient(null)}
          client={detailClient}
          vendeurId={vendeurId}
          devise={devise}
        />
      )}
    </div>
  )
}