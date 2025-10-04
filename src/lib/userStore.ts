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

async function fetchUserInfoFromDB(userId: string, fallbackEmail: string, metadata?: Record<string, any>): Promise<UserInfo | null> {
  const { data, error } = await supabase
    .from('users')
    .select('role, prenom, nom')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('Erreur récupération utilisateur (DB) :', error.message)
    return null
  }

  // Si pas encore de ligne dans public.users, on tente un fallback via les metadata Auth
  if (!data) {
    const metaPrenom = (metadata?.prenom as string) || ''
    const metaNom = (metadata?.nom as string) || ''
    const metaRole = (metadata?.role as Role) ?? null
    return {
      id: userId,
      email: fallbackEmail,
      role: metaRole,
      prenom: metaPrenom,
      nom: metaNom,
    }
  }

  return {
    id: userId,
    email: fallbackEmail,
    role: data.role,
    prenom: data.prenom ?? '',
    nom: data.nom ?? '',
  }
}

export function useUser() {
  const [user, setUser] = useState<UserInfo | null>(() => readCache())
  const [loading, setLoading] = useState<boolean>(true)
  const mountedRef = useRef<boolean>(false)

  useEffect(() => {
    mountedRef.current = true

    const hydrateFromSession = async () => {
      // 1) Récupérer la session actuelle (Supabase restaure depuis localStorage si persistSession=true côté client)
      const { data: sessionData } = await supabase.auth.getSession()
      let session = sessionData.session

      // Fallback si nécessaire
      if (!session) {
        const { data: userData } = await supabase.auth.getUser()
        if (userData?.user) {
          // Reconstruire une "mini session" utile pour les infos
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
        // Pas connecté
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
      setLoading(false)
    }

    // Charger rapidement depuis le cache (si présent), puis valider via Supabase
    const cached = readCache()
    if (!cached) {
      // pas de cache → on reste en "loading" le temps d’hydrater
      setLoading(true)
    } else {
      // cache présent → on montre tout de suite, puis on rafraîchit en arrière-plan
      setUser(cached)
      setLoading(false)
    }

    hydrateFromSession()

    // 2) Abonnement aux changements d’état Auth (login, logout, refresh)
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      // Quelques events utiles : SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED, SIGNED_OUT
      if (!mountedRef.current) return

      if (!newSession?.user || event === 'SIGNED_OUT') {
        setUser(null)
        writeCache(null)
        return
      }

      const authUser = newSession.user
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
    })

    return () => {
      mountedRef.current = false
      sub?.subscription?.unsubscribe()
    }
  }, [])

  return { user, loading }
}


