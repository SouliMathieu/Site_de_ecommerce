'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useClickOutside } from '@/hooks/useClickOutside'

export function UserMenu() {
  const router = useRouter()
  const supabase = createClient()
  const ref = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [nomBoutique, setNomBoutique] = useState<string | null>(null)

  useClickOutside(ref, () => setIsOpen(false))

  useEffect(() => {
    async function loadProfil() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email ?? null)

      const { data: profil } = await supabase
        .from('profils_vendeurs')
        .select('nom_boutique')
        .eq('id', user.id)
        .single()
      setNomBoutique(profil?.nom_boutique ?? null)
    }
    loadProfil()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initiale = (nomBoutique ?? email ?? '?').charAt(0).toUpperCase()

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 hover:bg-paper"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-display text-sm font-semibold text-white">
          {initiale}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium leading-tight text-ink">
            {nomBoutique ?? 'Ma boutique'}
          </span>
          <span className="block text-xs leading-tight text-muted">{email ?? ''}</span>
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-56 rounded-md border border-border bg-surface py-1 shadow-lg">
          <Link
            href="/dashboard/parametres"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm text-ink hover:bg-paper"
          >
            ⚙️ Paramètres
          </Link>
          <div className="my-1 border-t border-border" />
          <button
            onClick={handleLogout}
            className="block w-full px-4 py-2 text-left text-sm text-danger hover:bg-paper"
          >
            ↪️ Déconnexion
          </button>
        </div>
      )}
    </div>
  )
}
