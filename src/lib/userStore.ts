'use client'
import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export type Role = 'admin' | 'benevole' | null

export type UserInfo = {
  id: string
  email: string
  role: Role
  prenom: string
  nom: string
}

export function useUser() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      let userId = sessionData.session?.user?.id
      let email = sessionData.session?.user?.email

      // ✅ Fallback si session pas encore attachée
      if (!userId || !email) {
        const { data: userData } = await supabase.auth.getUser()
        userId = userData.user?.id
        email = userData.user?.email
      }

      if (!userId) {
        setUser(null)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('role, prenom, nom')
        .eq('id', userId)
        .maybeSingle()

      if (error || !data) {
        console.error('Erreur récupération utilisateur :', error?.message || 'Utilisateur introuvable')
        setUser(null)
      } else {
        setUser({
          id: userId,
          email: email ?? '',
          role: data.role,
          prenom: data.prenom,
          nom: data.nom,
        })
      }

      setLoading(false)
    }

    getUser()
  }, [])

  return { user, loading }
}
