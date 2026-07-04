'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

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

    const channel = supabase
      .channel('commandes-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: process.env.NEXT_PUBLIC_DB_SCHEMA || 'public', table: 'commandes' },
        (payload) => {
          const nouvelleCommande = payload.new as { id: string; prix_final: number }
          setNotifications((prev) => [
            {
              id: nouvelleCommande.id,
              message: `Nouvelle commande reçue — ${nouvelleCommande.prix_final} MAD`,
              createdAt: new Date(),
            },
            ...prev,
          ])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="relative rounded-md p-2 text-gray-600 hover:bg-gray-100"
      >
        🔔
        {notifications.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-72 rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-gray-400">Aucune notification pour l&apos;instant.</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="border-b border-gray-100 p-3 text-sm text-gray-700 last:border-0">
                  {n.message}
                  <p className="mt-0.5 text-xs text-gray-400">
                    {n.createdAt.toLocaleTimeString('fr-FR')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}