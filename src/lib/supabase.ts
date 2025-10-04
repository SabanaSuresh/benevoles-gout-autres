'use client'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // ✅ Garde la session en localStorage => plus besoin de retaper l’email/mot de passe
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // multi-onglets (facultatif mais pratique)
    flowType: 'pkce',          // recommandé côté navigateur
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    // storageKey: 'sb-auth-token', // facultatif : clé custom si besoin
  },
})
