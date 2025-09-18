"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/lib/userStore"

type Event = {
  id: string
  titre: string
  date: string
  heure_debut: string
  heure_fin: string
}

export default function MesHeuresPage() {
  const { user } = useUser()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("inscriptions")
        .select("events(id, titre, date, heure_debut, heure_fin)")
        .eq("user_id", user.id)

      if (error) {
        console.error("Erreur : ", error.message)
        return
      }

      // ✅ correction : gérer le cas array et caster en Event[]
      const eventsOnly = data
        .map((i) => (Array.isArray(i.events) ? i.events[0] : i.events))
        .filter(Boolean) as Event[]

      setEvents(eventsOnly)
      setLoading(false)
    }

    fetchEvents()
  }, [user])

  const calculerDuree = (heureDebut: string, heureFin: string): number => {
    if (!heureDebut || !heureFin) return 0
    const [h1, m1] = heureDebut.split(":").map(Number)
    const [h2, m2] = heureFin.split(":").map(Number)
    return (h2 * 60 + m2 - (h1 * 60 + m1)) / 60
  }

  const totalHeures = events.reduce(
    (acc, ev) => acc + calculerDuree(ev.heure_debut, ev.heure_fin),
    0
  )

  if (!user || user.role !== "benevole") {
    return <div className="p-4 text-red-600">Page réservée aux bénévoles.</div>
  }

  if (loading) return <div className="p-4">Chargement...</div>

  return (
    <main className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-[#1e5363]">
        Mes heures de bénévolat
      </h1>

      <p className="mb-6 text-lg">
        ⏱️ Total d’heures effectuées :{" "}
        <span className="font-semibold">{totalHeures.toFixed(1)} h</span>
      </p>

      {events.length === 0 ? (
        <p className="text-gray-600">Aucune inscription trouvée.</p>
      ) : (
        <div className="space-y-4">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="border border-[#aad7d4] rounded-xl p-4 bg-white shadow"
            >
              <h2 className="text-xl font-semibold text-[#1e5363]">{ev.titre}</h2>
              <p className="text-sm text-gray-600">
                {ev.date} — {ev.heure_debut} à {ev.heure_fin}
              </p>
              <p className="mt-2 text-gray-800">
                Durée : {calculerDuree(ev.heure_debut, ev.heure_fin)} h
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
