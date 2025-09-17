"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/lib/userStore"

type Benevole = {
  id: string
  prenom: string | null
  nom: string | null
  email: string
}

export default function ListeBenevolesPage() {
  const { user, loading } = useUser()
  const [benevoles, setBenevoles] = useState<Benevole[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    const fetchBenevoles = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, prenom, nom, email")
        .eq("role", "benevole")
        .order("prenom", { ascending: true })

      if (error) {
        console.error("Erreur chargement bénévoles :", error.message)
      } else {
        setBenevoles(data || [])
      }
      setLoadingData(false)
    }

    fetchBenevoles()
  }, [])

  if (loading || loadingData) return <div className="p-4">Chargement...</div>
  if (!user || user.role !== "admin") {
    return <div className="p-4 text-red-600 font-semibold">Accès interdit</div>
  }

  return (
    <main className="p-4 max-w-3xl mx-auto">
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
            </tr>
          </thead>
          <tbody>
            {benevoles.map((b) => (
              <tr key={b.id} className="border-t border-[#aad7d4] hover:bg-gray-50">
                <td className="p-2">{b.prenom ?? "-"}</td>
                <td className="p-2">{b.nom ?? "-"}</td>
                <td className="p-2">{b.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}
