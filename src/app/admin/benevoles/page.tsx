"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/lib/userStore"

type Benevole = {
  id: string
  prenom: string | null
  nom: string | null
  email: string
  heures: number
}

export default function ListeBenevolesPage() {
  const { user, loading } = useUser()
  const [benevoles, setBenevoles] = useState<Benevole[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    const fetchBenevoles = async () => {
      // 1) Charger les bénévoles
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, prenom, nom, email")
        .eq("role", "benevole")
        .order("prenom", { ascending: true })

      if (usersError) {
        console.error("Erreur chargement bénévoles :", usersError.message)
        setLoadingData(false)
        return
      }

      // 2) Charger toutes les inscriptions + events liés
      const { data: inscriptions, error: inscError } = await supabase
        .from("inscriptions")
        .select("user_id, events(heure_debut, heure_fin)")

      if (inscError) {
        console.error("Erreur chargement inscriptions :", inscError.message)
        setLoadingData(false)
        return
      }

      // 3) Calcul des heures pour chaque bénévole
      const heuresParBenevole: Record<string, number> = {}

      inscriptions?.forEach((i) => {
        // ⚠️ Correction : gérer le cas array
        const ev = Array.isArray(i.events) ? i.events[0] : i.events
        if (!ev) return
        const [h1, m1] = ev.heure_debut.split(":").map(Number)
        const [h2, m2] = ev.heure_fin.split(":").map(Number)
        const duree = (h2 * 60 + m2 - (h1 * 60 + m1)) / 60

        heuresParBenevole[i.user_id] = (heuresParBenevole[i.user_id] || 0) + duree
      })

      // 4) Fusionner bénévoles + heures
      const formatted: Benevole[] = (users || []).map((u) => ({
        ...u,
        heures: heuresParBenevole[u.id] || 0,
      }))

      setBenevoles(formatted)
      setLoadingData(false)
    }

    fetchBenevoles()
  }, [])

  if (loading || loadingData) return <div className="p-4">Chargement...</div>
  if (!user || user.role !== "admin") {
    return <div className="p-4 text-red-600 font-semibold">Accès interdit</div>
  }

  return (
    <main className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-[#1e5363] mb-6">Liste des bénévoles</h1>

      {benevoles.length === 0 ? (
        <p className="text-gray-500 italic">Aucun bénévole inscrit pour le moment.</p>
      ) : (
        <table className="w-full border border-[#aad7d4] rounded-xl shadow bg-white">
          <thead className="bg-[#aad7d4]/40">
            <tr>
              <th className="p-2 text-left">Prénom</th>
              <th className="p-2 text-left">Nom</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Heures totales</th>
            </tr>
          </thead>
          <tbody>
            {benevoles.map((b) => (
              <tr key={b.id} className="border-t border-[#aad7d4] hover:bg-gray-50">
                <td className="p-2">{b.prenom ?? "-"}</td>
                <td className="p-2">{b.nom ?? "-"}</td>
                <td className="p-2">{b.email}</td>
                <td className="p-2 font-semibold">{b.heures.toFixed(1)} h</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}
