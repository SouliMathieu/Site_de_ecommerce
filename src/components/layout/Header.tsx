'use client'

import { useState } from 'react'
import { NotificationBell } from './NotificationBell'
import { UserMenu } from './UserMenu'
import { MobileSidebar } from './MobileSidebar'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
      <button
        onClick={() => setMobileMenuOpen(true)}
        aria-label="Ouvrir le menu"
        className="rounded-md p-2 text-muted hover:bg-paper hover:text-ink lg:hidden"
      >
        ☰
      </button>
      <div className="hidden lg:block" />

      <div className="flex items-center gap-3 sm:gap-4">
        <NotificationBell />
        <div className="h-6 w-px bg-border" />
        <UserMenu />
      </div>

      <MobileSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  )
}
