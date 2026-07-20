'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type ToastTone = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  tone: ToastTone
}

interface ToastContextValue {
  toast: (message: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TONE_CLASSES: Record<ToastTone, string> = {
  success: 'border-success/30 bg-white text-success',
  error: 'border-danger/30 bg-white text-danger',
  info: 'border-border bg-white text-ink',
}

const TONE_ICON: Record<ToastTone, string> = {
  success: '✅',
  error: '⚠️',
  info: 'ℹ️',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [mounted, setMounted] = useState(false)

  // Le portail ne doit être créé qu'après l'hydratation côté client,
  // jamais pendant le rendu initial (SSR n'a pas de `document`).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const toast = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, tone }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {mounted &&
        createPortal(
          <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
            {toasts.map((t) => (
              <div
                key={t.id}
                className={`flex items-center gap-2 rounded-md border px-4 py-3 text-sm font-medium shadow-lg ${TONE_CLASSES[t.tone]}`}
              >
                <span>{TONE_ICON[t.tone]}</span>
                {t.message}
              </div>
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast doit être utilisé à l\'intérieur de <ToastProvider>')
  return ctx
}