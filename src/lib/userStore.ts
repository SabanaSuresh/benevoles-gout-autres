'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase'

export type Role = 'admin' | 'benevole' | null

export type UserInfo = {
  id: string
  email: string
  role: Role
  prenom: string
  nom: string
}

/**
 * ✅ On stocke un cache avec timestamp pour éviter le "cache fantôme" (admin affiché partout)
 * et éviter le blocage "Chargement..." si le cache est incohérent.
 */
type CachedUser = {
  ts: number
  user: UserInfo
}

const STORAGE_KEY = 'user_info_v2'
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24h

function readCache(): UserInfo | null {
  try {
    if (typeof window === 'undefined') return null
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as CachedUser
    if (!parsed?.user || typeof parsed.ts !== 'number') return null

    // ✅ Expiration du cache
    if (Date.now() - parsed.ts > CACHE_MAX_AGE_MS) {
      window.localStorage.removeItem(STORAGE_KEY)
      return null
    }

    return parsed.user
  } catch {
    return null
  }
}

function writeCache(user: UserInfo | null) {
  try {
    if (typeof window === 'undefined') return
    if (user) {
      const payload: CachedUser = { ts: Date.now(), user }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // ignore
  }
}

function readMetaString(meta: unknown, key: string): string {
  if (meta && typeof meta === 'object' && key in (meta as Record<string, unknown>)) {
    const val = (meta as Record<string, unknown>)[key]
    return typeof val === 'string' ? val : ''
  }
  return ''
}

function readMetaRole(meta: unknown): Role {
  if (meta && typeof meta === 'object' && 'role' in (meta as Record<string, unknown>)) {
    const val = (meta as Record<string, unknown>)['role']
    if (val === 'admin' || val === 'benevole') return val
  }
  return null
}

async function fetchUserInfoFromDB(
  userId: string,
  fallbackEmail: string,
  metadata?: unknown
): Promise<UserInfo | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role, prenom, nom')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Erreur récupération utilisateur (DB) :', error.message)
      return null
    }

    // Pas encore de ligne dans public.users → fallback metadata Auth
    if (!data) {
      return {
        id: userId,
        email: fallbackEmail,
        role: readMetaRole(metadata),
        prenom: readMetaString(metadata, 'prenom'),
        nom: readMetaString(metadata, 'nom'),
      }
    }

    return {
      id: userId,
      email: fallbackEmail,
      role: data.role,
      prenom: data.prenom ?? '',
      nom: data.nom ?? '',
    }
  } catch (e) {
    console.error('fetchUserInfoFromDB exception :', e)
    return null
  }
}

export function useUser() {
  // ✅ on peut afficher vite le cache, mais on revalide avec Supabase juste après
  const [user, setUser] = useState<UserInfo | null>(() => readCache())
  const [loading, setLoading] = useState<boolean>(true)
  const mountedRef = useRef<boolean>(false)

  useEffect(() => {
    mountedRef.current = true

    const hydrateFromSession = async () => {
      try {
        // ✅ La vérité vient de Supabase : si pas de session => on purge le cache !
        const { data, error } = await supabase.auth.getSession()
        if (error) console.warn('getSession error:', error.message)

        const sessionUser = data?.session?.user
        if (!sessionUser) {
          writeCache(null)
          if (mountedRef.current) setUser(null)
          return
        }

        const info = await fetchUserInfoFromDB(
          sessionUser.id,
          sessionUser.email ?? '',
          sessionUser.user_metadata
        )

        if (!mountedRef.current) return
        if (info) {
          setUser(info)
          writeCache(info)
        } else {
          setUser(null)
          writeCache(null)
        }
      } catch (e) {
        console.error('hydrateFromSession exception :', e)
        writeCache(null)
        if (mountedRef.current) setUser(null)
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    }

    // Affiche vite le cache, mais garde loading=true tant que Supabase n'a pas validé
    const cached = readCache()
    if (cached) setUser(cached)
    setLoading(true)

    hydrateFromSession()

    // ✅ écouter login/logout/refresh
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      try {
        if (!mountedRef.current) return

        const u = newSession?.user
        if (!u) {
          writeCache(null)
          setUser(null)
          return
        }

        const info = await fetchUserInfoFromDB(u.id, u.email ?? '', u.user_metadata)
        if (info) {
          setUser(info)
          writeCache(info)
        } else {
          setUser(null)
          writeCache(null)
        }
      } catch (e) {
        console.error('onAuthStateChange exception :', e)
        writeCache(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    })

    return () => {
      mountedRef.current = false
      sub?.subscription?.unsubscribe()
    }
  }, [])

  return { user, loading }
}
