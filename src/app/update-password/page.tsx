"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
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
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id="new-password"
          name="new-password"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 pr-12 w-full rounded"
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute inset-y-0 right-3 my-auto p-1 rounded hover:bg-gray-100"
          aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          aria-pressed={showPassword}
          title={showPassword ? "Masquer" : "Afficher"}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <button
        onClick={handleUpdate}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
      >
        Mettre à jour
      </button>
    </main>
  )
}
