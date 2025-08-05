"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/lib/userStore"

export default function ModifierEvenementPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const params = useParams()
  const eventId = params?.id as string

  const [form, setForm] = useState({
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
    const fetchEvent = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single()

      if (error || !data) {
        alert("Erreur chargement de l'événement")
        router.push("/evenements")
        return
      }

      setForm(data)
      setLoadingData(false)
    }

    if (eventId) fetchEvent()
  }, [eventId, router]) // ✅ ajouté router comme dépendance

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement
    const { name, value, type } = target

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? target.checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from("events").update(form).eq("id", eventId)

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
          value={form.nb_places}
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
