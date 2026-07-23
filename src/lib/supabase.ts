import { createBrowserClient } from '@supabase/ssr'

/**
 * Client Supabase pour les Client Components (navigateur).
 * Utilise le schéma personnel défini dans NEXT_PUBLIC_DB_SCHEMA
 * pour isoler le travail de chaque développeur pendant la Phase 1.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: {
        schema: process.env.NEXT_PUBLIC_DB_SCHEMA || 'public',
      },
    }
  )
}