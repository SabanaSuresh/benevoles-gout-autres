"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/lib/userStore"
import { useRouter } from "next/navigation"

type Event = {
  id: string
  titre: string
  date: string
  heure_debut: string
  heure_fin: string
  description: string
  urgence: boolean
  annule: boolean
}

export default function MesInscriptionsPage() {
  const { user } = useUser()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchInscriptions = async () => {
      const { data, error } = await supabase
        .from("inscriptions")
        .select("events(id, titre, date, heure_debut, heure_fin, description, urgence, annule)")
        .eq("user_id", user.id)

      if (error) {
        console.error("Erreur : ", error.message)
        return
      }

      const eventsOnly = data.map((i) => i.events).filter(Boolean)
      setEvents(eventsOnly)
      setLoading(false)
    }

    fetchInscriptions()
  }, [user])

  const handleDesinscription = async (eventId: string) => {
    const { error } = await supabase
      .from("inscriptions")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", user?.id)

    if (error) {
      alert("Erreur lors de la désinscription : " + error.message)
    } else {
      alert("Désinscription réussie.")
      router.refresh()
    }
  }

  if (!user || user.role !== "benevole") {
    return <div className="p-4 text-red-600">Page réservée aux bénévoles.</div>
  }

  if (loading) return <div className="p-4">Chargement...</div>

  return (
    <main className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-title mb-6 text-[#1e5363]">Mes inscriptions</h1>

      {events.length === 0 ? (
        <p className="text-gray-600">Tu n’es inscrit à aucun événement pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="border border-[#aad7d4] rounded-xl p-4 shadow bg-white">
              <h2 className="text-xl font-semibold text-[#1e5363]">{event.titre}</h2>
              <p className="text-sm text-gray-600">
                {event.date} — {event.heure_debut} à {event.heure_fin}
              </p>
              <p className="mt-2 text-gray-800">{event.description}</p>
              {event.urgence && <p className="text-red-600 font-bold mt-2">🚨 Urgence</p>}
              {event.annule && <p className="text-red-500 font-bold mt-2">❌ Événement annulé</p>}
              <button onClick={() => handleDesinscription(event.id)}
                className="mt-4 px-4 py-1 bg-[#f1887c] text-white rounded hover:bg-[#e06f6a]">
                Me désinscrire
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
