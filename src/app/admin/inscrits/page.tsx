"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/lib/userStore"

export default function ListeInscritsPage() {
  const { user, loading } = useUser()
  type Event = {
    id: number
    titre: string
    date: string
    heure_debut: string
    heure_fin: string
    description: string
    nb_places: number | null
    urgence: boolean
    annule: boolean
    inscriptions?: any[] // ou à affiner si tu veux
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
              prenom,
              nom
            )
          )
        `)
        .order("date", { ascending: true })

      if (error) {
        console.error("Erreur chargement :", error.message)
      } else {
        setEvents(data || [])
      }
    }

    fetchData()
  }, [])

  if (loading) return <div className="p-4">Chargement...</div>
  if (!user || user.role !== "admin") {
    return <div className="p-4 text-red-600 font-semibold">Accès interdit</div>
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

          {event.inscriptions.length === 0 ? (
            <p className="text-gray-500 italic">Aucun inscrit</p>
          ) : (
            <ul className="list-disc list-inside text-sm text-gray-800">
              {event.inscriptions.map((inscription) => (
                <li key={inscription.id}>
                  {inscription.users
                    ? `${inscription.users.prenom} ${inscription.users.nom}`
                    : "Utilisateur inconnu"}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </main>
  )
}
