"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/lib/userStore"

export default function ListeInscritsPage() {
  const { user, loading } = useUser()

  type User = {
    email: string
    nom: string | null
    prenom: string | null
  }

  type Inscription = {
    id: string
    users: User | null
  }

  type Event = {
    id: string
    titre: string
    date: string
    inscriptions: Inscription[]
  }

  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          id,
          titre,
          date,
          inscriptions (
            id,
            users (
              email,
              prenom,
              nom
            )
          )
        `)
        .order("date", { ascending: true })

      if (error) {
        console.error("Erreur chargement :", error.message)
      } else {
        const formatted: Event[] = (data ?? []).map((event) => {
          return {
            id: event.id,
            titre: event.titre,
            date: event.date,
            inscriptions: (event.inscriptions ?? []).map((i): Inscription => {
              const user = Array.isArray(i.users)
                ? i.users[0]
                : (i.users as User | null)

              return {
                id: i.id,
                users: user,
              }
            }),
          }
        })

        setEvents(formatted)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div className="p-4">Chargement...</div>

  if (!user || user.role !== "admin") {
    return <div className="p-4 text-red-600 font-semibold">Accès interdit</div>
  }

  const renderUsers = (users: User | null) => {
    if (!users) {
      return <li className="text-gray-400 italic">Utilisateur inconnu</li>
    }
    return <li>{users.prenom} {users.nom}</li>
  }

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-title text-[#1e5363] font-bold mb-6">
        Liste des inscrits
      </h1>

      {events.map((event) => (
        <div
          key={event.id}
          className="mb-6 border border-[#aad7d4] rounded-xl p-4 bg-white shadow"
        >
          <h2 className="text-xl font-semibold text-[#1e5363]">{event.titre}</h2>
          <p className="text-sm text-gray-600 mb-2">{event.date}</p>

          {event.inscriptions.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-gray-800">
              {event.inscriptions.map((inscription) => (
                <>{renderUsers(inscription.users)}</>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">Aucun inscrit</p>
          )}
        </div>
      ))}
    </main>
  )
}
