'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { NotificationBell } from './NotificationBell'

export function Header() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div />
      <div className="flex items-center gap-4">
        <NotificationBell />
        <button
          onClick={handleLogout}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          Déconnexion
        </button>
      </div>
    </header>
  )
}