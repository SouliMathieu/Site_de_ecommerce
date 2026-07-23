'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS } from './nav-items'

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    onClose()
    // Ferme le tiroir automatiquement après une navigation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex lg:hidden">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} aria-hidden />
      <aside className="relative flex h-full w-72 flex-col bg-ink shadow-xl">
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
          <span className="font-display text-lg font-semibold text-white">Ma Boutique</span>
          <button
            onClick={onClose}
            aria-label="Fermer le menu"
            className="rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent text-ink'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </div>,
    document.body
  )
}
