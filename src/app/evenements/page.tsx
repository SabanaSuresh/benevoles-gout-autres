"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/lib/userStore"
import { useRouter } from "next/navigation"

type User = {
  id: string
  email: string
  nom: string
  prenom: string
}

type Inscription = {
  id: string
  users: User | null
}

type Event = {
  id: string
  titre: string
  date: string
  heure_debut: string
  heure_fin: string
  description: string
  nb_places: number | null
  urgence: boolean
  annule: boolean
  inscriptions: Inscription[]
}

export default function EvenementsPage() {
  const { user, loading: loadingUser } = useUser()
  const [events, setEvents] = useState<Event[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*, inscriptions(*, users(*))")
        .order("date", { ascending: true })

      if (error) {
        console.error("Erreur chargement events :", error)
      } else {
        setEvents(data || [])
      }
      setLoadingEvents(false)
    }

    fetchEvents()
  }, [])

  const handleInscription = async (eventId: string) => {
    if (!user) return

    // Vérifier si l'utilisateur est déjà inscrit
    const { data: existingInscription, error: checkError } = await supabase
      .from("inscriptions")
      .select("*")
      .eq("event_id", eventId)
      .eq("user_id", user.id)

    if (checkError) {
      alert("Erreur lors de la vérification de l'inscription : " + checkError.message)
      return
    }

    if (existingInscription && existingInscription.length > 0) {
      alert("Vous êtes déjà inscrit à cet événement.")
      return
    }

    const { error } = await supabase
      .from("inscriptions")
      .insert({ event_id: eventId, user_id: user.id })

    if (error) {
      alert("Erreur lors de l'inscription : " + error.message)
    } else {
      alert("Inscription confirmée.")
      router.refresh()
    }
  }

  const handleDesinscription = async (eventId: string) => {
    const { error } = await supabase
      .from("inscriptions")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", user?.id)

    if (error) {
      alert("Erreur lors de la désinscription : " + error.message)
    } else {
      alert("Désinscription confirmée.")
      router.refresh()
    }
  }

  if (loadingUser || loadingEvents) return <div className="p-4">Chargement...</div>

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Événements à venir</h1>

      {user && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm">
            Connecté en tant que : <strong>{user.prenom} {user.nom}</strong> ({user.role})
          </p>
        </div>
      )}

      <div className="space-y-4">
        {events.map((event) => {
          const inscriptionsCount = event.inscriptions?.length || 0
          const isLimiteActive = event.nb_places !== null && event.nb_places > 0
          const isComplet = isLimiteActive && inscriptionsCount >= (event.nb_places ?? 0)
          const dejaInscrit = event.inscriptions?.some((i) => i.users?.id === user?.id)

          return (
            <div
              key={event.id}
              className={`border rounded-xl p-4 shadow transition ${
                event.annule ? "opacity-50 line-through" : ""
              } ${event.urgence ? "border-[#f1887c] bg-[#fff5f5]" : "border-gray-300 bg-white"}`}
            >
              <h2 className="text-xl font-semibold text-[#1e5363]">{event.titre}</h2>
              <p className="text-sm text-gray-600">
                {event.date} — {event.heure_debut} à {event.heure_fin}
              </p>
              <p className="mt-2 text-gray-800">{event.description}</p>
              <p className="mt-1 text-sm font-medium">
                {isLimiteActive
                  ? `${(event.nb_places ?? 0) - inscriptionsCount} place(s) restante(s) sur ${event.nb_places}`
                  : "Places illimitées"}
              </p>
              {event.urgence && (
                <p className="text-[#f1887c] font-bold mt-1">🚨 Urgence</p>
              )}
              {event.annule && (
                <p className="text-red-500 font-bold mt-1"> Événement annulé</p>
              )}

              {/* BOUTONS BÉNÉVOLE */}
              {user?.role === "benevole" && !event.annule && (
                <div className="mt-3">
                  {dejaInscrit ? (
                    <button
                      onClick={() => handleDesinscription(event.id)}
                      className="bg-[#f1887c] hover:bg-[#f9bd9b] text-white font-semibold px-5 py-2 rounded-xl"
                    >
                      Me désinscrire
                    </button>
                  ) : isComplet ? (
                    <span className="text-red-600 font-semibold">Complet</span>
                  ) : (
                    <button
                      onClick={() => handleInscription(event.id)}
                      className="bg-[#3e878e] hover:bg-[#aad7d4] text-white font-semibold px-5 py-2 rounded-xl"
                    >
                      Je m'inscris
                    </button>
                  )}
                </div>
              )}

              {/* ACTIONS ADMIN */}
              {user?.role === "admin" && !event.annule && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={async () => {
                      const confirm = window.confirm("Confirmer l'annulation de cet événement ?")
                      if (!confirm) return

                      const { error } = await supabase
                        .from("events")
                        .update({ annule: true })
                        .eq("id", event.id)

                      if (error) {
                        alert("Erreur : " + error.message)
                      } else {
                        alert("Événement annulé.")
                        router.refresh()
                      }
                    }}
                    className="bg-[#f1887c] hover:bg-[#f9bd9b] text-white font-semibold px-5 py-2 rounded-xl"
                  >
                    Annuler
                  </button>

                  <a
                    href={`/admin/modifier/${event.id}`}
                    className="appearance-none inline-block bg-[#3e878e] hover:bg-[#2e6e70] text-white no-underline font-semibold px-5 py-2 rounded-xl transition duration-200"
                    style={{ textDecoration: "none" }}
                  >
                    Modifier
                  </a>
                </div>
              )}

              {/* LISTE DES INSCRITS */}
              {event.inscriptions && event.inscriptions.length > 0 && (
                <div className="mt-4 text-sm">
                  <p className="font-semibold mb-1">Bénévoles inscrits :</p>
                  <ul className="list-disc list-inside">
                    {event.inscriptions.map((inscription) => (
                      <li key={inscription.id}>
                        {inscription.users
                          ? `${inscription.users.prenom} ${inscription.users.nom}`
                          : "Utilisateur inconnu"}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}
