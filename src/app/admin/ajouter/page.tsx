"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/lib/userStore"

export default function AjouterEvenementPage() {
  const { user, loading } = useUser()
  const router = useRouter()

  const [form, setForm] = useState({
    titre: "",
    date: "",
    heure_debut: "",
    heure_fin: "",
    description: "",
    nb_places: null as number | null,
    urgence: false,
  })

  // ✅ Correction ici
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement
    const { name, value, type } = target

    if (name === "nb_places") {
      const parsed = value === "" ? null : parseInt(value)
      setForm((prev) => ({
        ...prev,
        [name]: isNaN(parsed as number) ? null : parsed,
      }))
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? target.checked : value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (user?.role !== "admin") return

    const { error: insertError } = await supabase.from("events").insert(form)

    if (insertError) {
      alert("Erreur : " + insertError.message)
      return
    }

    // 🔔 Notification à tous les bénévoles
    const { data: benevoles } = await supabase
      .from("users")
      .select("id")
      .eq("role", "benevole")

    if (benevoles) {
      const notifs = benevoles.map((b) => ({
        user_id: b.id,
        message: `Nouvel événement : ${form.titre}`,
        type: "nouvel_evenement",
      }))
      await supabase.from("notifications").insert(notifs)
    }

    alert("Événement ajouté !")
    router.push("/evenements")
  }

  if (loading) return <div className="p-4">Chargement...</div>
  if (!user || user.role !== "admin") {
    return <div className="p-4 text-red-600 font-semibold">Accès réservé à l&apos;admin</div>
  }

  return (
    <main className="p-4 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-[#1e5363] mb-6">Ajouter un événement</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-xl shadow border border-[#aad7d4]">
        <input
          type="text"
          name="titre"
          placeholder="Nom de l’événement"
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
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full border border-[#aad7d4] p-2 rounded"
          required
        />
        <input
          type="number"
          name="nb_places"
          placeholder="Nombre de bénévoles (laisser vide = illimité)"
          value={form.nb_places ?? ""}
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
          Ajouter l’événement
        </button>
      </form>
    </main>
  )
}
