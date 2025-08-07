"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const handleReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3000/update-password", // change pour ton domaine
    })

    if (error) {
      setMessage("Erreur : " + error.message)
    } else {
      setMessage("📧 Un email de réinitialisation a été envoyé.")
    }
  }

  return (
    <main className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mot de passe oublié</h1>
      <input
        type="email"
        placeholder="Ton email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-full rounded"
      />
      <button onClick={handleReset} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
        Réinitialiser
      </button>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </main>
  )
}
