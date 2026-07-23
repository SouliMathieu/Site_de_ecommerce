'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { formatCurrency } from '@/lib/format'

interface Notification {
  id: string
  message: string
  createdAt: Date
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let produitIdsDuVendeur = new Set<string>()
    let devise = 'USD'
    let channel: ReturnType<typeof supabase.channel> | null = null

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: produits }, { data: profil }] = await Promise.all([
        supabase.from('produits').select('id').eq('vendeur_id', user.id),
        supabase.from('profils_vendeurs').select('devise').eq('id', user.id).single(),
      ])

      produitIdsDuVendeur = new Set((produits ?? []).map((p) => p.id as string))
      devise = profil?.devise ?? 'USD'
      if (produitIdsDuVendeur.size === 0) return

      channel = supabase
        .channel('commandes-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: process.env.NEXT_PUBLIC_DB_SCHEMA || 'public',
            table: 'commandes',
            // Filtre côté serveur : ne reçoit que les commandes sur les produits de ce vendeur.
            // Vient en complément des policies RLS (defense-in-depth), pas en remplacement.
            filter: `produit_id=in.(${Array.from(produitIdsDuVendeur).join(',')})`,
          },
          async (payload) => {
            const nouvelleCommande = payload.new as {
              id: string
              produit_id: string
              prix_final: number
            }

            // Double vérification côté client, au cas où le filtre serveur serait contourné.
            if (!produitIdsDuVendeur.has(nouvelleCommande.produit_id)) return

            const { data: produit } = await supabase
              .from('produits')
              .select('nom')
              .eq('id', nouvelleCommande.produit_id)
              .single()

            setNotifications((prev) => [
              {
                id: nouvelleCommande.id,
                message: `Nouvelle commande — ${produit?.nom ?? 'Produit'} — ${formatCurrency(nouvelleCommande.prix_final, devise)}`,
                createdAt: new Date(),
              },
              ...prev,
            ])
          }
        )
        .subscribe()
    }

    init()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="relative rounded-md p-2 text-muted hover:bg-paper hover:text-ink"
      >
        🔔
        {notifications.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger font-mono text-[10px] font-medium text-white">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-72 rounded-md border border-border bg-surface shadow-lg">
          <div className="border-b border-border px-3 py-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted">
              Notifications
            </p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-muted">Aucune notification pour l&apos;instant.</p>
            ) : (
              notifications.map((n, i) => (
                <div
                  key={n.id}
                  className="relative border-b border-border p-3 text-sm text-ink last:border-0"
                >
                  <p>{n.message}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted">
                    {n.createdAt.toLocaleTimeString('fr-FR')}
                  </p>
                  {i < notifications.length - 1 && (
                    <div
                      className="absolute inset-x-3 bottom-0 h-px"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(to right, var(--color-border) 0, var(--color-border) 3px, transparent 3px, transparent 7px)',
                      }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}