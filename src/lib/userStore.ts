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

const STORAGE_KEY = 'user_info_v1'

function readCache(): UserInfo | null {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
    if (!raw) return null
    return JSON.parse(raw) as UserInfo
  } catch {
    return null
  }
}

function writeCache(user: UserInfo | null) {
  try {
    if (typeof window === 'undefined') return
    if (user) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignorer erreurs de stockage (mode privé, quota, etc.)
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
  const [user, setUser] = useState<UserInfo | null>(() => readCache())
  const [loading, setLoading] = useState<boolean>(true)
  const mountedRef = useRef<boolean>(false)

  useEffect(() => {
    mountedRef.current = true

    const hydrateFromSession = async () => {
      try {
        // 1) Session actuelle (Supabase restaure depuis localStorage si persistSession=true)
        const { data: sessionData } = await supabase.auth.getSession()
        let session = sessionData.session

        // Fallback si nécessaire
        if (!session) {
          const { data: userData } = await supabase.auth.getUser()
          if (userData?.user) {
            session = {
              access_token: '',
              token_type: 'bearer',
              user: userData.user,
              expires_in: 0,
              expires_at: 0,
              refresh_token: '',
              provider_token: null,
              provider_refresh_token: null,
            }
          }
        }

        if (!session?.user) {
          if (!mountedRef.current) return
          setUser((prev) => {
            if (prev !== null) writeCache(null)
            return null
          })
          setLoading(false)
          return
        }

        const authUser = session.user
        const uid = authUser.id
        const email = authUser.email ?? ''
        const info = await fetchUserInfoFromDB(uid, email, authUser.user_metadata)

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
        if (mountedRef.current) {
          setUser(null)
          writeCache(null)
        }
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    }

    // Affichage immédiat si cache présent, sinon spinner le temps d’hydrater
    const cached = readCache()
    if (!cached) {
      setLoading(true)
    } else {
      setUser(cached)
      setLoading(false)
    }

    hydrateFromSession()

    // 2) Suivre les changements d’auth (login / logout / refresh)
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      try {
        if (!mountedRef.current) return

        if (!newSession?.user) {
          setUser(null)
          writeCache(null)
          return
        }

        const u = newSession.user
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
        setUser(null)
        writeCache(null)
      } finally {
        // ✅ évite de rester bloqué sur "Chargement…" après un changement d’état
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
