'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  maxWidth?: string
}

export function Dialog({ open, onClose, title, description, children, maxWidth = 'max-w-lg' }: DialogProps) {
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxWidth} rounded-lg border border-border bg-surface p-6 shadow-xl`}
      >
        <div className="mb-4">
          <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
        {children}
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 rounded-md p-1 text-muted hover:bg-paper hover:text-ink"
        >
          ✕
        </button>
      </div>
    </div>,
    document.body
  )
}
