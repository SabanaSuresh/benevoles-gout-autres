"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/lib/userStore"

type EventForm = {
  titre: string
  date: string
  heure_debut: string
  heure_fin: string
  description: string
  nb_places: number | null
  urgence: boolean
}

export default function ModifierEvenementPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const params = useParams()
  const eventId = (params?.id as string) || ""

  const [form, setForm] = useState<EventForm>({
    titre: "",
    date: "",
    heure_debut: "",
    heure_fin: "",
    description: "",
    nb_places: 0,
    urgence: false,
  })
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!eventId) return
    let mounted = true

    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("titre, date, heure_debut, heure_fin, description, nb_places, urgence")
          .eq("id", eventId)
          .single()

        if (error || !data) {
          alert("Erreur chargement de l'événement")
          router.push("/evenements")
          return
        }

        if (!mounted) return
        setForm({
          titre: data.titre ?? "",
          date: data.date ?? "",
          heure_debut: data.heure_debut ?? "",
          heure_fin: data.heure_fin ?? "",
          description: data.description ?? "",
          nb_places: data.nb_places ?? 0,
          urgence: !!data.urgence,
        })
      } finally {
        if (mounted) setLoadingData(false)
      }
    }

    fetchEvent()
    return () => {
      mounted = false
    }
  }, [eventId, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement
    const { name, value, type, checked } = target

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "nb_places"
          ? value === "" ? null : Number(value)
          : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload: EventForm = {
      ...form,
      nb_places: form.nb_places === null ? null : Number(form.nb_places),
    }

    const { error } = await supabase
      .from("events")
      .update(payload)
      .eq("id", eventId)

    if (error) {
      alert("Erreur : " + error.message)
    } else {
      alert("Événement modifié !")
      router.push("/evenements")
    }
  }

  if (loading || loadingData) return <div className="p-4">Chargement...</div>
  if (!user || user.role !== "admin") return <div className="p-4 text-red-600">Accès refusé</div>

  return (
    <main className="p-4 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-[#1e5363] mb-6">Modifier un événement</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-xl shadow border border-[#aad7d4]">
        <input
          type="text"
          name="titre"
          value={form.titre}
          onChange={handleChange}
          className="w-full border border-[#aad7d4] p-2 rounded"
          required
        />
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="w-full border border-[#aad7d4] p-2 rounded"
          required
        />
        <div className="flex gap-2">
          <input
            type="time"
            name="heure_debut"
            value={form.heure_debut}
            onChange={handleChange}
            className="w-full border border-[#aad7d4] p-2 rounded"
            required
          />
          <input
            type="time"
            name="heure_fin"
            value={form.heure_fin}
            onChange={handleChange}
            className="w-full border border-[#aad7d4] p-2 rounded"
            required
          />
        </div>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full border border-[#aad7d4] p-2 rounded"
          required
        />
        <input
          type="number"
          name="nb_places"
          value={form.nb_places ?? 0}
          onChange={handleChange}
          className="w-full border border-[#aad7d4] p-2 rounded"
          min={0}
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="urgence"
            checked={form.urgence}
            onChange={handleChange}
          />
          <span className="text-sm">🚨 Urgence</span>
        </label>
        <button
          type="submit"
          className="w-full bg-[#1e5363] text-white py-2 rounded hover:bg-[#f1887c]"
        >
          Enregistrer les modifications
        </button>
      </form>
    </main>
  )
}
