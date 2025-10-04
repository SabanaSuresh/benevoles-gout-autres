"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleUpdate = async () => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      alert("Erreur : " + error.message)
      return
    }
    alert("Mot de passe mis à jour.")
    router.push("/login")
  }

  return (
    <main className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Nouveau mot de passe</h1>
      <input
        type="password"
        id="new-password"
        name="new-password"
        placeholder="Nouveau mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-full rounded"
        autoComplete="new-password"  // ✅ pour que le navigateur propose d’enregistrer le nouveau mdp
      />
      <button
        onClick={handleUpdate}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
      >
        Mettre à jour
      </button>
    </main>
  )
}
